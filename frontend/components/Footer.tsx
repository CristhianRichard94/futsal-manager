import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t py-4">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
