"use client";

import React, { useState, useEffect, DragEvent } from "react";
import Header from "../components/header";
import { FiAlertCircle } from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";

const RequestPage = () => {
  // States for file upload & previews
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Request form states
  const [budget, setBudget] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [clothingSize, setClothingSize] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Error/message state
  const [formMessage, setFormMessage] = useState("");

  // States for listing & editing requests
  interface Request {
    id: string;
    inspiration_images: string[];
    budget: string;
    expected_date: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    gender: string;
    clothing_size: string;
    additional_info: string;
  }

  const [requests, setRequests] = useState<Request[]>([]);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingAdditionalInfo, setEditingAdditionalInfo] = useState("");

  // Handle file selection (max 3 files)
  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files).slice(0, 3);
    setSelectedFiles(fileArray);
    const previewArray = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews(previewArray);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Upload files to Supabase Storage (bucket "Requests") and return an array of public URLs
  const uploadFiles = async () => {
    const urls: string[] = [];
    for (const file of selectedFiles) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Requests")
        .upload(fileName, file);
      if (uploadError) {
        console.error("Upload Error:", uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("Requests").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  // Submit the request form: upload images and insert record into "requests" table
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage("");
    // Get current logged in user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setFormMessage("Please log in to submit a request.");
      return;
    }
    // Upload images if any
    const imageUrls = selectedFiles.length > 0 ? await uploadFiles() : [];

    const requestData = {
      user_id: session.user.id,
      inspiration_images: imageUrls,
      budget,
      expected_date: expectedDate,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      address,
      gender,
      clothing_size: clothingSize,
      additional_info: additionalInfo,
    };

    // Verify that your table name ("requests") exists in Supabase.
    const { error } = await supabase
      .from("product_requests")
      .insert(requestData);
    if (error) {
      setFormMessage(error.message);
    } else {
      // Clear the form and show a pop-up on success
      setFormMessage("Request submitted successfully!");
      window.alert("Request submitted successfully!");
      setSelectedFiles([]);
      setPreviews([]);
      setBudget("");
      setExpectedDate("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setAddress("");
      setGender("");
      setClothingSize("");
      setAdditionalInfo("");
      loadRequests();
    }
  };

  // Load current user's requests
  const loadRequests = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data, error } = await supabase
      .from("product_requests") // Ensure this table exists (or adjust to "product_requests" if needed)
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Load Requests Error:", error.message);
    } else {
      setRequests(data || []);
    }
  };

  // Delete a request
  const handleCancelRequest = async (id: string) => {
    const { error } = await supabase
      .from("product_requests")
      .delete()
      .eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      loadRequests();
    }
  };

  // Begin editing a request
  const handleEditRequest = (req: any) => {
    setEditingRequestId(req.id);
    setEditingAdditionalInfo(req.additional_info);
  };

  // Save edited additional info
  const handleSaveEdit = async () => {
    if (!editingRequestId) return;
    const { error } = await supabase
      .from("product_requests")
      .update({ additional_info: editingAdditionalInfo })
      .eq("id", editingRequestId);
    if (error) {
      alert(error.message);
    } else {
      setEditingRequestId(null);
      setEditingAdditionalInfo("");
      loadRequests();
    }
  };

  // Load requests on mount
  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-4 mt-32">
        <h1 className="text-3xl font-bold mb-4">Request a Specific Product</h1>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the details below to request a product. Our team will review
          your request and contact you at{" "}
          <span className="font-semibold">info@moshoodfashion.store</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Inspiration Images */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Upload Inspiration Images (max 3)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer"
            >
              <p className="text-gray-500">
                Drag and drop images here, or click the button below.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
            {previews.length > 0 && (
              <div className="flex space-x-4 mt-4">
                {previews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`preview ${index}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Budget{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="Enter your budget in USD"
              />
            </label>
            <input
              type="number"
              placeholder="Enter budget in USD"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Expected Completion Time */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Expected Completion Time{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="When do you need the product?"
              />
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Contact Information{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="Your contact details"
              />
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-2"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-2"
            />
            <input
              type="tel"
              placeholder="Your Phone Number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Address{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="Your delivery or billing address"
              />
            </label>
            <textarea
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Gender{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="Select your gender"
              />
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Clothing Size */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Clothing Size{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="Enter your clothing size"
              />
            </label>
            <input
              type="text"
              placeholder="e.g., S, M, L, XL"
              value={clothingSize}
              onChange={(e) => setClothingSize(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Additional Information{" "}
              <FiAlertCircle
                className="inline text-red-500 ml-1"
                title="Provide any extra details or requirements"
              />
            </label>
            <textarea
              placeholder="Enter any extra details or requirements"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Request
          </button>
          {formMessage && (
            <p className="mt-4 text-center text-green-600">{formMessage}</p>
          )}
        </form>
        {/* All My Requests Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">All My Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-600">
              You have not submitted any requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-md p-4"
                >
                  {/* Display Request Image or Banner */}
                  {req.inspiration_images &&
                  req.inspiration_images.length > 0 ? (
                    <img
                      src={req.inspiration_images[0]}
                      alt="Request Image"
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                      <p className="text-lg font-semibold">Request</p>
                    </div>
                  )}
                  <p>
                    <span className="font-semibold">Budget:</span> {req.budget}{" "}
                    USD
                  </p>
                  <p>
                    <span className="font-semibold">Expected Date:</span>{" "}
                    {req.expected_date}
                  </p>
                  <p>
                    <span className="font-semibold">Contact:</span>{" "}
                    {req.contact_name} | {req.contact_email} |{" "}
                    {req.contact_phone}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {req.address}
                  </p>
                  <p>
                    <span className="font-semibold">Gender:</span> {req.gender}
                  </p>
                  <p>
                    <span className="font-semibold">Clothing Size:</span>{" "}
                    {req.clothing_size}
                  </p>
                  <p>
                    <span className="font-semibold">Additional Info:</span>{" "}
                    {editingRequestId === req.id ? (
                      <>
                        <input
                          type="text"
                          value={editingAdditionalInfo}
                          onChange={(e) =>
                            setEditingAdditionalInfo(e.target.value)
                          }
                          className="border p-1 mr-2"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="text-blue-600 underline mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRequestId(null)}
                          className="text-gray-600 underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {req.additional_info}
                        <button
                          onClick={() => handleEditRequest(req)}
                          className="text-blue-600 underline ml-2"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => handleCancelRequest(req.id)}
                    className="mt-2 text-red-600 underline"
                  >
                    Cancel Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestPage;
