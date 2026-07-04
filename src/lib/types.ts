/**
 * types.ts
 * Frontend data models.
 */

export type BuildStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export interface BuildManifest {
  build_id: string;
  schema_version: string;
  kernel_version: string;
  arch: string;
  plugin_paths: string[];
  inline_rules: unknown[];
  enabled_tags: string[];
  stop_on_first_failure: boolean;
  triggered_at: string;
}

export interface AnalysisSummary {
  total_rules: number;
  applicable_rules: number;
  estimated_patch_sites: number;
  compatibility_score: number; // 0.0 - 1.0
  warnings: string[];
  plugins_loaded: string[];
}

export interface AnalysisReport {
  cache_key: string;
  git_url?: string;
  kernel_version: string;
  arch: string;
  plugin_paths: string[];
  summary: AnalysisSummary;
  device_info?: {
    codename: string;
    manufacturer: string;
    model: string;
    supported_devices: string;
  };
  created_at: string;
}

export interface AnalyzeResponse {
  source: "cache" | "fresh" | "mock";
  report: AnalysisReport;
  latest_commit?: {
    hash: string;
    message: string;
  };
  previous_builds?: any[];
}

export interface BuildResponse {
  build_id: string;
  status: BuildStatus;
  triggered_at: string;
  message: string;
  github_error?: string;
}

export interface StatusResponse {
  id: string;
  status: BuildStatus;
  progress_percent?: number;
  current_step?: string;
  logs?: string[];
}
