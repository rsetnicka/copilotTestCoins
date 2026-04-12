import { NextResponse } from "next/server";
import { db } from "@/db";
import { revalidateCollectionPages } from "@/lib/revalidate-collection";
import { userCollections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { coinId } = await request.json();
  if (!coinId) {
    return NextResponse.json({ error: "coinId required" }, { status: 400 });
  }

  // Check if coin is already owned
  const existing = await db.query.userCollections.findFirst({
    where: and(
      eq(userCollections.userId, user.id),
      eq(userCollections.coinId, coinId)
    ),
  });

  if (existing) {
    await db
      .delete(userCollections)
      .where(
        and(
          eq(userCollections.userId, user.id),
          eq(userCollections.coinId, coinId)
        )
      );
    revalidateCollectionPages();
    return NextResponse.json({ owned: false });
  }
  await db.insert(userCollections).values({ userId: user.id, coinId });
  revalidateCollectionPages();
  return NextResponse.json({ owned: true });
}
