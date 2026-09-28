export type Session = {
  code: string;
  name: string;
  guest: boolean;
  token: string;
};

const SESSIONS_KEY = "sessions";
const HOST_TOKENS_KEY = "hostTokens";

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable, keep in memory only
  }
};

export const loadSessions = () =>
  read<Session[]>(SESSIONS_KEY, []).filter((s) => s.token);

const storeSessions = (next: Session[]): Session[] => {
  write(SESSIONS_KEY, next);
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

const loadHostTokens = () => read<Record<string, string>>(HOST_TOKENS_KEY, {});

export const loadHostToken = (code: string): string => loadHostTokens()[code];

export const saveHostToken = (code: string, token: string) =>
  write(HOST_TOKENS_KEY, { ...loadHostTokens(), [code]: token });
