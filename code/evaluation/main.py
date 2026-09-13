"""Evaluation workflow: regenerate output.csv, check every hard rule, then score against the public examples.

Usage (from the repo root):  python3 code/evaluation/main.py [--verbose] [--gemini]

--gemini adds step 4: Gemini independently reads every message and image and reports disagreements.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CODE = HERE.parent


def step(title: str, *args: str) -> int:
    print(f"\n== {title} ==", flush=True)
    return subprocess.run([sys.executable, *args]).returncode


if __name__ == "__main__":
    verbose = ["--verbose"] if "--verbose" in sys.argv else []
    failed = step("1. Run all requests -> output.csv", str(CODE / "main.py"))
    failed |= step("2. Validate output.csv against the problem-statement rules", str(HERE / "validate_output.py"))
    failed |= step("3. Score against dataset/sample_requests.csv", str(HERE / "score_samples.py"), *verbose)
    if "--gemini" in sys.argv:
        failed |= step("4. Cross-check messages and images with Gemini", str(HERE / "gemini_crosscheck.py"))
    sys.exit(1 if failed else 0)
