import { CUSTOM_COIN_STORAGE_BUCKET } from "@/lib/custom-coin-constants";

/** Public object URL for Next/Image and <img> (bucket must be public). */
export function customCoinPublicUrl(
  imagePath: string,
  /** Same Storage path after upsert is cached by browsers; pass updatedAt to force refetch. */
  cacheBust?: Date | string | number
): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "";
  let url = `${base}/storage/v1/object/public/${CUSTOM_COIN_STORAGE_BUCKET}/${imagePath}`;
  if (cacheBust != null) {
    const v =
      cacheBust instanceof Date
        ? cacheBust.getTime()
        : typeof cacheBust === "number"
          ? cacheBust
          : String(cacheBust);
    url += `${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(String(v))}`;
  }
  return url;
}
