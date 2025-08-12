"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Order, Product } from "@/lib/types";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("cpu");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, oRes, pRes] = await Promise.all([
          fetch("/api/admin/users", {
            credentials: "include",
          }),
          fetch("/api/admin/orders", {
            credentials: "include",
          }),
          fetch("/api/products", {
            credentials: "include",
          }),
        ]);

        if (uRes.status === 403) {
          toast.error("Forbidden: Admin only");
          setLoading(false);
          return;
        }

        const uData = await uRes.json();
        const oData = await oRes.json();
        const pData = await pRes.json();
        setUsers(uData.users || []);
        setOrders(oData.orders || []);
        setProducts(pData.products || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load admin data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reloadProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reload products";
      toast.error(message);
    }
  };

  const updateStatus = async (
    orderId: string,
    status: "pending" | "canceled" | "delivered"
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
      );
      toast.success("Order status updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete order");
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      toast.success("Order deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete order";
      toast.error(message);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
    }
  };

  const addProduct = async () => {
    if (!name || !price || !category || !image) {
      toast.error("Fill all fields");
      return;
    }
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      toast.success("Product added");
      setName("");
      setPrice("");
      setCategory("cpu");
      setImage("");
      await reloadProducts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add product";
      toast.error(message);
    }
  };

  const deleteProduct = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Product deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete product";
      toast.error(message);
    }
  };

  const updateProduct = async (slug: string, updates: Partial<{ name: string; price: number; category: string; image: string }>) => {
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setProducts((prev) => prev.map((p) => (p.slug === slug ? data.product : p)));
      toast.success("Product updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update product";
      toast.error(message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setImage(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="max-w-6xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <button
        onClick={handleLogout}
        className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00]"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Users Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-2">Username</th>
                <th className="text-left p-2">Email</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="px-3 py-1 rounded border text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Orders Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {o.username} ({o.email})
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm">
                Status:{" "}
                <span className="font-medium capitalize">{o.status}</span>
              </div>
              <div className="text-sm">
                Address: {o.customer?.address},{" "}
                {o.customer?.city}
              </div>
              <div className="text-sm">
                Totals: Subtotal $
                {o.subtotal !== undefined ? o.subtotal.toFixed(2) : "0.00"} +
                Delivery $
                {o.deliveryFee !== undefined
                  ? o.deliveryFee.toFixed(2)
                  : "0.00"}{" "}
                ={" "}
                <span className="font-semibold">
                  $
                  {o.grandTotal !== undefined
                    ? o.grandTotal.toFixed(2)
                    : "0.00"}
                </span>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => updateStatus(o.orderId || o._id, "pending")}
                  className="px-3 py-1 rounded border"
                >
                  Pending
                </button>
                <button
                  onClick={() => updateStatus(o.orderId || o._id, "canceled")}
                  className="px-3 py-1 rounded border"
                >
                  Canceled
                </button>
                <button
                  onClick={() => updateStatus(o.orderId || o._id, "delivered")}
                  className="px-3 py-1 rounded border"
                >
                  Delivered
                </button>
                <button
                  onClick={() => deleteOrder(o.orderId || o._id)}
                  className="px-3 py-1 rounded border text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Management */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-2">Image</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-2">
                    <Image src={p.image} alt={p.name} width={56} height={56} className="object-cover rounded" />
                  </td>
                  <td className="p-2">
                    <input
                      defaultValue={p.name}
                      onBlur={(e) => updateProduct(p.slug, { name: e.target.value })}
                      className="border rounded px-2 py-1 bg-white dark:bg-gray-800"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      defaultValue={p.category}
                      onChange={(e) => updateProduct(p.slug, { category: e.target.value })}
                      className="border rounded px-2 py-1 bg-white dark:bg-gray-800"
                    >
                      <option value="cpu">CPU</option>
                      <option value="keyboard">Keyboard</option>
                      <option value="monitor">Monitor</option>
                      <option value="speaker">Speaker</option>
                      <option value="mouse">Mouse</option>
                      <option value="trending">Trending</option>
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={p.price}
                      onBlur={(e) => updateProduct(p.slug, { price: Number(e.target.value) })}
                      className="border rounded px-2 py-1 w-28 text-right bg-white dark:bg-gray-800"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => deleteProduct(p.slug)}
                      className="px-3 py-1 rounded border text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Product Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Add Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded p-4 bg-white dark:bg-gray-900 dark:text-white">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800"
          />
          {/* Slug is auto-generated on the server from the product name */}
          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800"
          >
            <option value="cpu">CPU</option>
            <option value="keyboard">Keyboard</option>
            <option value="monitor">Monitor</option>
            <option value="speaker">Speaker</option>
            <option value="mouse">Mouse</option>
            <option value="trending">Trending</option>
          </select>

          {/* File input for image upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800 md:col-span-2"
            disabled={uploading}
          />

          {/* Image preview */}
          {image && (
            <img
              src={image}
              alt="Uploaded preview"
              className="w-40 h-40 object-cover rounded mt-2 md:col-span-2"
            />
          )}

          {/* Add product button */}
          <div className="md:col-span-2">
            <button
              onClick={addProduct}
              disabled={uploading}
              className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Add Product"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
