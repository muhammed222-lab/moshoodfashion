"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { ToggleRight, ToggleLeft, Search, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  orderCount: number;
  isDisabled: boolean;
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch users using the API route
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error("Error fetching users:", data.error);
      }
    }
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string) => {
    // For demonstration, simply update the local state.
    // In production, consider building an API route to securely update the user's status.
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isDisabled: !u.isDisabled } : u
      )
    );
  };

  const removeUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    // For demonstration, simply update the local state.
    // In production, build an API route to securely remove the user.
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="p-4 w-[70%] mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Users</h1>
        <div className="mb-6 flex items-center border border-gray-300 rounded overflow-hidden shadow-sm">
          <div className="bg-blue-500 p-2">
            <Search size={18} className="text-white" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Joined Date</th>
                <th className="py-2 px-4 border-b text-center">Orders</th>
                <th className="py-2 px-4 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.joinedDate}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {user.orderCount}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`flex items-center justify-center w-28 px-2 py-1 rounded transition-colors ${
                          user.isDisabled
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                        title={user.isDisabled ? "Enable User" : "Disable User"}
                      >
                        {user.isDisabled ? (
                          <>
                            <ToggleLeft size={18} className="mr-1" /> Enable
                          </>
                        ) : (
                          <>
                            <ToggleRight size={18} className="mr-1" /> Disable
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="flex items-center justify-center w-28 px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                        title="Remove User"
                      >
                        <Trash2 size={18} className="mr-1" /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-600 border-t"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Page;
