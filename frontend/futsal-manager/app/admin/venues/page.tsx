"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { HttpService } from "@/service/HttpService";
import { Venue } from "@/lib/types";

export default function AdminVenuesPage() {
  const { data: session } = useSession();
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", logo_url: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(false);
    HttpService.getVenues(session.user.id)
      .then((data) => setVenues(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await HttpService.createVenue({
        name: form.name,
        address: form.address,
        phone: form.phone,
        logo_url: form.logo_url || null,
      });
      setDialogOpen(false);
      setForm({ name: "", address: "", phone: "", logo_url: "" });
      load();
    } catch {
      setCreateError("Failed to create venue. Please check the fields and try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Venues</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Venue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create venue</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Venue name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                type="url"
                placeholder="Logo URL (optional)"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              />
              {createError && <ErrorBanner message={createError} />}
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={creating || !form.name || !form.address || !form.phone}
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <ErrorBanner message="Failed to load your venues." onRetry={load} />}

      {loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {!loading && !error && venues && venues.length === 0 && (
        <EmptyState
          title="No venues yet"
          description="Create your first venue to start managing fields and bookings."
        />
      )}

      {!loading && !error && venues && venues.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{venue.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{venue.address}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/venues/${venue.id}/config`}>Configure</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/venues/${venue.id}/bookings`}>Bookings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
