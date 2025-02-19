"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "../components/products";
import Header from "../components/header";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    created_at: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching products:", error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-10 mt-12">
        <h1 className="text-center text-3xl font-bold mb-8">Our Products</h1>
        {loading ? (
          <p className="text-center">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-[70%] mx-auto">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
