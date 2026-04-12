import { NextResponse } from "next/server";
import { revalidateCollectionPages } from "@/lib/revalidate-collection";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { coinId } = await request.json();
  if (!coinId) {
    return NextResponse.json({ error: "coinId required" }, { status: 400 });
  }

  const { data: existing, error: selectError } = await supabase
    .from("user_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("coin_id", coinId)
    .maybeSingle();

  if (selectError) {
    console.error("collection toggle select:", selectError.message);
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("user_collections")
      .delete()
      .eq("user_id", user.id)
      .eq("coin_id", coinId);
    if (deleteError) {
      console.error("collection toggle delete:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    revalidateCollectionPages();
    return NextResponse.json({ owned: false });
  }

  const { error: insertError } = await supabase.from("user_collections").insert({
    user_id: user.id,
    coin_id: coinId,
  });
  if (insertError) {
    console.error("collection toggle insert:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  revalidateCollectionPages();
  return NextResponse.json({ owned: true });
}
