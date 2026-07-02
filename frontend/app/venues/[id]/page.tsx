"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import NotFoundPage from "@/components/NotFoundPage";
import SizeBadge from "@/components/SizeBadge";
import { HttpService } from "@/service/HttpService";
import { Field, Venue } from "@/lib/types";

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const t = useTranslations("venueDetail");

  const load = () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    Promise.all([
      HttpService.getVenue(params.id),
      HttpService.getVenueFields(params.id),
    ])
      .then(([venueData, fieldsData]) => {
        setVenue(venueData);
        setFields(fieldsData);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (notFound) {
    return <NotFoundPage message={t("notFound")} />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={t("loadError")} onRetry={load} />}

      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && venue && (
        <>
          <div className="flex items-center gap-4">
            {venue.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.logo_url}
                alt={venue.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{venue.name}</h1>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {venue.address}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {venue.phone}
              </p>
            </div>
          </div>

          {fields && fields.length === 0 && (
            <EmptyState
              title={t("emptyFieldsTitle")}
              description={t("emptyFieldsDescription")}
            />
          )}

          {fields && fields.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => (
                <Card key={field.id}>
                  {field.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={field.image_url}
                      alt={field.name}
                      className="h-40 w-full rounded-t-lg object-cover"
                    />
                  )}
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">{field.name}</CardTitle>
                    <SizeBadge size={field.size} />
                  </CardHeader>
                  <CardContent />
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.push(`/venues/${venue.id}/book?field=${field.id}`)
                      }
                    >
                      {t("book")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
