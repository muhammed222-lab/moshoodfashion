"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check for admin session only on admin routes.
  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        // If no user session, redirect to admin login.
        router.push("/admin/login");
      } else {
        // Optionally, you can add extra checks (like allowed emails) here.
      }
      setLoading(false);
    }
    checkSession();
  }, [router]);

  if (loading) return <p>Loading admin...</p>;

  return <div className="admin-layout">{children}</div>;
}
