import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, serviceRoleKey!);

export async function GET() {
  // Use the Admin API to list users
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Map fields according to your interface, using the Supabase User type
  const users = data.users.map((u: User) => ({
    id: u.id,
    name: u.user_metadata?.full_name || u.email,
    email: u.email,
    joinedDate: u.created_at, // Adjust the format if needed
    orderCount: 0, // Merge order data if available
    isDisabled: u.confirmed_at === null, // Adjust logic as required
  }));
  return NextResponse.json(users);
}
