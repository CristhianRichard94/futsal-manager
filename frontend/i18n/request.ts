import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE_NAME,
  resolveLocaleFromAcceptLanguage,
} from "./config";

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  let locale = isLocale(cookieLocale) ? cookieLocale : undefined;

  if (!locale) {
    const acceptLanguage = headers().get("accept-language");
    locale = resolveLocaleFromAcceptLanguage(acceptLanguage);
  }

  locale = locale ?? defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
