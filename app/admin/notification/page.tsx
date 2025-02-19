"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../components/header";

const NotificationPage = () => {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch subscriptions and filter unique emails
  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("email");
      if (error) {
        console.error("Error fetching subscriptions:", error);
        return;
      }
      const uniqueEmails = Array.from(
        new Set(data?.map((sub: { email: string }) => sub.email))
      );
      setSubscriptions(uniqueEmails);
    };

    fetchSubscriptions();
  }, []);

  // Handler to send notifications with type "daily" or "weekend"
  const handleSendNotification = async (type: "daily" | "weekend") => {
    setLoading(true);
    try {
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const result = await res.json();
      setNotificationMessage(result.message || "Notifications sent");
    } catch (error) {
      console.error("Error sending notifications:", error);
      setNotificationMessage("Failed to send notifications");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-8 mt-20">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Notification Center
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Subscription List (Unique Emails)
          </h2>
          {subscriptions.length ? (
            <ul className="divide-y divide-gray-200 mb-6">
              {subscriptions.map((email) => (
                <li key={email} className="py-2 text-gray-600">
                  {email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mb-6">No subscriptions found.</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSendNotification("daily")}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
            >
              {loading ? "Sending..." : "Send Daily Notification Email"}
            </button>
            <button
              onClick={() => handleSendNotification("weekend")}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition-colors"
            >
              {loading ? "Sending..." : "Send Weekend Notification Email"}
            </button>
          </div>

          {notificationMessage && (
            <p className="mt-4 text-green-600 font-medium">
              {notificationMessage}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
