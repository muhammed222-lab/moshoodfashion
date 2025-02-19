"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/header";
import { supabase } from "../../../lib/supabaseClient";

const ProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    // Get the current user session
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      setError("You must be logged in to add items to the cart.");
      return;
    }
    // Build the cart item data
    if (!product) {
      setError("Product not found.");
      return;
    }
    const cartItem = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      user_id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("cart").insert([cartItem]);
    if (error) {
      console.error("Error adding to cart:", error);
      setError("Error adding to cart: " + error.message);
    } else {
      // Redirect to the Cart page (or show a success message)
      router.push("/cart");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-10 mt-12">
          <p className="text-center">Loading product...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-10 mt-12">
          <p className="text-center text-red-500">Product not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-10 mt-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <img
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-gray-800 mb-4">₦{product.price}</p>
            <p className="mb-4">
              {product.description || "No description available."}
            </p>
            <div className="flex items-center mb-4">
              <span className="mr-2">Quantity:</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 p-2 border rounded"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
