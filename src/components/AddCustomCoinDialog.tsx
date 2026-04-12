"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinPhotoFramer, type CoinPhotoFramerHandle } from "@/components/CoinPhotoFramer";
import { cn } from "@/lib/utils";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { CUSTOM_COIN_STORAGE_BUCKET } from "@/lib/custom-coin-constants";
import { framedJpegToWebpBlob } from "@/lib/custom-coin-browser-webp";
import type { UserCustomCoin } from "@/db/schema";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const ACCEPT_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedImage(file: File): boolean {
  return ACCEPT_MIMES.has(file.type.toLowerCase());
}

export interface CountryOption {
  country: string;
  countryCode: string;
}

type CustomCoinDialogProps =
  | { mode: "add"; countryOptions: CountryOption[] }
  | {
      mode: "edit";
      countryOptions: CountryOption[];
      row: UserCustomCoin;
      existingImageUrl: string;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    };

function CustomCoinDialog(props: CustomCoinDialogProps) {
  const isEdit = props.mode === "edit";
  const router = useRouter();
  const t = useTranslations("addCoin");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const framerRef = useRef<CoinPhotoFramerHandle>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEdit ? props.open : internalOpen;
  const setOpen = isEdit ? props.onOpenChange : setInternalOpen;

  const editRow = isEdit ? props.row : null;
  const existingImageUrl = isEdit ? props.existingImageUrl : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [selection, setSelection] = useState<string>(() => {
    const first = props.countryOptions[0];
    return first ? `${first.countryCode}\t${first.country}` : "OT";
  });
  const [otherCountry, setOtherCountry] = useState("");

  const isOther = selection === "OT";

  const clearImage = useCallback(() => {
    setImageFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const assignImage = useCallback(
    (file: File | null) => {
      if (!file) {
        clearImage();
        return;
      }
      if (!isAcceptedImage(file)) {
        setError(t("invalidImageType"));
        return;
      }
      setError(null);
      setImageFile(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        if (fileInputRef.current) fileInputRef.current.files = dt.files;
      } catch {
        /* DataTransfer unsupported — submit still uses imageFile state */
      }
    },
    [clearImage, t]
  );

  const editDialogWasOpenRef = useRef(false);
  useEffect(() => {
    if (!isEdit) return;
    if (!open) {
      editDialogWasOpenRef.current = false;
      return;
    }
    const justOpened = !editDialogWasOpenRef.current;
    editDialogWasOpenRef.current = true;
    if (!justOpened) return;
    const r = (props as Extract<CustomCoinDialogProps, { mode: "edit" }>).row;
    setName(r.name);
    setDescription(r.description ?? "");
    setYear(r.year != null ? String(r.year) : "");
    setSelection(r.countryCode === "OT" ? "OT" : `${r.countryCode}\t${r.country}`);
    setOtherCountry(r.countryCode === "OT" ? r.country : "");
    setError(null);
    setImageFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [isEdit, open, props]);

  useEffect(() => {
    if (!open) {
      clearImage();
      setDragging(false);
    }
  }, [open, clearImage]);

  useEffect(() => {
    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const effectivePreview =
    previewUrl ?? (isEdit && existingImageUrl && !imageFile ? existingImageUrl : null);
  const showFramer = Boolean(previewUrl && imageFile);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let countryCode: string;
    let country: string;
    if (isOther) {
      countryCode = "OT";
      country = otherCountry.trim();
      if (!country) {
        setError(t("countryOtherError"));
        return;
      }
    } else {
      const [code, ...rest] = selection.split("\t");
      countryCode = code;
      country = rest.join("\t");
    }

    const baseFile = imageFile ?? fileInputRef.current?.files?.[0] ?? null;
    if (!isEdit && !baseFile) {
      setError(t("missingPhoto"));
      return;
    }

    let framed: File | null = null;
    if (baseFile) {
      if (!previewUrl || !framerRef.current) {
        setError(t("framingExportFailed"));
        return;
      }
      const exported = await framerRef.current.exportFramedJpeg();
      if (!exported) {
        setError(t("framingExportFailed"));
        return;
      }
      framed = exported;
    }

    const sb = createBrowserSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setError(t("notSignedInStorage"));
      return;
    }

    setLoading(true);
    try {
      if (!isEdit) {
        if (!framed) {
          setError(t("missingPhoto"));
          return;
        }
        const id = crypto.randomUUID();
        const imagePath = `${user.id}/${id}.webp`;
        let webpBlob: Blob;
        try {
          webpBlob = await framedJpegToWebpBlob(framed);
        } catch (e) {
          if (e instanceof Error && e.message === "WEBP_EXPORT_UNSUPPORTED") {
            setError(t("webpNotSupported"));
            return;
          }
          setError(t("saveFailed"));
          return;
        }
        const { error: upErr } = await sb.storage.from(CUSTOM_COIN_STORAGE_BUCKET).upload(imagePath, webpBlob, {
          contentType: "image/webp",
          upsert: false,
        });
        if (upErr) {
          setError(upErr.message);
          return;
        }
        const res = await fetch("/api/custom-coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            imagePath,
            name: name.trim(),
            description: description.trim() || null,
            country,
            countryCode,
            year: year.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          await sb.storage.from(CUSTOM_COIN_STORAGE_BUCKET).remove([imagePath]);
          setError((data as { error?: string }).error ?? t("saveFailed"));
          return;
        }
      } else {
        if (framed && editRow) {
          let webpBlob: Blob;
          try {
            webpBlob = await framedJpegToWebpBlob(framed);
          } catch (e) {
            if (e instanceof Error && e.message === "WEBP_EXPORT_UNSUPPORTED") {
              setError(t("webpNotSupported"));
              return;
            }
            setError(t("saveFailed"));
            return;
          }
          const { error: upErr } = await sb.storage
            .from(CUSTOM_COIN_STORAGE_BUCKET)
            .upload(editRow.imagePath, webpBlob, {
              contentType: "image/webp",
              upsert: true,
            });
          if (upErr) {
            setError(upErr.message);
            return;
          }
        }
        if (!editRow) {
          setError(t("saveFailed"));
          return;
        }
        const res = await fetch("/api/custom-coins", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editRow.id,
            name: name.trim(),
            description: description.trim() || null,
            country,
            countryCode,
            year: year.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((data as { error?: string }).error ?? t("saveFailed"));
          return;
        }
      }

      startTransition(() => {
        router.refresh();
      });
      setOpen(false);
      if (!isEdit) {
        setName("");
        setDescription("");
        setYear("");
        setOtherCountry("");
        clearImage();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isEdit && (
        <Button
          type="button"
          variant="default"
          className="gap-2 bg-violet-600 font-semibold text-white shadow-md shadow-violet-600/30 hover:bg-violet-500 hover:text-white focus-visible:ring-violet-400 dark:bg-violet-500 dark:shadow-violet-950/50 dark:hover:bg-violet-400 dark:hover:text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t("button")}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            aria-label={t("close")}
            onClick={() => !loading && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-coin-title"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border bg-background p-6 shadow-lg sm:rounded-2xl"
          >
            <h2 id="custom-coin-title" className="text-lg font-semibold">
              {isEdit ? t("dialogTitleEdit") : t("dialogTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit ? t("dialogIntroEdit") : t("dialogIntro")}
            </p>

            <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
              <label className="text-sm font-medium">
                {t("name")} <span className="text-destructive">*</span>
                <input
                  required
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={t("namePlaceholder")}
                />
              </label>

              <label className="text-sm font-medium">
                {t("country")} <span className="text-destructive">*</span>
                <select
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={selection}
                  onChange={(e) => setSelection(e.target.value)}
                >
                  {props.countryOptions.map((o) => (
                    <option key={`${o.countryCode}-${o.country}`} value={`${o.countryCode}\t${o.country}`}>
                      {o.country}
                    </option>
                  ))}
                  <option value="OT">{t("countryOther")}</option>
                </select>
              </label>

              {isOther && (
                <label className="text-sm font-medium">
                  {t("countryName")}
                  <input
                    value={otherCountry}
                    onChange={(e) => setOtherCountry(e.target.value)}
                    maxLength={120}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder={t("countryOtherPlaceholder")}
                  />
                </label>
              )}

              <label className="text-sm font-medium">
                {t("year")}{" "}
                <span className="text-muted-foreground">{t("optional")}</span>
                <input
                  type="number"
                  min={1800}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={t("yearPlaceholder")}
                />
              </label>

              <label className="text-sm font-medium">
                {t("description")}{" "}
                <span className="text-muted-foreground">{t("optional")}</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="text-sm font-medium">
                <span className="text-foreground">
                  {t("photo")}
                  {isEdit ? (
                    <>
                      {" "}
                      <span className="font-normal text-muted-foreground">{t("photoReplaceOptional")}</span>
                    </>
                  ) : (
                    <>
                      {" "}
                      <span className="text-destructive">*</span>
                    </>
                  )}
                </span>
                <input
                  ref={fileInputRef}
                  name="image"
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(e) => assignImage(e.target.files?.[0] ?? null)}
                />
                <div
                  role="presentation"
                  onClick={() => !loading && fileInputRef.current?.click()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!loading) setDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!loading) setDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = e.relatedTarget as Node | null;
                    if (!next || !e.currentTarget.contains(next)) setDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragging(false);
                    if (loading) return;
                    const f = e.dataTransfer.files?.[0];
                    assignImage(f ?? null);
                  }}
                  className={cn(
                    "group relative mt-2 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                    dragging
                      ? "border-violet-500 bg-violet-100/60 text-violet-950 dark:border-violet-400 dark:bg-violet-950/50 dark:text-violet-50"
                      : "border-muted-foreground/25 bg-muted/20 hover:border-violet-400/60 hover:bg-violet-50/40 dark:hover:border-violet-500/50 dark:hover:bg-violet-950/25",
                    loading && "pointer-events-none opacity-60"
                  )}
                >
                  {effectivePreview ? (
                    <>
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-violet-200 shadow-sm dark:border-violet-500/40">
                        <img
                          src={effectivePreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="max-w-full space-y-0.5">
                        <p className="truncate text-xs font-medium text-foreground">
                          {imageFile?.name ?? (isEdit ? t("currentPhoto") : t("selectedImage"))}
                        </p>
                        {imageFile && (
                          <p className="text-xs text-muted-foreground">{formatBytes(imageFile.size)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {isEdit && !imageFile ? t("replaceHintExisting") : t("replaceHint")}
                        </p>
                      </div>
                      {showFramer && previewUrl && (
                        <CoinPhotoFramer
                          ref={framerRef}
                          imageUrl={previewUrl}
                          sourceKey={previewUrl}
                          disabled={loading}
                          className="w-full pt-1"
                        />
                      )}
                      {imageFile && (
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            clearImage();
                          }}
                          className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={t("removeImage")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-4 ring-violet-50 transition-transform group-hover:scale-105 dark:bg-violet-800/60 dark:text-violet-100 dark:ring-violet-950/80">
                        <ImagePlus className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{t("dropPhoto")}</p>
                        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {t("browse")}
                        </p>
                        <p className="text-[11px] text-muted-foreground/90">{t("formatsShort")}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" disabled={loading} onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t("saving") : isEdit ? t("saveEdit") : t("save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AddCustomCoinDialog({ countryOptions }: { countryOptions: CountryOption[] }) {
  return <CustomCoinDialog mode="add" countryOptions={countryOptions} />;
}

export function EditCustomCoinDialog({
  countryOptions,
  row,
  imageUrl,
  open,
  onOpenChange,
}: {
  countryOptions: CountryOption[];
  row: UserCustomCoin;
  imageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <CustomCoinDialog
      mode="edit"
      countryOptions={countryOptions}
      row={row}
      existingImageUrl={imageUrl}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
