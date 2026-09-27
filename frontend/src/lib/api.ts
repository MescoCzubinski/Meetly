import { API_URL } from "@/lib/config";

export const isValidCode = (code: string) => /^\d{6}$/.test(code);

export const sessionExists = (code: string) =>
  fetch(`${API_URL}/sessions/${code}`)
    .then((res) => res.ok)
    .catch(() => false);

export const createSession = (): Promise<{ code: string; hostToken: string }> =>
  fetch(`${API_URL}/sessions`, { method: "POST" }).then((res) => res.json());

export const endSession = (code: string, hostToken: string) =>
  fetch(`${API_URL}/sessions/${code}`, {
    method: "DELETE",
    headers: { "X-Host-Token": hostToken },
  }).catch(() => {});
