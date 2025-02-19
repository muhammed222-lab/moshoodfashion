"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/header";
import Overview from "./components/Overview";
import { supabase } from "../../lib/supabaseClient";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  stock: number;
  tags: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState({
    name: "",
    category: "wears",
    price: "",
    currency: "USD",
    description: "",
    stock: "",
    tags: "active",
    images: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Ensure the user is authenticated
  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        router.push("/login");
      }
    }
    getSession();
  }, [router]);

  // Handle form input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection and generate previews
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  // Form submission: Upload images and insert new product
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload images to Supabase Storage ("products" bucket)
      const uploadedImageURLs: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileName = `${Date.now()}-${i + 1}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file);
        if (uploadError) {
          throw uploadError;
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(fileName);
        uploadedImageURLs.push(publicUrl);
      }

      // Prepare product data (ensure your table and RLS policy require user_id to equal auth.uid())
      const newProduct: Product = {
        id: 0, // Supabase will assign the correct id
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        currency: product.currency,
        description: product.description,
        stock: parseInt(product.stock, 10),
        tags: product.tags,
        images: uploadedImageURLs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId!, // user_id must match auth.uid() per your RLS policy
      };

      // Insert new product into the "products" table.
      const { error: insertError } = await supabase
        .from("products")
        .insert(newProduct);
      if (insertError) {
        throw insertError;
      }

      alert("Product added successfully!");
      router.push("/products"); // Redirect to product list page
    } catch (error: unknown) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <Overview />
      <div className="p-4 w-[70%] m-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input
              name="name"
              type="text"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <input
              name="category"
              type="text"
              value={product.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Price ({product.currency})
            </label>
            <input
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              value={product.stock}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          {/* File Input for product images */}
          <div>
            <label className="block text-sm font-medium">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full mt-1"
            />
            {imagePreviews.length > 0 && (
              <div className="flex space-x-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </>
  );
}
