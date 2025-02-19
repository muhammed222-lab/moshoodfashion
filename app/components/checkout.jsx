import React from "react";

const Checkout = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">CHECKOUT</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">INFORMATION</h2>
        <div className="flex space-x-4">
          <span className="text-gray-700">SHIPPING</span>
          <span className="text-gray-700">PAYMENT</span>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">CONTACT INFO</h2>
        <form className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Phone</span>
            <input
              type="tel"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </label>
        </form>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">SHIPPING ADDRESS</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">First Name</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Last Name</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-gray-700">Country</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">State / Region</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Address</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">City</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Postal Code</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
          </div>
        </form>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">YOUR ORDER</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <p>
              Base Heavy T-Shirt <span className="text-blue-500">Change</span>
            </p>
            <p>Black/L (1) $99</p>
          </div>
          <div className="flex justify-between">
            <p>
              Basic Fit T-Shirt <span className="text-blue-500">Change</span>
            </p>
            <p>Black/L (1) $99</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Subtotal: $180.00</p>
          <p className="text-gray-600">Shipping: Calculated at next step</p>
          <p className="text-gray-600 font-bold">Total: $180.00</p>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
