"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Plus,
  X,
  Edit3,
  Trash2Icon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../components/header";
import { supabase } from "../../../lib/supabaseClient";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  stock: number;
  quality: string;
  created_at: string;
}

// ProductCard with image slider using Chevron icons.
const ProductCard: React.FC<{
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}> = ({ product, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col">
      <div className="relative">
        {product.images.length > 0 ? (
          <img
            src={product.images[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-40 object-cover rounded mb-4"
          />
        ) : (
          <img
            src="/placeholder.jpg"
            alt={product.name}
            className="w-full h-40 object-cover rounded mb-4"
          />
        )}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-300 p-1 rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-300 p-1 rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
      <p className="text-gray-500 mb-1">Category: {product.category}</p>
      <p className="text-gray-500 mb-1">
        Price: NGN {product.price.toFixed(2)}
      </p>
      <p className="text-gray-500 mb-1">Stock: {product.stock} left</p>
      <p className="text-gray-500 mb-1">Quality: {product.quality}</p>
      <p className="text-gray-600 text-sm flex-grow">{product.description}</p>
      <button
        onClick={() => onEdit(product)}
        className="mt-4 flex items-center bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors"
      >
        <Edit3 size={16} className="mr-1" /> Edit
      </button>
      <button
        onClick={() => onDelete(product)}
        className="mt-4 flex items-center bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
      >
        <Trash2Icon size={16} className="mr-1" /> Delete
      </button>
    </div>
  );
};

const Page = () => {
  // Main states
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add modal form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    quality: "",
  });
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [productPreviews, setProductPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    quality: "",
  });

  // Get current session (for console logging; supabase uses in-built auth token)
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }
      console.log("Authenticated user ID:", session.user.id);
    };
    getSession();
  }, []);

  // Fetch products on mount.
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      setProducts(data as Product[]);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // For Edit modal inputs.
  const handleEditInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3);
      setProductFiles(filesArray);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setProductPreviews(previews);
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload images to Supabase Storage ("products" bucket)
      const uploadedImageURLs: string[] = [];
      for (let i = 0; i < productFiles.length; i++) {
        const file = productFiles[i];
        const fileName = `${Date.now()}-${i + 1}-${encodeURIComponent(
          file.name
        )}`;
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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }
      console.log("Authenticated user ID:", session.user.id);

      const newProduct = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        images: uploadedImageURLs,
        description: formData.description,
        stock: parseInt(formData.stock, 10),
        quality: formData.quality,
        created_at: new Date().toISOString(),
        user_id: session.user.id,
      };

      const { error: insertError } = await supabase
        .from("products")
        .insert([newProduct])
        .select();
      if (insertError) {
        throw insertError;
      }
      console.log("Inserting product:", newProduct);
      await fetchProducts();
      setFormData({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
        quality: "",
      });
      setProductFiles([]);
      setProductPreviews([]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Try again.");
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      stock: product.stock.toString(),
      quality: product.quality,
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!editingProduct) return;
      const updatedData = {
        name: editFormData.name,
        price: parseFloat(editFormData.price),
        category: editFormData.category,
        description: editFormData.description,
        stock: parseInt(editFormData.stock, 10),
        quality: editFormData.quality,
      };

      const { error: updateError } = await supabase
        .from("products")
        .update(updatedData)
        .eq("id", editingProduct.id)
        .select();
      if (updateError) {
        throw updateError;
      }
      console.log("Updated product:", editingProduct.id, updatedData);
      await fetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating product:", error.message);
        alert("Failed to update product. Try again.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Try again.");
      }
    }
    setLoading(false);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      if (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      } else {
        await fetchProducts();
      }
    }
  };

  return (
    <>
      <Header />
      <div className="p-4 w-[70%] m-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" /> Add Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-lg rounded shadow-lg p-6 relative mx-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Plus size={24} className="mr-2" /> Add New Product
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                {/* Form fields similar to edit modal */}
                <div>
                  <label className="block text-sm font-medium">
                    Product Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Price (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      NGN
                    </span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 border border-gray-300 rounded-md p-2 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  />
                </div>
                {/* Multiple Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Images (max 3)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  {productPreviews.length > 0 && (
                    <div className="flex space-x-2 mt-2">
                      {productPreviews.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Preview ${idx}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Please ensure your images are resized for optimal display
                    and are of fair to best quality.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Remaining Items in Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Image Quality
                  </label>
                  <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  >
                    <option value="">Select Quality</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Best">Best</option>
                  </select>
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
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-lg rounded shadow-lg p-6 relative mx-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Edit3 size={24} className="mr-2" /> Edit Product
              </h2>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Product Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Price (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      NGN
                    </span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={editFormData.price}
                      onChange={handleEditInputChange}
                      required
                      className="w-full pl-12 border border-gray-300 rounded-md p-2 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input
                    name="category"
                    type="text"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Remaining Items in Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    value={editFormData.stock}
                    onChange={handleEditInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Image Quality
                  </label>
                  <select
                    name="quality"
                    value={editFormData.quality}
                    onChange={handleEditInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  >
                    <option value="">Select Quality</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Best">Best</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                >
                  {loading ? "Updating Product..." : "Update Product"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
