export type Session = { code: string; name: string; guest: boolean };

const KEY = "sessions";

export const loadSessions = (): Session[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

const storeSessions = (next: Session[]): Session[] => {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable, keep in memory only
  }
  return next;
};

export const saveSession = (session: Session): Session[] =>
  storeSessions([
    session,
    ...loadSessions().filter(
      (s) => s.code !== session.code || s.name !== session.name,
    ),
  ]);

export const removeSessions = (codes: string[]): Session[] =>
  storeSessions(loadSessions().filter((s) => !codes.includes(s.code)));

const HOST_TOKENS_KEY = "hostTokens";

const loadHostTokens = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(HOST_TOKENS_KEY) ?? "{}");
  } catch {
    return {};
  }
};

export const loadHostToken = (code: string): string | undefined =>
  loadHostTokens()[code];

export const saveHostToken = (code: string, token: string) => {
  try {
    localStorage.setItem(
      HOST_TOKENS_KEY,
      JSON.stringify({ ...loadHostTokens(), [code]: token }),
    );
  } catch {
    // storage unavailable, host won't be able to end the session
  }
};
