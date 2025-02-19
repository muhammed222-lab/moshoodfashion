//// filepath: /c:/Users/user/Desktop/mfh/app/components/ContactFormModal.tsx
"use client";

import React, { useState } from "react";

interface ContactFormModalProps {
  initialEmail: string;
  onSubmit: (contactData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
  }) => void;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  initialEmail,
  onSubmit,
  onClose,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      customerName,
      customerEmail,
      customerPhone,
      address,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Shipping and Contact Information
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Name:
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="block w-full border p-2"
              required
            />
          </label>
          <label className="block mb-2">
            Email:
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="block w-full border p-2"
              required
            />
          </label>
          <label className="block mb-2">
            Phone Number:
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="block w-full border p-2"
              required
            />
          </label>
          <label className="block mb-2">
            Address:
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full border p-2"
              required
            />
          </label>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
