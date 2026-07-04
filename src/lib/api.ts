/**
 * api.ts
 * AKIP API Client — always calls the real production API. No mocks.
 */

import type {
  AnalyzeResponse,
  BuildResponse,
  StatusResponse,
} from "./types";

// Always use the real production API
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "https://api.akip.workers.dev";

/**
 * Parses GitHub URL into owner/repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.replace(/\/$/, "");
  const match = cleaned.match(/github\.com\/([a-zA-Z0-9-._]+)\/([a-zA-Z0-9-._]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

/**
 * 1. Analyze kernel compatibility — real API, real logs, real score
 */
export async function analyzeKernel(
  gitUrl: string,
  arch: string,
  pluginPaths: string[]
): Promise<AnalyzeResponse & { logs?: string[] }> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ git_url: gitUrl, arch, plugin_paths: pluginPaths }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(
      errorData.details || errorData.error || `Server error: ${res.status}`
    );
    (err as any).logs = errorData.logs;
    throw err;
  }

  return res.json();
}

/**
 * 2. Trigger kernel build via GitHub Actions
 */
export async function triggerBuild(
  gitUrl: string,
  kernelVersion: string,
  arch: string,
  pluginPaths: string[]
): Promise<BuildResponse> {
  const res = await fetch(`${API_BASE}/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      git_url: gitUrl,
      kernel_version: kernelVersion,
      arch,
      plugin_paths: pluginPaths,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.details || errorData.error || `Build trigger failed: ${res.status}`
    );
  }

  return res.json();
}

/**
 * 3. Poll build status — real GitHub Actions status
 */
export async function getBuildStatus(buildId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status/${buildId}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.details || errorData.error || `Status fetch failed: ${res.status}`
    );
  }

  return res.json();
}

/**
 * 4. Get build manifest for reproducibility
 */
export async function getBuildManifest(buildId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/manifest/${buildId}`);

  if (!res.ok) {
    return null;
  }

  return res.json();
}
