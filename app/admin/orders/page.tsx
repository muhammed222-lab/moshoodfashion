"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiX,
  FiTruck,
  FiMessageSquare,
  FiSearch,
} from "react-icons/fi";
import { supabase } from "../../../lib/supabaseClient";

// Define a type for each order item
interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  orderItems: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  orderDate: string;
  totalAmount: number;
  amountPaid: number;
  isPaid: boolean;
  status: "Pending" | "Sent" | "Completed" | "Cancelled";
}

const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

const Page = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch orders from the "orders" table in Supabase
  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: false });
      if (error) {
        console.error("Error fetching orders:", error);
      } else if (data) {
        const mappedOrders: Order[] = data.map((order: Order) => ({
          id: order.id,
          // order_items is assumed to be a JSON array already parsed,
          // otherwise use JSON.parse if it is a string.
          orderItems: order.orderItems,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          address: order.address,
          orderDate: order.orderDate,
          totalAmount: Number(order.totalAmount),
          amountPaid: Number(order.amountPaid),
          isPaid: order.isPaid,
          status: order.status,
        }));
        setOrders(mappedOrders);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const updateOrderStatus = (orderId: number, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  // Filter orders by customer name, email, or order id
  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.id).includes(searchQuery)
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-4 w-[70%] mx-auto mt-20 text-center">
          <p>Loading orders...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6 w-[70%] mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-8 text-center">Orders</h1>
        <div className="mb-6 flex items-center w-full max-w-lg mx-auto">
          <FiSearch className="text-green-500 mr-2" />
          <input
            type="text"
            placeholder="Search by Name, Email or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FiUser className="text-gray-600 mr-2" />
                    {order.customerName}{" "}
                    <span className="text-sm text-gray-500 ml-1">
                      (Order #{order.id})
                    </span>
                  </h2>
                  <p className="text-gray-500 text-sm flex items-center">
                    <FiCalendar className="mr-1" /> {order.orderDate}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Order Items
                  </p>
                  <ul className="space-y-2">
                    {order.orderItems.map((item) => (
                      <li key={item.id} className="flex items-center space-x-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-gray-800 font-medium">
                            {item.name}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Qty: {item.quantity} &bull;{" "}
                            {formatter.format(item.price)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2 space-y-1">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiMail className="mr-1" /> {order.customerEmail}
                  </p>
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiPhone className="mr-1" /> {order.customerPhone}
                  </p>
                </div>
                <div className="mb-2">
                  <p className="flex items-center text-sm text-gray-600 font-medium">
                    <FiMapPin className="mr-1" /> {order.address}
                  </p>
                </div>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="flex items-center text-sm text-gray-600 font-medium">
                      <FiDollarSign className="mr-1" /> Total:
                    </p>
                    <p className="text-gray-700 text-base">
                      {formatter.format(order.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center text-sm text-gray-600 font-medium">
                      Paid:
                    </p>
                    <p className="text-gray-700 text-base">
                      {formatter.format(order.amountPaid)}{" "}
                      {order.isPaid ? "(Yes)" : "(No)"}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Status:{" "}
                    <span className="text-gray-800">{order.status}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <button
                    onClick={() => updateOrderStatus(order.id, "Sent")}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FiTruck className="mr-1" /> Order Sent
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, "Completed")}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <FiCheckCircle className="mr-1" /> Completed
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, "Cancelled")}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <FiX className="mr-1" /> Cancel Order
                  </button>
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    <FiMessageSquare className="mr-1" /> Message
                  </a>
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
