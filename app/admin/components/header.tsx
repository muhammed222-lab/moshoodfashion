"use client";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const allowedEmails = [
  "muhammednetr@gmail.com",
  "moshoodfashionhome@gmail.com",
];

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { avatar_url?: string };
  } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Retrieve session and update user on auth changes
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoadingAuth(false);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleSignIn = () => {
    router.push("/admin/login");
  };

  if (loadingAuth) return <p>Loading...</p>;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center space-x-2">
            <h1
              onClick={() => router.push("/admin")}
              className="text-xl font-bold cursor-pointer"
            >
              M.F.H Admin Panel
            </h1>
            {user && user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              user.email && allowedEmails.includes(user.email) ? (
                <>
                  {[
                    { name: "Products", href: "/admin/products" },
                    { name: "Users", href: "/admin/users" },
                    { name: "Requests", href: "/admin/requests" },
                    { name: "Orders", href: "/admin/orders" },
                    { name: "Subscriptions", href: "/admin/subscriptions" },
                    { name: "Notification", href: "/admin/notification" },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      {item.name}
                    </a>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <span className="text-gray-600 text-sm">Not an admin</span>
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-800 text-sm ml-4"
                  >
                    Sign Out
                  </button>
                </>
              )
            ) : (
              <button
                onClick={handleSignIn}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Sign In
              </button>
            )}
          </nav>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t">
          <div className="px-4 pt-4 pb-2 space-y-1">
            {user ? (
              user.email && allowedEmails.includes(user.email) ? (
                <>
                  {[
                    { name: "Products", href: "/admin/products" },
                    { name: "Users", href: "/admin/users" },
                    { name: "Requests", href: "/admin/requests" },
                    { name: "Orders", href: "/admin/orders" },
                    { name: "Subscriptions", href: "/admin/subscriptions" },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block text-gray-600 hover:text-gray-900 text-base"
                    >
                      {item.name}
                    </a>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="block text-red-600 hover:text-red-800 text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <span className="block text-gray-600 text-base">
                    Not an admin
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="block text-red-600 hover:text-red-800 text-base"
                  >
                    Sign Out
                  </button>
                </>
              )
            ) : (
              <button
                onClick={handleSignIn}
                className="block text-blue-600 hover:text-blue-800 text-base"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
