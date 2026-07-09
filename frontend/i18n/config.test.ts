import { describe, expect, it } from "vitest";

import { resolveLocaleFromAcceptLanguage } from "./config";

describe("resolveLocaleFromAcceptLanguage", () => {
  it("resolves Spanish when the browser prefers es", () => {
    expect(resolveLocaleFromAcceptLanguage("es-ES,es;q=0.9,en;q=0.8")).toBe(
      "es"
    );
  });

  it("resolves English when the browser prefers en", () => {
    expect(resolveLocaleFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
  });

  it("falls back to the default locale when no supported language matches", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR,fr;q=0.9,de;q=0.8")).toBe(
      "es"
    );
  });

  it("falls back to the default locale when the header is missing", () => {
    expect(resolveLocaleFromAcceptLanguage(undefined)).toBe("es");
    expect(resolveLocaleFromAcceptLanguage(null)).toBe("es");
    expect(resolveLocaleFromAcceptLanguage("")).toBe("es");
  });

  it("picks the first supported language among multiple unsupported preferences", () => {
    expect(resolveLocaleFromAcceptLanguage("fr-FR,de;q=0.9,en;q=0.5")).toBe(
      "en"
    );
  });

  it("ranks by q value, not header order, when order is reversed from preference", () => {
    expect(resolveLocaleFromAcceptLanguage("en;q=0.3,es;q=0.9")).toBe("es");
  });

  it("treats a malformed q value as q=0 and does not throw, falling back to the next candidate", () => {
    expect(() =>
      resolveLocaleFromAcceptLanguage("es;q=bogus,en;q=0.9")
    ).not.toThrow();
    expect(resolveLocaleFromAcceptLanguage("es;q=bogus,en;q=0.9")).toBe("en");
    expect(() => resolveLocaleFromAcceptLanguage("es;q=")).not.toThrow();
    expect(resolveLocaleFromAcceptLanguage("es;q=")).toBe("es");
  });

  it("ignores empty or whitespace-only tags in the list without throwing", () => {
    expect(() =>
      resolveLocaleFromAcceptLanguage(",es;q=0.9")
    ).not.toThrow();
    expect(resolveLocaleFromAcceptLanguage(",es;q=0.9")).toBe("es");

    expect(() =>
      resolveLocaleFromAcceptLanguage(";q=0.9,en;q=0.8")
    ).not.toThrow();
    expect(resolveLocaleFromAcceptLanguage(";q=0.9,en;q=0.8")).toBe("en");

    expect(() => resolveLocaleFromAcceptLanguage("   ,  ")).not.toThrow();
    expect(resolveLocaleFromAcceptLanguage("   ,  ")).toBe("es");
  });
});
