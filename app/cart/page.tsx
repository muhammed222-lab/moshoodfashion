"use client";

import React, { useState, useEffect } from "react";
import { CartItem } from "../components/cart";
import { CheckoutButton } from "../components/CheckoutButton";
import { EmptyCart } from "../components/EmptyCart";
import Header from "../components/header";
import { supabase } from "../../lib/supabaseClient";

// Currency formatter for NGN
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

interface CartItemType {
  id: string;
  name: string;
  category: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [userEmail, setUserEmail] = useState("");

  // Fetch cart items and set the user email from the session
  useEffect(() => {
    async function fetchCartItems() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserEmail(session.user.email || "guest@example.com");
        const { data, error } = await supabase
          .from("cart")
          .select("*")
          .match({ user_id: session.user.id, email: session.user.email });
        if (error) {
          console.error("Error fetching cart items:", error);
        } else if (data) {
          const formatted = data.map((item: CartItemType) => ({
            id: item.id.toString(),
            name: item.name,
            category: item.category,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          }));
          setItems(formatted);
        }
      } else {
        // If guest, fallback to localStorage and use a default email
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setItems(cart);
        setUserEmail("guest@example.com");
      }
    }
    fetchCartItems();
  }, []);

  const isEmpty = items.length === 0;
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Update quantity function
  const updateQuantity = async (id: string, newQuantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from("cart")
        .update({ quantity: newQuantity })
        .match({ id });
      if (error) {
        console.error("Error updating quantity:", error);
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = cart.map((item: CartItemType) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  // Remove cart item function
  const handleRemove = async (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase.from("cart").delete().match({ id });
      if (error) {
        console.error("Error removing cart item:", error);
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const newCart = cart.filter((item: CartItemType) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  if (isEmpty) {
    return <EmptyCart />;
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 mt-20">
        <h1 className="text-2xl font-semibold mb-8">Your Shopping Cart</h1>
        <div className="space-y-6 mb-8">
          {items.map((item) => (
            <CartItem
              key={item.id}
              {...item}
              imageAlt={item.name}
              onRemove={handleRemove}
              onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
              onDecrease={() =>
                updateQuantity(
                  item.id,
                  item.quantity > 1 ? item.quantity - 1 : 1
                )
              }
              currencyFormatter={currencyFormatter}
            />
          ))}
        </div>
        <div className="border-t pt-6">
          <div className="bg-gray-50 p-6 rounded">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Your Total</h3>
              <p className="font-medium">{currencyFormatter.format(total)}</p>
            </div>
            <p className="text-gray-600 text-sm">
              Shipping will be calculated in the next step
            </p>
          </div>
          <CheckoutButton total={total} email={userEmail} cartItems={items} />
        </div>
      </div>
    </>
  );
}
