import { browserStorage } from '../browserStorage';
import { recordFileAnalysis } from './DecisionHistoryRepository';
import { AnalysisJob, AnalysisSummary, BulkRequestRow, DecisionOutput, PlanTone, ResultRow } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

interface ResultsPayload {
  job: AnalysisJob;
  results: DecisionOutput[];
  summary: { safe: number; caution: number; wait: number; total: number; safe_amount: number };
}

export interface BulkAnalysisRepository {
  upload(file: File): Promise<AnalysisJob>;
  getCurrentJob(): AnalysisJob | null;
  start(): Promise<AnalysisJob>;
  getJobStatus(): Promise<AnalysisJob>;
  getPreviewRows(): Promise<BulkRequestRow[]>;
  getSummary(): Promise<AnalysisSummary>;
  getResultRows(): Promise<ResultRow[]>;
  getResultRow(id: string): Promise<ResultRow | undefined>;
  download(): Promise<void>;
}

export class ApiBulkAnalysisRepository implements BulkAnalysisRepository {
  async upload(file: File): Promise<AnalysisJob> {
    const body = new FormData();
    body.append('file', file);
    const job = await request<AnalysisJob>('/api/v1/analysis/upload', { method: 'POST', body });
    browserStorage.set('current_job', job);
    return job;
  }

  getCurrentJob(): AnalysisJob | null {
    return browserStorage.get<AnalysisJob>('current_job');
  }

  async start(): Promise<AnalysisJob> {
    const current = this.requireCurrentJob();
    const job = await request<AnalysisJob>(`/api/v1/analysis/start/${current.id}`, { method: 'POST' });
    const merged = { ...current, ...job };
    browserStorage.set('current_job', merged);
    return merged;
  }

  async getJobStatus(): Promise<AnalysisJob> {
    const current = this.requireCurrentJob();
    const job = await request<AnalysisJob>(`/api/v1/analysis/status/${current.id}`);
    const merged = { ...current, ...job };
    browserStorage.set('current_job', merged);
    return merged;
  }

  async getPreviewRows(): Promise<BulkRequestRow[]> {
    return (this.requireCurrentJob().preview ?? []).map((row) => ({
      id: row.request_id,
      type: row.request_type,
      amount: row.requested_amount,
      neededBy: row.desired_completion_date,
      status: 'Ready',
    }));
  }

  async getSummary(): Promise<AnalysisSummary> {
    const payload = await this.fetchResults();
    return {
      totalRequests: payload.job.total_rows,
      safeCount: payload.summary.safe,
      cautionCount: payload.summary.caution,
      waitCount: payload.summary.wait,
      totalAnalysedAed: payload.results.reduce((sum, row) => sum + Number(row.requested_amount), 0),
      safeToProceedAed: payload.summary.safe_amount,
      needsChangeCount: payload.summary.caution,
      insights: [
        `${payload.summary.wait} requests have no safe eligible plan inside the 85-day forecast.`,
        `${payload.summary.caution} requests work by waiting or using a supplied payment plan.`,
        `${payload.summary.safe} requests can be paid safely in full now.`,
      ],
    };
  }

  async getResultRows(): Promise<ResultRow[]> {
    return (await this.fetchResults()).results.map(toResultRow);
  }

  async getResultRow(id: string): Promise<ResultRow | undefined> {
    return (await this.getResultRows()).find((row) => row.id === id);
  }

  async download(): Promise<void> {
    const response = await fetch(`${API_URL}/api/v1/analysis/download/${this.requireCurrentJob().id}`);
    if (!response.ok) throw new Error(await errorMessage(response));
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'output.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private requireCurrentJob(): AnalysisJob {
    const job = this.getCurrentJob();
    if (!job) throw new Error('Upload requests.csv to begin.');
    return job;
  }

  private async fetchResults(): Promise<ResultsPayload> {
    const current = this.requireCurrentJob();
    const payload = await request<ResultsPayload>(`/api/v1/analysis/results/${current.id}`);
    browserStorage.set('current_job', { ...current, ...payload.job });
    browserStorage.set(`results.${current.id}`, payload);
    if (payload.job.status.startsWith('completed')) {
      recordFileAnalysis({
        id: current.id,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase(),
        kind: 'file',
        fileName: payload.job.file_name,
        subtitle: `${payload.summary.total} requests analysed`,
        safe: payload.summary.safe,
        caution: payload.summary.caution,
        wait: payload.summary.wait,
      });
    }
    return payload;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(API_URL + path, init); }
  catch { throw new Error('The analysis server is offline. Start FastAPI on port 8000 and try again.'); }
  if (!response.ok) throw new Error(await errorMessage(response));
  return response.json() as Promise<T>;
}

async function errorMessage(response: Response): Promise<string> {
  try { return ((await response.json()) as { detail?: string }).detail ?? `Request failed (${response.status}).`; }
  catch { return `Request failed (${response.status}).`; }
}

function toResultRow(row: DecisionOutput): ResultRow {
  const tone: PlanTone = row.affordability_status === 'affordable_now'
    ? 'positive' : row.affordability_status === 'not_affordable' ? 'danger' : 'caution';
  const safe = Number(row.amount_safe_to_pay);
  const currency = row.currency;
  return {
    id: row.request_id,
    title: row.request_type.replaceAll('_', ' '),
    type: row.request_type,
    tone,
    safeNow: `${currency} ${safe.toLocaleString()}`,
    method: row.recommended_payment_method.replaceAll('_', ' '),
    earliest: row.earliest_date_for_full_payment || '—',
    reason: row.reason,
    detail: {
      requested: `${currency} ${Number(row.requested_amount).toLocaleString()}`,
      inAed: `${currency} ${Number(row.requested_amount).toLocaleString()}`,
      safeNow: `${currency} ${safe.toLocaleString()}`,
      balanceAfter: `${currency} ${(Number(row.current_balance) - safe).toLocaleString()}`,
      headline: row.reason ?? (row.recommended_payment_method === 'not_recommended'
        ? 'Wait before committing to this request.'
        : `Recommended: ${row.recommended_payment_method.replaceAll('_', ' ')}.`),
      explanation: row.decision_explanation,
      footnote: row.spending_changes_needed === 'none'
        ? 'No optional spending changes are required.' : row.spending_changes_needed,
    },
  };
}
