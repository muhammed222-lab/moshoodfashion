"use client";

import React, { useState, useEffect } from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { ContactFormModal } from "./ContactFormModal";
import { FlutterWaveResponse } from "flutterwave-react-v3/dist/types";

// Define a cart item type
interface CartItemType {
  id: string;
  name: string;
  category: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

interface CheckoutButtonProps {
  total: number;
  email: string;
  cartItems: CartItemType[];
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  total,
  email,
  cartItems,
}) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
  } | null>(null);

  // When the component mounts, check if there is saved contact info for this email.
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(
          `/api/contact-info?email=${encodeURIComponent(email)}`
        );
        if (res.ok) {
          const data = await res.json();
          // Assuming API returns { data: [record] }
          if (data && data.data && data.data.length > 0) {
            const record = data.data[0];
            setContactData({
              customerName: record.customer_name,
              customerEmail: record.customer_email,
              customerPhone: record.customer_phone,
              address: record.address,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };
    fetchContactInfo();
  }, [email]);

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
        method: "POST",
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
    } catch (error) {
      console.error("Error saving contact info:", error);
    }
    setContactData(data);
    setShowContactForm(false);
  };

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLWPUBK || "",
    tx_ref: Date.now().toString(),
    amount: total,
    currency: "NGN",
    payment_options: "card, mobilemoney, ussd",
    customer: {
      email: contactData ? contactData.customerEmail : email,
      phone_number: contactData ? contactData.customerPhone : "08012345678",
      name: contactData ? contactData.customerName : "Customer",
    },
    customizations: {
      title: "Moshood Fashion Store",
      description: "Payment for your cart items",
      logo: "/favicon.png",
    },
  };

  const handleFlutterPayment = async (response: FlutterWaveResponse) => {
    console.log("Payment response:", response);
    closePaymentModal();

    if (response && response.status === "completed") {
      const orderDetails = {
        order_items: cartItems, // full cart items array including image URLs
        customer_name: contactData ? contactData.customerName : "Customer",
        customer_email: contactData ? contactData.customerEmail : email,
        customer_phone: contactData ? contactData.customerPhone : "08012345678",
        address: contactData ? contactData.address : "",
        order_date: new Date().toISOString().split("T")[0],
        total_amount: total,
        amount_paid: response.amount || total,
        is_paid: true,
        status: "approved",
      };

      console.log("Posting order details:", orderDetails);

      try {
        const resOrder = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderDetails),
        });
        const orderData = await resOrder.json();
        console.log("Order saved:", orderData);
      } catch (error) {
        console.error("Error saving order:", error);
      }

      const paymentDetails = {
        status: response.status,
        customer_name: response.customer.name,
        customer_email: response.customer.email,
        phone_number: response.customer.phone_number,
        transaction_id: response.transaction_id,
        tx_ref: response.tx_ref,
        flw_ref: response.flw_ref,
        currency: response.currency,
        amount: response.amount,
      };

      console.log("Posting payment details:", paymentDetails);

      try {
        const resPayment = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentDetails),
        });
        const paymentData = await resPayment.json();
        console.log("Payment saved:", paymentData);
      } catch (error) {
        console.error("Error saving payment:", error);
      }

      // Send email to user with order details including order items
      const mailPayload = {
        email: contactData ? contactData.customerEmail : email,
        subject: "Your order has been placed",
        orderDate: new Date().toISOString().split("T")[0],
        orderItems: cartItems, // pass along order items for details
        total: total,
      };

      try {
        const resMail = await fetch("/api/send-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mailPayload),
        });
        const mailResult = await resMail.json();
        console.log("Mail sent:", mailResult);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    } else {
      console.warn("Payment not successful", response);
    }
  };

  return (
    <div>
      {showContactForm && (
        <ContactFormModal
          initialEmail={contactData ? contactData.customerEmail : email}
          onSubmit={handleContactSubmit}
          onClose={() => setShowContactForm(false)}
        />
      )}
      <div className="flex flex-col gap-3">
        {/* If contact info already exists, show it. Otherwise, show button to enter info. */}
        {contactData ? (
          <div className="bg-gray-100 p-4 rounded mt-3 w-[80%] mx-auto">
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
            {/* Optionally, provide an edit button if the user wishes to update */}
            <button
              onClick={openContactForm}
              className="bg-gray-200 text-black px-4 py-2 rounded mt-3 w-full"
            >
              Edit Shipping & Contact Info
            </button>
          </div>
        ) : (
          <button
            onClick={openContactForm}
            className="bg-gray-200 text-black px-4 py-2 rounded mt-3 w-[80%] mx-auto"
          >
            Enter Shipping & Contact Info
          </button>
        )}
        {/* Proceed to Payment */}
        <FlutterWaveButton
          className="bg-black text-white px-4 py-2 rounded mt-3 w-[80%] mx-auto"
          {...config}
          text="Proceed to Payment"
          callback={handleFlutterPayment}
          onClose={() => {
            console.log("Checkout closed");
          }}
        />
      </div>
    </div>
  );
};
