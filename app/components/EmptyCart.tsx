import Link from "next/link";
import React from "react";

export const EmptyCart = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">
        Your Shopping Cart is empty
      </h1>
      <p className="text-gray-600 mb-8">
        Looks like you haven&apos;t added any items to the cart yet.
      </p>
      <Link
        href="/products"
        className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
      >
        Explore products
      </Link>
    </div>
  );
};
