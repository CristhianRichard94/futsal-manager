"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Calendar, CalendarClock, CheckCircle2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { UserRole } from "@/lib/types";
import { useInViewOnce } from "@/custom-hooks/useInViewOnce";

const PRIMARY_CTA_CLASSNAME =
  "transition-transform duration-200 ease-out hover:scale-[1.02] motion-reduce:hover:scale-100 animate-cta-primary-intro";

type HowItWorksStepProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
};

function HowItWorksStep({
  icon: Icon,
  title,
  description,
  index,
}: HowItWorksStepProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-3 text-center rounded-lg border border-border bg-card p-6 text-card-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        inView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 motion-reduce:opacity-100 motion-reduce:translate-y-0"
      }`}
      style={{ transitionDelay: inView ? `${index * 120}ms` : "0ms" }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === UserRole.VenueAdmin;
  const t = useTranslations("home");

  const steps = [
    {
      icon: MapPin,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Description"),
    },
    {
      icon: CalendarClock,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Description"),
    },
    {
      icon: CheckCircle2,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Description"),
    },
  ];

  return (
    <>
      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-8 py-16 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl motion-safe:animate-drift md:h-[560px] md:w-[560px]"
        />

        <div className="space-y-4">
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl motion-safe:animate-fade-slide-up motion-reduce:opacity-100"
            style={{ animationDelay: "0ms" }}
          >
            {t("title")}
          </h1>
          <p
            className="mx-auto max-w-xl text-muted-foreground motion-safe:animate-fade-slide-up motion-reduce:opacity-100"
            style={{ animationDelay: "100ms" }}
          >
            {t("subtitle")}
          </p>
        </div>

        {status === "loading" ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div
              aria-hidden="true"
              className="h-11 w-full animate-pulse rounded-md bg-muted sm:w-40"
            />
            <div
              aria-hidden="true"
              className="h-11 w-full animate-pulse rounded-md bg-muted sm:w-48"
            />
            <div
              aria-hidden="true"
              className="h-11 w-full animate-pulse rounded-md bg-muted sm:w-44"
            />
          </div>
        ) : (
          <div
            className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4 motion-safe:animate-fade-slide-up motion-reduce:opacity-100"
            style={{ animationDelay: "220ms" }}
          >
            <Button
              size="lg"
              asChild
              className={`w-full sm:w-auto ${PRIMARY_CTA_CLASSNAME}`}
            >
              <Link href="/venues">
                <MapPin className="mr-2 h-4 w-4" />
                {t("browseVenues")}
              </Link>
            </Button>

            {!session && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => signIn("google")}
                className="w-full sm:w-auto"
              >
                {t("signInWithGoogle")}
              </Button>
            )}

            {session && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/me/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("myBookings")}
                </Link>
              </Button>
            )}

            {isAdmin && (
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/admin/venues">{t("manageMyVenues")}</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-3 sm:gap-8">
        {steps.map((step, index) => (
          <HowItWorksStep
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
            index={index}
          />
        ))}
      </section>
    </>
  );
}
