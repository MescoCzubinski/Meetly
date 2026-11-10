export type Session = {
  code: string;
  name: string;
  guest: boolean;
  token: string;
};

const SESSIONS_KEY = "sessions";
const HOST_TOKENS_KEY = "hostTokens";

const read = (key: string): unknown => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    // unreadable or unavailable storage counts as empty
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSession = (value: unknown): value is Session =>
  isRecord(value) &&
  typeof value.code === "string" &&
  typeof value.name === "string" &&
  typeof value.guest === "boolean" &&
  typeof value.token === "string";

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable, keep in memory only
  }
};

export const loadSessions = (): Session[] => {
  const stored = read(SESSIONS_KEY);
  return Array.isArray(stored) ? stored.filter(isSession) : [];
};

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

const loadHostTokens = (): Record<string, string> => {
  const stored = read(HOST_TOKENS_KEY);
  if (!isRecord(stored)) return {};
  return Object.fromEntries(
    Object.entries(stored).filter(([, token]) => typeof token === "string"),
  ) as Record<string, string>;
};

export const loadHostToken = (code: string): string | undefined =>
  loadHostTokens()[code];

export const saveHostToken = (code: string, token: string) =>
  write(HOST_TOKENS_KEY, { ...loadHostTokens(), [code]: token });
