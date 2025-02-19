"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import { supabase } from "../../lib/supabaseClient";

const OrdersPage = () => {
  interface Order {
    id: number;
    order_date: string;
    total_amount: number;
    status: string;
    order_items: {
      image: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  }

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrdersAndUser = async () => {
      try {
        // Get logged-in user's session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        const email = session.user.email;

        // Fetch orders where customer_email matches the logged-in email
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_date, total_amount, status, order_items")
          .eq("customer_email", email);

        if (error) throw error;

        // Ensure `order_items` is parsed correctly
        const parsedOrders = data?.map((order) => ({
          ...order,
          order_items:
            typeof order.order_items === "string"
              ? JSON.parse(order.order_items)
              : order.order_items || [],
        }));

        setOrders(parsedOrders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrdersAndUser();
  }, []);

  const cancelOrder = useCallback(async (orderId: number) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state after cancellation
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4 mt-12">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <p className="text-gray-600">You have no orders.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              // Determine the primary image to use
              const primaryImage =
                order.order_items?.length > 0
                  ? order.order_items[0]?.image || "/placeholder.jpg"
                  : "/placeholder.jpg";

              return (
                <div
                  key={order.id}
                  className="bg-white shadow-lg rounded-lg overflow-hidden"
                >
                  <img
                    src={primaryImage}
                    alt="Product"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-lg font-semibold mb-2">
                      Order ID:{" "}
                      {order.id ? (
                        order.id
                      ) : (
                        <span className="text-red-500">Empty</span>
                      )}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {order.order_date ? (
                        order.order_date
                      ) : (
                        <span className="text-red-500">Empty</span>
                      )}
                    </p>
                    <p>
                      <strong>Total Amount:</strong>{" "}
                      {order.total_amount ? (
                        `₦${order.total_amount}`
                      ) : (
                        <span className="text-red-500">Empty</span>
                      )}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {order.status ? (
                        order.status
                      ) : (
                        <span className="text-red-500">Empty</span>
                      )}
                    </p>
                    <div className="mt-2">
                      <strong>Items:</strong>
                      {order.order_items?.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {order.order_items.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <img
                                src={item.image || "/placeholder.jpg"}
                                alt={item.name || "Empty"}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p>
                                  <span className="font-semibold">Name: </span>
                                  {item.name || (
                                    <span className="text-red-500">Empty</span>
                                  )}
                                </p>
                                <p>
                                  <span className="font-semibold">Price: </span>
                                  ₦
                                  {item.price || (
                                    <span className="text-red-500">Empty</span>
                                  )}
                                </p>
                                <p>
                                  <span className="font-semibold">Qty: </span>
                                  {item.quantity || (
                                    <span className="text-red-500">Empty</span>
                                  )}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-red-500">Empty</p>
                      )}
                    </div>
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
