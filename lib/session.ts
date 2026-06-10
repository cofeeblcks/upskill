export type SessionPayload = {
  id?: string;
  email: string;
  name: string;
  role: string;
};

export function parseSessionCookie(
  raw: string | undefined
): SessionPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}
