"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CountryOption {
  country: string;
  countryCode: string;
}

interface AddCustomCoinDialogProps {
  countryOptions: CountryOption[];
}

export function AddCustomCoinDialog({ countryOptions }: AddCustomCoinDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [selection, setSelection] = useState<string>(() => {
    const first = countryOptions[0];
    return first ? `${first.countryCode}\t${first.country}` : "OT";
  });
  const [otherCountry, setOtherCountry] = useState("");

  const isOther = selection === "OT";

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

    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("image") as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      setError("Please choose a coin photo.");
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
      setOpen(false);
      setName("");
      setDescription("");
      setYear("");
      setOtherCountry("");
      input.value = "";
      router.refresh();
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

                <label className="text-sm font-medium">
                  Photo <span className="text-destructive">*</span>
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="mt-1 w-full text-sm"
                    required
                  />
                </label>

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
