"use client";
import React, { useState } from "react";
import Image from "next/image";

const Footer = () => {
  const [email, setEmail] = useState("");
  const footerSections = {
    Moshood: [
      { name: "About", href: "#" },
      { name: "Products", href: "#" },
    ],
    Assist: [
      { name: "Track my order", href: "#" },
      { name: "Pick up", href: "#" },
    ],
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Subscribe logic goes here, e.g., posting to your API
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Subscribe Form */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={50} height={50} />
              <span className="ml-2 text-xl font-bold">Moshood Fashion</span>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col space-y-2"
            >
              <label
                htmlFor="subscribe"
                className="text-sm font-medium text-gray-900"
              >
                Subscribe to our newsletter
              </label>
              <input
                id="subscribe"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-300"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Footer Sections */}
          {Object.entries(footerSections).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Currency Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              Change currency:
            </h3>
            <select className="mt-1 block w-full rounded-md border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-gray-300 focus:outline-none focus:ring-0">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-8">
          <p className="text-sm text-gray-500">
            Copyright © {new Date().getFullYear()} Moshood Fashion Store, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
