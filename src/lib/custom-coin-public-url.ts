import { CUSTOM_COIN_STORAGE_BUCKET } from "@/lib/custom-coin-constants";

/** Public object URL for Next/Image and <img> (bucket must be public). */
export function customCoinPublicUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "";
  return `${base}/storage/v1/object/public/${CUSTOM_COIN_STORAGE_BUCKET}/${imagePath}`;
}
