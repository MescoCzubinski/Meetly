import { API_URL } from "@/lib/config";
import { isValidCode } from "@/utils/isValidCode";

export const sessionExists = async (code: string): Promise<boolean> => {
  if (!isValidCode(code)) return false;
  const res = await fetch(`${API_URL}/sessions/${code}`);
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Checking the session failed: ${res.status}`);
  return true;
};

export const createSession = async (): Promise<{
  code: string;
  hostToken: string;
}> => {
  const res = await fetch(`${API_URL}/sessions`, { method: "POST" });
  if (!res.ok) throw new Error(`Creating a session failed: ${res.status}`);
  return res.json();
};

export const endSession = async (
  code: string,
  hostToken: string,
): Promise<void> => {
  const res = await fetch(`${API_URL}/sessions/${code}`, {
    method: "DELETE",
    headers: { "X-Host-Token": hostToken },
  });
  if (!res.ok) throw new Error(`Ending the session failed: ${res.status}`);
};

export const joinSession = async (
  code: string,
  name: string,
): Promise<{ name: string; token: string }> => {
  const res = await fetch(`${API_URL}/sessions/${code}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Joining failed: ${res.status}`);
  return res.json();
};
