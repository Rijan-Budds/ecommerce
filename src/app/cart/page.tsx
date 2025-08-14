"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaTruck, FaCreditCard, FaUser, FaEnvelope, FaMapMarkerAlt, FaHome } from "react-icons/fa";

interface CartItem {
  productId: string;
  quantity: number;
  product?: { 
    id: string; 
    name: string; 
    price: number; 
    image: string;
    slug: string;
    category: string;
  } | null;
}

interface CityFee {
  name: string;
  fee: number;
}

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore();
  const { refreshOrders } = useProfileStore();
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<CityFee[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      city: "Kathmandu",
      street: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      city: Yup.string().required("City is required"),
      street: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (items.length === 0) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...values,
            address: {
              city: values.city,
              street: values.street,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Checkout failed");
        toast.success("Order placed successfully! 🎉");
        
        console.log("Order creation response:", data);
        
        const createdOrder = Array.isArray(data.orders)
          ? data.orders[data.orders.length - 1]
          : null;
        
        console.log("Created order:", createdOrder);
        
        await cart.fetchCart();
        await refreshOrders();
        
        if (createdOrder && createdOrder._id) {
          router.push(`/orders/${createdOrder._id}`);
        } else {
          router.push("/profile");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Checkout failed";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const loadData = useCallback(async () => {
    try {
      await cart.fetchCart();
      const citiesRes = await fetch(`/api/shipping/cities`);
      const citiesData = await citiesRes.json();
      setCities(citiesData.cities || []);
      if ((citiesData.cities || []).length > 0) {
        formik.setFieldValue("city", citiesData.cities[0].name);
      }
    } finally {
      setLoading(false);
    }
  }, [cart, formik]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const items = cart.items as CartItem[];
  
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (it.product && typeof it.product.price === 'number' ? it.product.price * it.quantity : 0),
        0
      ),
    [items]
  );

  const deliveryFee = useMemo(() => {
    return cities.find((c) => c.name === formik.values.city)?.fee ?? 5;
  }, [cities, formik.values.city]);

  const grandTotal = subtotal + deliveryFee;

  const updateQuantity = async (productId: string, delta: number) => {
    const current = items.find((it) => it.productId === productId);
    const newQuantity = Math.max(1, (current?.quantity || 0) + delta);
    try {
      await cart.update(productId, newQuantity);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await cart.remove(productId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item from cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] rounded-full mb-4">
            <FaShoppingCart className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShoppingCart className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Looks like you haven&apos;t added any items to your cart yet.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="flex items-center p-6">
                      {/* Product Image */}
                      {it.product && (
                        <div className="relative mr-6">
                          <Image
                            src={it.product.image}
                            alt={it.product.name}
                            width={120}
                            height={120}
                            className="w-24 h-24 object-cover rounded-xl shadow-md"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {it.quantity}
                          </div>
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {it.product?.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Category: {it.product?.category}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(it.productId, -1)}
                              className="w-8 h-8 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#0D3B66] transition-colors duration-200"
                            >
                              <FaMinus className="text-sm" />
                            </button>
                            <span className="min-w-[40px] text-center font-semibold text-gray-900 dark:text-white">
                              {it.quantity || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(it.productId, 1)}
                              className="w-8 h-8 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#0D3B66] transition-colors duration-200"
                            >
                              <FaPlus className="text-sm" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              रु{it.product?.price?.toFixed(2)} each
                            </p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                              रु{(it.product?.price || 0) * it.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(it.productId)}
                        className="ml-4 p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        title="Remove item"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center">
                  <FaCreditCard className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Checkout
                </h2>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal ({items.length} items)</span>
                    <span>रु{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="flex items-center">
                      <FaTruck className="mr-2" />
                      Delivery
                    </span>
                    <span>रु{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                        रु{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FaUser className="mr-2" />
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FaEnvelope className="mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    City
                  </label>
                  <select
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  >
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} (+रु{c.fee.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FaHome className="mr-2" />
                    Street Address
                  </label>
                  <input
                    name="street"
                    value={formik.values.street}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your street address"
                  />
                </div>

                {/* Checkout Button */}
                <button
                  type="submit"
                  disabled={items.length === 0 || submitting}
                  className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:shadow-lg"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaCreditCard className="mr-2" />
                      Complete Order - रु{grandTotal.toFixed(2)}
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}