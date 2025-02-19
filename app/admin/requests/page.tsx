"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import {
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInfo,
} from "react-icons/fi";
import { supabase } from "../../../lib/supabaseClient";

interface Request {
  id: number;
  inspirationImages: string[];
  budget: number;
  expectedDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  gender: string;
  clothingSize: string;
  additionalInfo: string;
  submittedDate: string;
}

const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const Page = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch requests from the "product_requests" table in Supabase
  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from("product_requests")
        .select("*")
        .order("submitted_date", { ascending: false });
      if (error) {
        console.error("Error fetching requests:", error);
      } else if (data) {
        const mappedRequests: Request[] = data.map((req: Request) => ({
          id: req.id,
          inspirationImages: req.inspirationImages, // maps to string[]
          budget: req.budget,
          expectedDate: req.expectedDate,
          contactName: req.contactName,
          contactEmail: req.contactEmail,
          contactPhone: req.contactPhone,
          address: req.address,
          gender: req.gender,
          clothingSize: req.clothingSize,
          additionalInfo: req.additionalInfo,
          submittedDate: req.submittedDate,
        }));
        setRequests(mappedRequests);
      }
      setLoading(false);
    }
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-4 w-[70%] mx-auto mt-20 text-center">
          <p>Loading product requests...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6 w-[70%] mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Product Requests
        </h1>
        {requests.length === 0 ? (
          <p className="text-center text-gray-600">No requests found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg border p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                <div className="mb-4 border-b pb-2">
                  <h2 className="text-2xl font-semibold flex items-center text-gray-800">
                    <FiUser className="mr-2 text-gray-600" /> {req.contactName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Submitted on {req.submittedDate}
                  </p>
                </div>

                {/* Inspiration Images */}
                {req.inspirationImages?.length > 0 && (
                  <div className="flex space-x-2 mb-4">
                    {req.inspirationImages.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Inspiration ${idx}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}

                <div className="mb-3">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiDollarSign className="mr-1" /> Budget
                  </p>
                  <p className="text-lg text-gray-800">
                    {formatter.format(req.budget)}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiCalendar className="mr-1" /> Expected Completion Date
                  </p>
                  <p className="text-lg text-gray-800">{req.expectedDate}</p>
                </div>

                <div className="mb-3">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiMail className="mr-1" /> {req.contactEmail}
                  </p>
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiPhone className="mr-1" /> {req.contactPhone}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiMapPin className="mr-1" /> {req.address}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiUser className="mr-1" /> {req.gender} -{" "}
                    {req.clothingSize}
                  </p>
                </div>

                <div className="mt-auto">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiInfo className="mr-1" /> Additional Information
                  </p>
                  <p className="text-gray-800 text-base break-words whitespace-pre-wrap">
                    {req.additionalInfo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
