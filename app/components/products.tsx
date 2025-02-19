"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface ProductProps {
  id: number; // assume each product has an id
  name: string;
  price: number;
  image?: string;
  images?: string[]; // if product has an images array
  category?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  images,
  category,
}: ProductProps) => {
  // Build the image list: prefer images array if exists, otherwise single image.
  const imageArray = React.useMemo(
    () =>
      images && images.length > 0
        ? images
        : image
        ? [image]
        : ["/placeholder.jpg"],
    [images, image]
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // currentSrc holds the src for the currently displayed image.
  const [currentSrc, setCurrentSrc] = useState(imageArray[0]);
  // Modal state for zoom.
  const [showZoomModal, setShowZoomModal] = useState(false);
  // Cart state – if false, product is not in cart; when true, show quantity controls.
  const [inCart, setInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);

  // On mount, check if the product is already in the cart.
  useEffect(() => {
    async function checkCartStatus() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Query Supabase cart table for this product.
        const { data, error } = await supabase.from("cart").select("*").match({
          product_id: id,
          user_id: session.user.id,
          email: session.user.email,
        });
        if (!error && data && data.length > 0) {
          setInCart(true);
          setCartQuantity(data[0].quantity);
        }
      } else {
        // Check localStorage.
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const entry = cart.find(
          (item: { product_id: number; quantity: number }) =>
            item.product_id === id
        );
        if (entry) {
          setInCart(true);
          setCartQuantity(entry.quantity);
        }
      }
    }
    checkCartStatus();
  }, [id]);

  // Update currentSrc when currentImageIndex changes.
  useEffect(() => {
    setCurrentSrc(imageArray[currentImageIndex]);
  }, [currentImageIndex, imageArray]);

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % imageArray.length;
    setCurrentImageIndex(newIndex);
    setCurrentSrc(imageArray[newIndex]);
  };

  const prevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + imageArray.length) % imageArray.length;
    setCurrentImageIndex(newIndex);
    setCurrentSrc(imageArray[newIndex]);
  };

  // On error, fallback to the placeholder image.
  const handleImageError = () => {
    setCurrentSrc("/placeholder.jpg");
  };

  // CART HANDLERS:
  const handleAddToCart = async () => {
    setCartQuantity(1);
    setInCart(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      // Authenticated: add product to DB (include image URL).
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          quantity: 1,
          price: price,
          user_id: session.user.id,
          email: session.user.email,
          image: currentSrc, // save the image URL
          name: name, // optionally save product name
          category: category, // optionally save category
        }),
      });
      if (!response.ok) {
        console.error("Failed to add product to cart on server");
      }
    } else {
      // Guest: update localStorage with image URL.
      const cart = JSON.parse(localStorage.getItem("cart") || "[]") as Array<{
        product_id: number;
        quantity: number;
        price: number;
        image: string;
      }>;
      cart.push({ product_id: id, quantity: 1, price, image: currentSrc });
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  const handleIncreaseQuantity = async () => {
    const newQuantity = cartQuantity + 1;
    setCartQuantity(newQuantity);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          quantity: newQuantity,
          user_id: session.user.id,
          email: session.user.email,
        }),
      });
    } else {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart = cart.map((item: { product_id: number; quantity: number }) =>
        item.product_id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  const handleDecreaseQuantity = async () => {
    const newQuantity = cartQuantity > 1 ? cartQuantity - 1 : 1;
    setCartQuantity(newQuantity);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          quantity: newQuantity,
          user_id: session.user.id,
          email: session.user.email,
        }),
      });
    } else {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart = cart.map((item: any) =>
        item.product_id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  const handleRemoveFromCart = async () => {
    setInCart(false);
    setCartQuantity(1);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          user_id: session.user.id,
          email: session.user.email,
        }),
      });
    } else {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart = cart.filter(
        (item: { product_id: number }) => item.product_id !== id
      );
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Product Image with navigation if > 1 image */}
        <div
          className="relative w-full aspect-square cursor-pointer"
          onClick={() => setShowZoomModal(true)}
        >
          <Image
            src={currentSrc}
            alt={name}
            fill
            onError={handleImageError}
            className="object-cover transform transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          {imageArray.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-200 bg-opacity-70 p-1 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-200 bg-opacity-70 p-1 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          {category && (
            <span className="block text-xs text-gray-500 uppercase tracking-wider">
              {category}
            </span>
          )}
          <h2 className="mt-1 text-lg font-semibold text-gray-800">{name}</h2>
          <p className="mt-2 text-blue-600 font-bold">
            ₦
            {price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          {inCart ? (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecreaseQuantity}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  –
                </button>
                <span>{cartQuantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleRemoveFromCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
              >
                Remove from Cart
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="mt-4 flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
            >
              <FaShoppingCart className="text-lg" />
              <span className="text-sm font-medium">Add to Cart</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal for Zooming Image */}
      {showZoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowZoomModal(false)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={currentSrc}
                alt={name}
                fill
                onError={handleImageError}
                className="object-contain"
                sizes="100vw"
                priority
              />
              {imageArray.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 p-2 rounded-full text-white"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 p-2 rounded-full text-white"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
