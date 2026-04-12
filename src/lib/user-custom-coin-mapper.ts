import type { UserCustomCoin } from "@/db/schema";

export type UserCustomCoinSnakeRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  country: string;
  country_code: string;
  year: number | null;
  image_path: string;
  created_at: string;
  /** Present after migration; fallback to created_at for cache-busting. */
  updated_at?: string;
};

export function userCustomCoinFromSupabase(row: UserCustomCoinSnakeRow): UserCustomCoin {
  const updatedSrc = row.updated_at ?? row.created_at;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    country: row.country,
    countryCode: row.country_code,
    year: row.year,
    imagePath: row.image_path,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(updatedSrc),
  };
}
