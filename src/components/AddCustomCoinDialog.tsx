"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface AddCustomCoinDialogProps {
  countryOptions: CountryOption[];
}

export function AddCustomCoinDialog({ countryOptions }: AddCustomCoinDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [selection, setSelection] = useState<string>(() => {
    const first = countryOptions[0];
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
        setError("Please use a JPEG, PNG, WebP, or GIF image.");
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
    [clearImage]
  );

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let countryCode: string;
    let country: string;
    if (isOther) {
      countryCode = "OT";
      country = otherCountry.trim();
      if (!country) {
        setError("Enter the country name for “Other”.");
        return;
      }
    } else {
      const [code, ...rest] = selection.split("\t");
      countryCode = code;
      country = rest.join("\t");
    }

    const file = imageFile ?? fileInputRef.current?.files?.[0] ?? null;
    if (!file) {
      setError("Add a coin photo by clicking or dragging a file here.");
      return;
    }

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("description", description.trim());
    fd.set("country", country);
    fd.set("countryCode", countryCode);
    fd.set("year", year.trim());
    fd.set("image", file);

    setLoading(true);
    try {
      const res = await fetch("/api/custom-coins", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not save coin.");
        return;
      }
      startTransition(() => {
        router.refresh();
      });
      setOpen(false);
      setName("");
      setDescription("");
      setYear("");
      setOtherCountry("");
      clearImage();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2 border-violet-200 bg-violet-50/40 text-violet-950 hover:bg-violet-100"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add personal coin
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => !loading && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-coin-title"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border bg-background p-6 shadow-lg sm:rounded-2xl"
          >
            <h2 id="custom-coin-title" className="text-lg font-semibold">
              Add a personal coin
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only you can see this coin. Photos are resized to WebP to save space. Uploads use your
              signed-in session (no service role key required).
            </p>

            <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
                <label className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                  <input
                    required
                    maxLength={200}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="e.g. City anniversary piece"
                  />
                </label>

                <label className="text-sm font-medium">
                  Country <span className="text-destructive">*</span>
                  <select
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={selection}
                    onChange={(e) => setSelection(e.target.value)}
                  >
                    {countryOptions.map((o) => (
                      <option key={`${o.countryCode}-${o.country}`} value={`${o.countryCode}\t${o.country}`}>
                        {o.country}
                      </option>
                    ))}
                    <option value="OT">Other (type country name below)</option>
                  </select>
                </label>

                {isOther && (
                  <label className="text-sm font-medium">
                    Country name
                    <input
                      value={otherCountry}
                      onChange={(e) => setOtherCountry(e.target.value)}
                      maxLength={120}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="e.g. United Kingdom"
                    />
                  </label>
                )}

                <label className="text-sm font-medium">
                  Year <span className="text-muted-foreground">(optional)</span>
                  <input
                    type="number"
                    min={1800}
                    max={2100}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="e.g. 2019"
                  />
                </label>

                <label className="text-sm font-medium">
                  Description <span className="text-muted-foreground">(optional)</span>
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
                    Photo <span className="text-destructive">*</span>
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
                        ? "border-violet-500 bg-violet-100/60 text-violet-950"
                        : "border-muted-foreground/25 bg-muted/20 hover:border-violet-400/60 hover:bg-violet-50/40",
                      loading && "pointer-events-none opacity-60"
                    )}
                  >
                    {previewUrl ? (
                      <>
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-violet-200 shadow-sm">
                          <img
                            src={previewUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="max-w-full space-y-0.5">
                          <p className="truncate text-xs font-medium text-foreground">
                            {imageFile?.name ?? "Selected image"}
                          </p>
                          {imageFile && (
                            <p className="text-xs text-muted-foreground">{formatBytes(imageFile.size)}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Click or drop to replace · JPEG, PNG, WebP, GIF
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            clearImage();
                          }}
                          className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-4 ring-violet-50 transition-transform group-hover:scale-105">
                          <ImagePlus className="h-6 w-6" aria-hidden />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Drop your coin photo here
                          </p>
                          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            or click to browse
                          </p>
                          <p className="text-[11px] text-muted-foreground/90">JPEG, PNG, WebP, or GIF</p>
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
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving…" : "Save coin"}
                  </Button>
                </div>
              </form>
          </div>
        </div>
      )}
    </>
  );
}
