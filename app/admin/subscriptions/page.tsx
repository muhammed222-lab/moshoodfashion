"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { supabase } from "../../../lib/supabaseClient";

interface Subscription {
  id: number;
  email: string;
  subscription_date: string;
}

const Page = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("subscription_date", { ascending: false });
      if (error) {
        console.error("Error fetching subscriptions:", error);
      } else if (data) {
        setSubscriptions(data as Subscription[]);
      }
      setLoading(false);
    }
    fetchSubscriptions();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 w-[70%] mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>
        {loading ? (
          <p>Loading subscriptions...</p>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xl">
                Total Subscriptions: {subscriptions.length}
              </p>
            </div>
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Email</th>
                    <th className="py-2 px-4 border-b text-left">
                      Subscription Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{sub.email}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(sub.subscription_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Page;
