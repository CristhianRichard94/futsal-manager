"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import SizeBadge from "@/components/SizeBadge";
import ForbiddenPage from "@/components/ForbiddenPage";
import NotFoundPage from "@/components/NotFoundPage";
import { HttpService } from "@/service/HttpService";
import { Field, FieldSize, Venue } from "@/lib/types";

const SIZE_OPTIONS: { value: FieldSize; label: string }[] = [
  { value: FieldSize.Five, label: "5-a-side" },
  { value: FieldSize.Seven, label: "7-a-side" },
  { value: FieldSize.Eleven, label: "11-a-side" },
];

export default function VenueConfigPage() {
  const params = useParams<{ id: string }>();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [venueForm, setVenueForm] = useState({ name: "", address: "", phone: "", logo_url: "" });
  const [savingVenue, setSavingVenue] = useState(false);
  const [venueSaveError, setVenueSaveError] = useState<string | null>(null);

  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldForm, setFieldForm] = useState({
    name: "",
    size: FieldSize.Five,
    image_url: "",
  });
  const [savingField, setSavingField] = useState(false);
  const [fieldSaveError, setFieldSaveError] = useState<string | null>(null);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<
    Record<number, string>
  >({});

  const load = () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    setForbidden(false);
    Promise.all([HttpService.getVenue(params.id), HttpService.getVenueFields(params.id)])
      .then(([venueData, fieldsData]) => {
        setVenue(venueData);
        setFields(fieldsData);
        setVenueForm({
          name: venueData.name,
          address: venueData.address,
          phone: venueData.phone,
          logo_url: venueData.logo_url ?? "",
        });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) setNotFound(true);
        else if (status === 403) setForbidden(true);
        else setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSaveVenue = async () => {
    setSavingVenue(true);
    setVenueSaveError(null);
    try {
      const updated = await HttpService.updateVenue(params.id, {
        name: venueForm.name,
        address: venueForm.address,
        phone: venueForm.phone,
        logo_url: venueForm.logo_url || null,
      });
      setVenue(updated);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setForbidden(true);
      else setVenueSaveError("Failed to save venue changes. Please try again.");
    } finally {
      setSavingVenue(false);
    }
  };

  const openCreateField = () => {
    setEditingField(null);
    setFieldForm({ name: "", size: FieldSize.Five, image_url: "" });
    setFieldSaveError(null);
    setFieldDialogOpen(true);
  };

  const openEditField = (field: Field) => {
    setEditingField(field);
    setFieldForm({
      name: field.name,
      size: field.size,
      image_url: field.image_url ?? "",
    });
    setFieldSaveError(null);
    setFieldDialogOpen(true);
  };

  const handleSaveField = async () => {
    setSavingField(true);
    setFieldSaveError(null);
    try {
      const payload = {
        name: fieldForm.name,
        size: fieldForm.size,
        image_url: fieldForm.image_url || null,
      };
      if (editingField) {
        await HttpService.updateField(editingField.id, payload);
      } else {
        await HttpService.createVenueField(params.id, payload);
      }
      setFieldDialogOpen(false);
      load();
    } catch {
      setFieldSaveError("Failed to save field. Please try again.");
    } finally {
      setSavingField(false);
    }
  };

  const handleDeleteField = async (field: Field) => {
    try {
      await HttpService.deleteField(field.id);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setDeleteBlockedMessage((prev) => ({
          ...prev,
          [field.id]:
            "This field has active reservations. Cancel them first before deleting.",
        }));
      } else {
        setDeleteBlockedMessage((prev) => ({
          ...prev,
          [field.id]: "Failed to delete field. Please try again.",
        }));
      }
    }
  };

  if (notFound) return <NotFoundPage message="This venue doesn't exist." />;
  if (forbidden) return <ForbiddenPage />;

  return (
    <div className="space-y-8">
      {error && <ErrorBanner message="Failed to load venue configuration." onRetry={load} />}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!loading && !error && venue && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Venue details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Venue name"
                value={venueForm.name}
                onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={venueForm.address}
                onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={venueForm.phone}
                onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })}
              />
              <Input
                type="url"
                placeholder="Logo URL (optional)"
                value={venueForm.logo_url}
                onChange={(e) => setVenueForm({ ...venueForm, logo_url: e.target.value })}
              />
              {venueSaveError && <ErrorBanner message={venueSaveError} />}
              <Button
                onClick={handleSaveVenue}
                disabled={savingVenue || !venueForm.name || !venueForm.address || !venueForm.phone}
              >
                {savingVenue ? "Saving..." : "Save changes"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Fields</h2>
              <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateField}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add field
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingField ? "Edit field" : "Add field"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input
                      placeholder="Field name"
                      value={fieldForm.name}
                      onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                    />
                    <Select
                      value={fieldForm.size}
                      onValueChange={(value) =>
                        setFieldForm({ ...fieldForm, size: value as FieldSize })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="url"
                      placeholder="Image URL (optional)"
                      value={fieldForm.image_url}
                      onChange={(e) => setFieldForm({ ...fieldForm, image_url: e.target.value })}
                    />
                    {fieldSaveError && <ErrorBanner message={fieldSaveError} />}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveField} disabled={savingField || !fieldForm.name}>
                      {savingField ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {fields && fields.length === 0 && (
              <EmptyState title="No fields yet" description="Add a field to start accepting bookings." />
            )}

            {fields && fields.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                  <Card key={field.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                      <SizeBadge size={field.size} />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditField(field)}>
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this field?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteField(field)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      {deleteBlockedMessage[field.id] && (
                        <ErrorBanner message={deleteBlockedMessage[field.id]} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
