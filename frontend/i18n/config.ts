export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Parses an `Accept-Language` header value and returns the highest-quality
 * supported locale ("es" | "en") found in the visitor's preference list,
 * comparing only the primary 2-letter subtag (case-insensitive, ignoring
 * region suffixes). Entries are ranked by their `q` weight per RFC 7231
 * (default `q=1.0` when absent). Malformed or out-of-range `q` values fall
 * back to `q=0` (treated as "not acceptable") rather than throwing, so a
 * broken quality parameter cannot outrank a well-formed one. Ties are
 * resolved by header order (first match wins). Falls back to
 * `defaultLocale` when the header is missing, empty, or contains no
 * supported language with a positive quality.
 */
export function resolveLocaleFromAcceptLanguage(
  acceptLanguage: string | undefined | null
): Locale {
  if (!acceptLanguage) return defaultLocale;

  const tags = acceptLanguage.split(",");

  const candidates: { locale: Locale; q: number; order: number }[] = [];

  tags.forEach((rawTag, order) => {
    const trimmedTag = rawTag.trim();
    if (!trimmedTag) return;

    const parts = trimmedTag.split(";");
    const primarySubtag = parts[0]?.trim().split("-")[0]?.toLowerCase();

    if (!isLocale(primarySubtag)) return;

    let q = 1.0;
    const qPart = parts.find((part) => part.trim().toLowerCase().startsWith("q="));
    if (qPart !== undefined) {
      const qValue = qPart.trim().slice(2).trim();
      const parsedQ = Number(qValue);
      q = Number.isFinite(parsedQ) && parsedQ >= 0 && parsedQ <= 1 ? parsedQ : 0;
    }

    if (q <= 0) return;

    candidates.push({ locale: primarySubtag, q, order });
  });

  if (candidates.length === 0) return defaultLocale;

  candidates.sort((a, b) => b.q - a.q || a.order - b.order);

  return candidates[0].locale;
}
