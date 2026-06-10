import bcrypt from "bcryptjs";

/**
 * Normaliza hashes bcrypt leídos de BD (trim/BOM, o primer '$' perdido en importaciones).
 */
export function normalizeStoredBcryptHash(
  raw: string | null | undefined
): string | null {
  if (raw == null) return null;
  let s = raw.replace(/^\uFEFF/, "").trim();
  if (!s) return null;
  if (s.startsWith("$2")) return s;
  // 59 chars típico si falta el '$' inicial: 2b$10$...
  if (s.length >= 59 && /^2[aby]\$\d{2}\$/.test(s)) {
    return `$${s}`;
  }
  return s;
}

export async function verifyStoredPassword(
  plain: string,
  storedRaw: string | null | undefined
): Promise<"empty" | "match" | "nomatch"> {
  const stored = normalizeStoredBcryptHash(storedRaw);
  if (!stored) return "empty";
  try {
    const ok = await bcrypt.compare(plain.trim(), stored);
    return ok ? "match" : "nomatch";
  } catch {
    return "nomatch";
  }
}
