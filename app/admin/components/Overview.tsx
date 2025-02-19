"use client";
import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaShoppingBag,
  FaDollarSign,
  FaClipboardCheck,
  FaInbox,
  FaChartLine,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { supabase } from "../../../lib/supabaseClient";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Overview = () => {
  // Note: Total Users count is set as a dummy value because Supabase Auth does not support listing all users on the client side.
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [deliveredOrders, setDeliveredOrders] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<number>(0);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  useEffect(() => {
    async function fetchOverview() {
      // Since we're using Supabase Auth, fetching the user count directly is not allowed on the client side.
      // You could use a secure server-side API or an Edge Function.
      // For now, we set a dummy value.
      setTotalUsers(0);

      // Total Orders
      const { count: orderCount, error: orderError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      if (orderError) {
        console.error("Error fetching orders:", orderError);
      } else {
        setTotalOrders(orderCount || 0);
      }

      // Delivered Orders: orders with status "Completed"
      const { count: deliveredCount, error: deliveredError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "Completed");
      if (deliveredError) {
        console.error("Error fetching delivered orders:", deliveredError);
      } else {
        setDeliveredOrders(deliveredCount || 0);
      }

      // Active Orders: orders with status "Pending" or "Sent"
      const { count: activeCount, error: activeError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["Pending", "Sent"]);
      if (activeError) {
        console.error("Error fetching active orders:", activeError);
      } else {
        setActiveOrders(activeCount || 0);
      }

      // Total Requests from "product_requests" table
      const { count: requestsCount, error: requestsError } = await supabase
        .from("product_requests")
        .select("*", { count: "exact", head: true });
      if (requestsError) {
        console.error("Error fetching product requests:", requestsError);
      } else {
        setTotalRequests(requestsCount || 0);
      }

      // Total Income from "payments" table (sum all payment amounts)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("amount");
      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
      } else if (paymentsData) {
        const income = paymentsData.reduce(
          (acc: number, payment: { amount: number }) =>
            acc + Number(payment.amount || 0),
          0
        );
        setTotalIncome(income);
      }
    }
    fetchOverview();
  }, []);

  // Dummy data for the chart
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [300, 500, 400, 600, 700, 500],
        fill: false,
        borderColor: "#3b82f6",
        tension: 0.1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
    responsive: true,
  };

  return (
    <div className="p-4 w-[70%] m-auto mt-20">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white shadow rounded p-4 flex items-center">
          <FaUsers className="text-blue-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
          </div>
        </div>
        {/* Total Orders */}
        <div className="bg-white shadow rounded p-4 flex items-center">
          <FaShoppingBag className="text-green-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
          </div>
        </div>
        {/* Total Income */}
        <div className="bg-white shadow rounded p-4 flex items-center">
          <FaDollarSign className="text-yellow-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Income</p>
            <p className="text-2xl font-bold">
              {formatter.format(totalIncome)}
            </p>
          </div>
        </div>
        {/* Delivered Orders */}
        <div className="bg-white shadow rounded p-4 flex items-center">
          <FaClipboardCheck className="text-purple-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Delivered Orders</p>
            <p className="text-2xl font-bold">
              {deliveredOrders.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Active Orders */}
        <div className="bg-white shadow rounded p-4 flex items-center">
          <FaInbox className="text-red-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Active Orders</p>
            <p className="text-2xl font-bold">
              {activeOrders.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Total Requests */}
        <div className="bg-white shadow rounded p-4 flex items-center">
          <FaChartLine className="text-indigo-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Requests</p>
            <p className="text-2xl font-bold">
              {totalRequests.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      {/* Chart Section */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-bold mb-4">Sales Trend</h3>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default Overview;
