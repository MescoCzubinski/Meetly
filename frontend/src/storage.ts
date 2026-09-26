export type Session = { code: string; name: string; guest: boolean };

const KEY = "sessions";

export const loadSessions = (): Session[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const saveSession = (session: Session): Session[] => {
  const next = [
    session,
    ...loadSessions().filter(
      (s) => s.code !== session.code || s.name !== session.name,
    ),
  ];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable, keep in memory only
  }
  return next;
};
