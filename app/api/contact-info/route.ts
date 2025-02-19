import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

// GET /api/contact-info?email=<email>
// Returns contact info for the specified email.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("contact_info")
      .select("*")
      .eq("customer_email", email);

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/contact-info
// Inserts a new contact record.
// Expected payload keys: customer_name, customer_email, customer_phone, address
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { data, error } = await supabase
      .from("contact_info")
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
