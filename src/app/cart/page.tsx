"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  quantity: number;
  product?: { id: string; name: string; price: number; image: string };
}

interface CityFee {
  name: string;
  fee: number;
}

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore();
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
        toast.success("Order placed!");
        const createdOrder = Array.isArray(data.orders)
          ? data.orders[data.orders.length - 1]
          : null;
        await cart.fetchCart();
        if (createdOrder && createdOrder._id) {
          router.push(`/orders/${createdOrder._id}`);
        } else {
          router.push("/profile");
        }
      } catch (e: any) {
        toast.error(e.message || "Checkout failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, [cart, formik]);

  const items = cart.items as CartItem[];
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (it.product ? it.product.price * it.quantity : 0),
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
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await cart.remove(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item from cart");
    }
  };

  if (loading)
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          items.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 border rounded p-4 bg-white dark:bg-gray-900 dark:text-white"
            >
              {it.product && (
                <Image
                  src={it.product.image}
                  alt={it.product.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold">{it.product?.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => updateQuantity(it.productId, -1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <span className="min-w-[24px] text-center">
                    {it.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(it.productId, 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-orange-600 font-bold">
                {it.product
                  ? `$${(it.product.price * it.quantity).toFixed(2)}`
                  : ""}
              </div>
              <div>
                <button
                  onClick={() => removeItem(it.productId)}
                  className="text-red-500 hover:text-red-700"
                >
                  remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={formik.handleSubmit}
        className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white space-y-4"
      >
        <h2 className="text-xl font-semibold">Shipping Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">City</label>
            <select
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
            >
              {cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (+${c.fee.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Street Address</label>
            <input
              name="street"
              value={formik.values.street}
              onChange={formik.handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Subtotal: ${subtotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Delivery: ${deliveryFee.toFixed(2)}
          </div>
          <div className="text-lg font-semibold">
            Total: ${grandTotal.toFixed(2)}
          </div>
          <button
            type="submit"
            disabled={items.length === 0 || submitting}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Placing..." : "Checkout"}
          </button>
        </div>
      </form>
    </main>
  );
}
