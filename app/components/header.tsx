"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Search, ShoppingBag, Menu, X, Globe, User } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showSignInOptions, setShowSignInOptions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Subscribe to Supabase auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Get the real cart count without reloading the page.
  useEffect(() => {
    async function getCartCount() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("cart")
          .select("*")
          .match({ user_id: session.user.id, email: session.user.email });
        if (!error && data) {
          const total = data.reduce(
            (acc: number, item: any) => acc + item.quantity,
            0
          );
          setCartCount(total);
        }
      } else {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const total = cart.reduce(
          (acc: number, item: any) => acc + item.quantity,
          0
        );
        setCartCount(total);
      }
    }
    // Fetch on mount and whenever the user changes.
    getCartCount();
  }, [user]);

  // Persist selected country in localStorage.
  useEffect(() => {
    const savedCountry = localStorage.getItem("selectedCountry");
    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCountry", selectedCountry);
  }, [selectedCountry]);

  // Handle search suggestions
  useEffect(() => {
    async function fetchSuggestions() {
      if (searchQuery.trim().length === 0) {
        setSuggestions([]);
        return;
      }
      // Look for matching products by name or category (case-insensitive)
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category")
        .ilike("name", `%${searchQuery}%`)
        .or(`category.ilike.%${searchQuery}%`);
      if (error) {
        console.error("Error fetching suggestions:", error);
      } else if (data) {
        setSuggestions(data);
      }
    }
    fetchSuggestions();
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Sign in error", error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error", error);
    } else {
      setUser(null);
      router.push("/");
    }
  };

  const navigation = [
    { name: "Home", href: "http://localhost:3000/" },
    { name: "Top wears", href: "/top" },
    { name: "Request", href: "/request" },
    { name: "My order", href: "/orders" },
  ];

  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "NG", name: "Nigeria" },
    { code: "IN", name: "India" },
  ];

  const handleSearchSelect = (suggestion: any) => {
    // You might choose a URL pattern like "/products/[id]" or a search results page.
    router.push(`/products/${suggestion.id}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <header className="relative bg-white/80 backdrop-blur-md shadow-sm fix">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:justify-normal lg:space-x-8">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <span className="text-xl font-serif tracking-tight">MFH</span>
            </div>

            <nav className="hidden lg:flex space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center flex-1 justify-end space-x-4">
              <div className="relative flex items-center">
                <Globe size={18} className="text-gray-600 mr-2" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-gray-50 border-none text-sm p-2 rounded-md focus:ring-gray-200"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    ref={searchRef}
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    className="w-64 rounded-lg bg-gray-50 border-none pl-4 pr-10 py-2 text-sm focus:ring-1 focus:ring-gray-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search size={18} className="text-gray-400" />
                  </div>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSearchSelect(suggestion)}
                      >
                        <p className="text-sm font-medium">{suggestion.name}</p>
                        <p className="text-xs text-gray-500">
                          {suggestion.category}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Shopping Bag Button with Notification */}
              <div className="relative">
                <button
                  onClick={() => router.push("/cart")}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <ShoppingBag size={20} />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </div>

              {user ? (
                <div className="flex items-center space-x-2">
                  {user.user_metadata && user.user_metadata.avatar_url ? (
                    <img
                      onClick={() => router.push("/profile")}
                      src={user.user_metadata.avatar_url}
                      alt="User Avatar"
                      className="w-8 h-8 cursor-pointer rounded-full"
                    />
                  ) : (
                    <User
                      onClick={() => router.push("/profile")}
                      className="w-8 h-8 cursor-pointer text-gray-600"
                    />
                  )}
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSignInOptions(true)}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Sign In
                </button>
              )}

              <button
                className="lg:hidden text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-normal">MOSHOOD FASHION</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-4 text-lg text-gray-900 border-b border-gray-100"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="p-4 flex flex-col space-y-4">
              <button
                onClick={
                  user ? handleSignOut : () => setShowSignInOptions(true)
                }
                className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                  user
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {user ? "Sign Out" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignInOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md max-w-xs w-full">
            <h2 className="text-lg font-semibold mb-4">Sign In Options</h2>
            <button
              onClick={async () => {
                setShowSignInOptions(false);
                await handleSignIn();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md mb-2"
            >
              Continue with Google
            </button>
            <button
              onClick={() => {
                setShowSignInOptions(false);
                router.push("/signin");
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              Other Method
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
