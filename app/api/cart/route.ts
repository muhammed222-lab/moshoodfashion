import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product_id,
      quantity,
      price,
      user_id,
      email,
      image, // new field for product image URL
      name, // optionally save product name
      category, // optionally save product category
    } = body;
    const { data, error } = await supabase
      .from("cart")
      .insert([
        {
          product_id,
          quantity,
          price,
          user_id,
          email,
          image, // insert image URL
          name, // insert name if needed
          category, // insert category if needed
        },
      ])
      .select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { product_id, quantity, user_id, email } = body;
    const { data, error } = await supabase
      .from("cart")
      .update({ quantity, updated_at: new Date().toISOString() })
      .match({ product_id, user_id, email })
      .select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { product_id, user_id, email } = body;
    const { data, error } = await supabase
      .from("cart")
      .delete()
      .match({ product_id, user_id, email });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
