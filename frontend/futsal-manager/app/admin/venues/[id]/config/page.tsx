"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

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

export default function VenueConfigPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("adminConfig");

  const SIZE_OPTIONS: { value: FieldSize; label: string }[] = [
    { value: FieldSize.Five, label: t("sizeFive") },
    { value: FieldSize.Seven, label: t("sizeSeven") },
    { value: FieldSize.Eleven, label: t("sizeEleven") },
  ];

  const [venue, setVenue] = useState<Venue | null>(null);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [venueForm, setVenueForm] = useState({
    name: "",
    address: "",
    phone: "",
    logo_url: "",
    deposit_required: false,
  });
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
          deposit_required: venueData.deposit_required,
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
        deposit_required: venueForm.deposit_required,
      });
      setVenue(updated);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setForbidden(true);
      else setVenueSaveError(t("saveVenueError"));
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
      setFieldSaveError(t("saveFieldError"));
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
          [field.id]: t("deleteFieldBlockedError"),
        }));
      } else {
        setDeleteBlockedMessage((prev) => ({
          ...prev,
          [field.id]: t("deleteFieldGenericError"),
        }));
      }
    }
  };

  if (notFound) return <NotFoundPage message={t("notFound")} />;
  if (forbidden) return <ForbiddenPage />;

  return (
    <div className="space-y-8">
      {error && <ErrorBanner message={t("loadError")} onRetry={load} />}

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
              <CardTitle>{t("venueDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={t("venueNamePlaceholder")}
                value={venueForm.name}
                onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
              />
              <Input
                placeholder={t("addressPlaceholder")}
                value={venueForm.address}
                onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
              />
              <Input
                placeholder={t("phonePlaceholder")}
                value={venueForm.phone}
                onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })}
              />
              <Input
                type="url"
                placeholder={t("logoUrlPlaceholder")}
                value={venueForm.logo_url}
                onChange={(e) => setVenueForm({ ...venueForm, logo_url: e.target.value })}
              />
              <label className="flex items-start gap-2 pt-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input"
                  checked={venueForm.deposit_required}
                  onChange={(e) =>
                    setVenueForm({ ...venueForm, deposit_required: e.target.checked })
                  }
                />
                <span>
                  <span className="block font-medium">{t("depositRequired")}</span>
                  <span className="block text-muted-foreground">
                    {t("depositRequiredDescription")}
                  </span>
                </span>
              </label>
              {venueSaveError && <ErrorBanner message={venueSaveError} />}
              <Button
                onClick={handleSaveVenue}
                disabled={savingVenue || !venueForm.name || !venueForm.address || !venueForm.phone}
              >
                {savingVenue ? t("saving") : t("saveChanges")}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("fields")}</h2>
              <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateField}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addField")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingField ? t("editField") : t("addField")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input
                      placeholder={t("fieldNamePlaceholder")}
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
                        <SelectValue placeholder={t("sizePlaceholder")} />
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
                      placeholder={t("imageUrlPlaceholder")}
                      value={fieldForm.image_url}
                      onChange={(e) => setFieldForm({ ...fieldForm, image_url: e.target.value })}
                    />
                    {fieldSaveError && <ErrorBanner message={fieldSaveError} />}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveField} disabled={savingField || !fieldForm.name}>
                      {savingField ? t("saving") : t("save")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {fields && fields.length === 0 && (
              <EmptyState title={t("emptyFieldsTitle")} description={t("emptyFieldsDescription")} />
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
                          {t("edit")}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-1 h-4 w-4" />
                              {t("delete")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("deleteFieldDialogTitle")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("deleteFieldDialogDescription")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteField(field)}>
                                {t("delete")}
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
