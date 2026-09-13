"""Deterministic interpretation of messages (English and Indonesian).

Messages are untrusted evidence: they can only produce the typed facts below.
Any instruction inside a message (for example "pay the release charge") is
classified as ``untrusted_instruction`` and ignored by the forecast.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

MONTHS = {
    name: index
    for index, names in enumerate(
        [
            ("january", "januari"), ("february", "februari"), ("march", "maret"), ("april",),
            ("may", "mei"), ("june", "juni"), ("july", "juli"), ("august", "agustus"),
            ("september",), ("october", "oktober"), ("november",), ("december", "desember"),
        ],
        start=1,
    )
    for name in names
}

AMOUNT_RE = re.compile(r"\b(IDR|INR|EUR|USD|ZAR)\s?(\d[\d,]*(?:\.\d+)?)")
ISO_DATE_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")
LONG_DATE_RE = re.compile(r"\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b")
PERCENT_RE = re.compile(r"(\d+(?:\.\d+)?)\s?%")


@dataclass(frozen=True)
class Fact:
    kind: str
    message_id: str
    user_id: str
    request_id: str
    related_event_id: str
    sent_at: date
    amount: Decimal | None = None
    currency: str | None = None
    effective_date: date | None = None
    percent: Decimal | None = None
    second_amount: Decimal | None = None


# (kind, any-of keyword phrases). Checked in order; first match wins.
RULES: list[tuple[str, tuple[str, ...]]] = [
    ("untrusted_instruction", ("pay the release charge", "bayar biaya pencairan", "pay the processing charge")),
    ("salary_increase", ("salary has increased to", "gaji bulanan anda naik menjadi")),
    ("salary_date_change", ("salary is now expected on", "kini diperkirakan masuk pada")),
    ("next_salary_reduced", ("next salary is reduced to", "gaji berikutnya dikurangi")),
    ("temporary_pay", ("temporary monthly pay is", "gaji bulanan sementara anda adalah")),
    ("base_salary_only", ("confirmed base salary is", "gaji pokok yang dikonfirmasi adalah")),
    ("salary_resumes", ("resumes on", "kembali dibayarkan")),
    ("household_income_ended", ("household employment record has ended", "pendapatan kerja rumah tangga telah berakhir")),
    ("employment_ended", ("your employment has ended", "hubungan kerja anda telah berakhir")),
    ("contract_ended", ("seasonal contract has ended", "kontrak musiman saat ini telah berakhir")),
    ("regular_salary_with_arrears", ("one-time arrears adjustment", "penyesuaian tunggakan satu kali")),
    ("regular_salary_confirmed", ("regular salary for the next payroll", "gaji rutin untuk penggajian berikutnya")),
    ("first_salary", ("first salary", "gaji pertama")),
    ("foreign_salary_confirmed", ("salary credit for", "is confirmed for", "dikonfirmasi untuk")),
    ("invoice_approved", ("approved an invoice payment", "menyetujui pembayaran faktur")),
    ("bonus_pending", ("bonus is still subject", "bonus kuartalan anda masih menunggu")),
    ("commission_pending", ("commission shown for open deals", "komisi dari transaksi")),
    ("gig_payout_pending", ("payout is still pending", "masih tertunda")),
    ("prize_pending", ("prize claim has been verified", "klaim hadiah anda sudah diverifikasi")),
    ("prize_received", ("prize proceeds have reached", "hasil hadiah")),
    ("investment_sale_settled", ("proceeds from your investment sale", "hasil penjualan investasi")),
    ("unrealized_value", ("displayed market value", "displayed value of the investment", "nilai investasi yang ditampilkan")),
    ("reimbursement_one_off", ("reimbursement for your earlier work expense", "penggantian atas biaya kerja")),
    ("internal_transfer", ("transfer between your two accounts", "transfer antara dua rekening")),
    ("refund_pending", ("refund has been initiated", "refund is still processing", "pengembalian dana sudah diproses")),
    ("dispute_pending", ("still being investigated", "masih dalam penyelidikan")),
    ("failed_debit_outstanding", ("previous debit attempt failed", "percobaan debit sebelumnya gagal")),
    ("rent_increase", ("increases monthly rent by", "menaikkan biaya sewa bulanan")),
    ("separate_card_minimums", ("minimum payments due on two separate card", "dua akun kartu")),
    ("foreign_currency_charge", ("charged in a foreign currency", "dikenakan dalam mata uang asing")),
    ("receipt_final_amount", ("receipt has the final", "receipt contains the final", "the receipt has")),
]


def _number(raw: str) -> Decimal:
    return Decimal(raw.replace(",", ""))


def parse_date(text: str) -> date | None:
    iso = ISO_DATE_RE.search(text)
    if iso:
        return date.fromisoformat(iso.group(1))
    for day, month, year in LONG_DATE_RE.findall(text):
        if month.lower() in MONTHS:
            return date(int(year), MONTHS[month.lower()], int(day))
    return None


def classify(text: str) -> str:
    lowered = text.lower()
    for kind, phrases in RULES:
        if any(phrase in lowered for phrase in phrases):
            return kind
    return "other"


def interpret(message: dict[str, str]) -> Fact:
    text = message["message_text"]
    kind = classify(text)
    amounts = AMOUNT_RE.findall(text)
    percent = PERCENT_RE.search(text)
    # A receipt message may also carry a salary confirmation (mixed template).
    if kind == "receipt_final_amount" and amounts and ("salary" in text.lower() or "gaji" in text.lower()):
        kind = "foreign_salary_confirmed"
    return Fact(
        kind=kind,
        message_id=message["message_id"],
        user_id=message["user_id"],
        request_id=message.get("request_id", ""),
        related_event_id=message.get("related_event_id", ""),
        sent_at=date.fromisoformat(message["sent_at"][:10]),
        amount=_number(amounts[0][1]) if amounts else None,
        currency=amounts[0][0] if amounts else None,
        effective_date=parse_date(text),
        percent=Decimal(percent.group(1)) if percent else None,
        second_amount=_number(amounts[1][1]) if len(amounts) > 1 else None,
    )
