"""Bulk analysis API: upload requests.csv, queue it, and let a background worker evaluate each row."""
from __future__ import annotations

import asyncio
import csv
import io
import uuid
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response

from engine.evaluator import OUTPUT_COLUMNS, default_engine
from engine.planner import short_reason

REQUIRED_COLUMNS = {
    "request_id", "user_id", "request_date", "request_type", "requested_amount",
    "desired_completion_date", "allows_partial_payment", "request_text",
}
engine = default_engine()
queue: asyncio.Queue[str] = asyncio.Queue()
jobs: dict[str, dict[str, Any]] = {}


async def worker() -> None:
    while True:
        job_id = await queue.get()
        job = jobs[job_id]
        job["status"] = "processing"
        try:
            for row in job["rows"]:
                try:
                    result = await asyncio.to_thread(engine.evaluate_row, row)
                    job["results"].append(result)
                    job["completed_rows"] += 1
                except Exception as exc:
                    job["failed_rows"] += 1
                    job["errors"].append({"request_id": row.get("request_id", ""), "message": str(exc)})
                job["queued_rows"] = job["total_rows"] - job["completed_rows"] - job["failed_rows"]
                await asyncio.sleep(0.012)
            job["status"] = "completed" if not job["failed_rows"] else "completed_with_errors"
        finally:
            queue.task_done()


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(worker())
    yield
    task.cancel()


app = FastAPI(title="Buy or Wait bulk agent", version="1.0.0", lifespan=lifespan)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/analysis/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Choose a CSV file.")
    content = await file.read()
    if len(content) > 5_000_000:
        raise HTTPException(413, "CSV files must be smaller than 5 MB.")
    try:
        text = content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        columns = set(reader.fieldnames or [])
        rows = list(reader)
    except (UnicodeDecodeError, csv.Error) as exc:
        raise HTTPException(400, f"Could not read CSV: {exc}") from exc
    missing = sorted(REQUIRED_COLUMNS - columns)
    if missing:
        raise HTTPException(400, f"Missing columns: {', '.join(missing)}")
    if not rows:
        raise HTTPException(400, "The CSV has no request rows.")
    unknown = [row["request_id"] for row in rows if row["user_id"] not in engine.dataset.profiles]
    if unknown:
        raise HTTPException(400, "The server has no financial profile for one or more uploaded rows.")
    job_id = f"job_{uuid.uuid4().hex[:10]}"
    jobs[job_id] = {
        "id": job_id, "file_name": file.filename, "status": "ready", "total_rows": len(rows),
        "queued_rows": len(rows), "completed_rows": 0, "failed_rows": 0, "rows": rows,
        "results": [], "errors": [],
    }
    return public_job(jobs[job_id], include_preview=True)


@app.post("/api/v1/analysis/start/{job_id}")
async def start(job_id: str):
    job = require_job(job_id)
    if job["status"] == "ready":
        job["status"] = "queued"
        await queue.put(job_id)
    return public_job(job)


@app.get("/api/v1/analysis/status/{job_id}")
def status(job_id: str):
    return public_job(require_job(job_id))


@app.get("/api/v1/analysis/results/{job_id}")
def results(job_id: str):
    job = require_job(job_id)
    request_by_id = {row["request_id"]: row for row in job["rows"]}
    enriched = []
    for result in job["results"]:
        request = request_by_id[result["request_id"]]
        profile = engine.dataset.profiles[request["user_id"]]
        enriched.append({
            **result,
            "request_type": request["request_type"],
            "requested_amount": request["requested_amount"],
            "currency": profile["home_currency"],
            "current_balance": profile["current_available_balance"],
            "minimum_balance": profile["minimum_balance_to_keep"],
            "reason": short_reason(result, profile["home_currency"], profile["minimum_balance_to_keep"]),
        })
    return {"job": public_job(job), "results": enriched, "summary": summarize(job)}


@app.get("/api/v1/analysis/download/{job_id}")
def download(job_id: str):
    job = require_job(job_id)
    if job["status"] not in {"completed", "completed_with_errors"}:
        raise HTTPException(409, "Analysis is still running.")
    stream = io.StringIO()
    writer = csv.DictWriter(stream, fieldnames=OUTPUT_COLUMNS)
    writer.writeheader()
    writer.writerows(job["results"])
    return Response(
        stream.getvalue(), media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="output.csv"'},
    )


def require_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Analysis job not found. Upload the file again.")
    return jobs[job_id]


def public_job(job: dict[str, Any], include_preview: bool = False):
    value = {key: job[key] for key in (
        "id", "file_name", "status", "total_rows", "queued_rows", "completed_rows", "failed_rows"
    )}
    if include_preview:
        value["preview"] = job["rows"][:7]
        value["columns"] = list(job["rows"][0])
    return value


def summarize(job: dict[str, Any]):
    counts = {"safe": 0, "caution": 0, "wait": 0}
    for row in job["results"]:
        if row["affordability_status"] == "affordable_now":
            counts["safe"] += 1
        elif row["affordability_status"] == "not_affordable":
            counts["wait"] += 1
        else:
            counts["caution"] += 1
    counts["total"] = len(job["results"])
    counts["safe_amount"] = sum(float(row["amount_safe_to_pay"]) for row in job["results"])
    return counts
