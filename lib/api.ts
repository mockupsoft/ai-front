const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
}

export async function triggerRun(taskId: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/run`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger run');
  return res.json();
}

export async function approvePlan(taskId: string, runId: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/runs/${runId}/approve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to approve plan');
  return res.json();
}

export async function downloadArtifact(taskId: string, runId: string, artifactId: string) {
    // In a real app this might return a blob or trigger a download
    // For this UI we might just view it, but the requirement says "download artifacts"
    window.open(`${API_BASE}/tasks/${taskId}/runs/${runId}/artifacts/${artifactId}/download`, '_blank');
}
