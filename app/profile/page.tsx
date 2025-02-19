"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Header from "../components/header";
import { ContactFormModal } from "../components/ContactFormModal";

type Payment = {
  id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  // add more fields as needed
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "payments" | "contact"
  >("profile");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [contactData, setContactData] = useState<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
  } | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  // Fetch user session details
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        setDisplayName(user.user_metadata?.displayName || "");
        setEmail(user.email || "");
        setNotification(user.user_metadata?.notification || false);
      }
    };
    getUser();
  }, []);

  // Fetch payments (only if email is truthy)
  useEffect(() => {
    const fetchPayments = async () => {
      if (!email) return;
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("customer_email", email);
        if (error) {
          console.error("Error fetching payments:", error);
        } else {
          setPayments(data || []);
        }
      } catch (err) {
        console.error("Error fetching payments", err);
      }
    };
    if (activeTab === "payments") fetchPayments();
  }, [activeTab, email]);

  // Fetch contact info when the "Contact Information" tab is active
  useEffect(() => {
    const fetchContactInfo = async () => {
      if (!email) return;
      try {
        const res = await fetch(
          `/api/contact-info?email=${encodeURIComponent(email)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            const record = data.data[0];
            setContactData({
              customerName: record.customer_name,
              customerEmail: record.customer_email,
              customerPhone: record.customer_phone,
              address: record.address,
            });
          } else {
            setContactData(null);
          }
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };
    if (activeTab === "contact") fetchContactInfo();
  }, [activeTab, email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const updates: {
      email?: string;
      password?: string;
      data: { displayName: string; notification: boolean };
    } = {
      data: {
        displayName,
        notification,
      },
    };

    if (email) updates.email = email;
    if (password) updates.password = password;

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setError("Failed to update profile: " + error.message);
    } else {
      setMessage("Profile updated successfully.");
    }
  };

  const openContactForm = () => {
    setShowContactForm(true);
  };

  const handleContactSubmit = async (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
  }) => {
    try {
      const res = await fetch("/api/contact-info", {
        method: "POST", // Consider using PUT if updating existing record
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          address: data.address,
        }),
      });
      const result = await res.json();
      console.log("Contact info saved:", result);
      setContactData(data);
    } catch (error) {
      console.error("Error saving contact info:", error);
    }
    setShowContactForm(false);
  };

  const renderProfileTab = () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {message && <div className="mb-4 text-green-500">{message}</div>}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="flex items-center">
          <input
            id="notification"
            type="checkbox"
            checked={notification}
            onChange={() => setNotification(!notification)}
            className="h-4 w-4"
          />
          <label htmlFor="notification" className="ml-2 text-sm">
            Be notified when new designs are released
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Update Profile
        </button>
      </form>
    </div>
  );

  const renderPaymentsTab = () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      {payments.length === 0 ? (
        <p>No payments found for this account.</p>
      ) : (
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li key={payment.id} className="p-3 border rounded-md">
              <p>
                <strong>Transaction ID:</strong> {payment.transaction_id}
              </p>
              <p>
                <strong>Amount:</strong> {payment.amount} {payment.currency}
              </p>
              <p>
                <strong>Status:</strong> {payment.status}
              </p>
              <p>
                <strong>Paid At:</strong>{" "}
                {new Date(payment.paid_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderContactTab = () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Contact Information</h1>
      {contactData ? (
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <strong>Name:</strong> {contactData.customerName}
          </p>
          <p>
            <strong>Email:</strong> {contactData.customerEmail}
          </p>
          <p>
            <strong>Phone:</strong> {contactData.customerPhone}
          </p>
          <p>
            <strong>Address:</strong> {contactData.address}
          </p>
          <button
            onClick={openContactForm}
            className="mt-3 bg-gray-200 text-black px-4 py-2 rounded w-full"
          >
            Edit Contact Information
          </button>
        </div>
      ) : (
        <button
          onClick={openContactForm}
          className="bg-gray-200 text-black px-4 py-2 rounded w-[80%] mx-auto"
        >
          Enter Contact Information
        </button>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto p-4 mt-14">
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-md border ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-md border ${
              activeTab === "payments"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-md border ${
              activeTab === "contact"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Contact Information
          </button>
        </div>

        {/* Render active tab content */}
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "payments" && renderPaymentsTab()}
        {activeTab === "contact" && renderContactTab()}
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactFormModal
          initialEmail={contactData ? contactData.customerEmail : email}
          onSubmit={handleContactSubmit}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </>
  );
};

export default ProfilePage;
