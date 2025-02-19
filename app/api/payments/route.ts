import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Payment details received:", payload);

    const { data, error } = await supabase
      .from("payments")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
