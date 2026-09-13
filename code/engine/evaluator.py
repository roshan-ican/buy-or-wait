from __future__ import annotations

from pathlib import Path

from .data import Dataset
from .forecast import ForecastConfig, Forecaster
from .planner import Planner

OUTPUT_COLUMNS = [
    "request_id",
    "amount_safe_to_pay",
    "affordability_status",
    "recommended_payment_method",
    "payment_plan",
    "earliest_date_for_full_payment",
    "spending_changes_needed",
    "decision_explanation",
]


class DecisionEngine:
    """Deterministic decision engine: forecast the next 85 days, then pick the safest eligible plan."""

    def __init__(self, dataset_dir: Path, config: ForecastConfig | None = None):
        self.dataset = Dataset(dataset_dir)
        self.forecaster = Forecaster(self.dataset, config)

    def evaluate_row(self, request: dict[str, str]) -> dict[str, str]:
        profile = self.dataset.profiles[request["user_id"]]
        forecast = self.forecaster.build(request)
        options = self.dataset.options_by_request.get(request["request_id"], [])
        return Planner(request, profile, options, forecast).decide()


def default_engine() -> DecisionEngine:
    return DecisionEngine(Path(__file__).resolve().parents[2] / "dataset")
