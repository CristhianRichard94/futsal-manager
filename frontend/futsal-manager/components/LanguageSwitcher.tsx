"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { LOCALE_COOKIE_NAME, Locale, locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("footer");
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 text-sm" aria-label={t("language")}>
      {locales.map((loc, index) => (
        <span key={loc} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLocale(loc)}
            disabled={isPending}
            aria-current={locale === loc}
            className={cn(
              "uppercase transition-colors hover:text-foreground",
              locale === loc
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {loc}
          </button>
          {index < locales.length - 1 && (
            <span className="text-muted-foreground">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
