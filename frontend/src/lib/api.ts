import { API_URL } from "@/lib/config";
import { isValidCode } from "@/utils/isValidCode";

export const sessionExists = (code: string) =>
  isValidCode(code)
    ? fetch(`${API_URL}/sessions/${code}`)
        .then((res) => res.ok)
        .catch(() => undefined)
    : Promise.resolve(false);

export const createSession = (): Promise<{ code: string; hostToken: string }> =>
  fetch(`${API_URL}/sessions`, { method: "POST" }).then((res) => res.json());

export const endSession = (code: string, hostToken: string) =>
  fetch(`${API_URL}/sessions/${code}`, {
    method: "DELETE",
    headers: { "X-Host-Token": hostToken },
  }).catch(() => {});

export const joinSession = (
  code: string,
  name: string,
): Promise<{ name: string; token: string }> =>
  fetch(`${API_URL}/sessions/${code}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((res) => {
    if (!res.ok) throw new Error(`Join failed: ${res.status}`);
    return res.json();
  });
