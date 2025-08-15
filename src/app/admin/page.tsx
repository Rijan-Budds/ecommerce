"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUsers, FaShoppingCart, FaBox, FaPlus, FaTrash, FaSignOutAlt, FaEye } from "react-icons/fa";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Order {
  orderId: string;
  userId: string;
  username: string;
  email: string;
  status: "pending" | "canceled" | "delivered";
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: {
    name: string;
    email: string;
    address: { street: string; city: string };
  };
  items: { productId: string; quantity: number }[];
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{
    id: string;
    slug: string;
    name: string;
    price: number;
    category: string;
    image: string;
    discountPercentage?: number;
    inStock: boolean;
  }[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("cpu");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'products'>('overview');

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
        const errorMessage = error instanceof Error ? error.message : "Failed to load admin data";
        toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to reload products";
      toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete order";
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to add product";
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
      toast.error(errorMessage);
    }
  };

  const updateProduct = async (slug: string, updates: Partial<{ name: string; price: number; category: string; image: string; discountPercentage: number; inStock: boolean }>) => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to update product";
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductDetails = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-gray-600">Manage your ecommerce platform</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
               <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <FaUsers className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <FaBox className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    रु{orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">रु</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="flex border-b">
              {[
                { id: 'overview', label: 'Overview', icon: FaEye },
                { id: 'users', label: 'Users', icon: FaUsers },
                { id: 'orders', label: 'Orders', icon: FaShoppingCart },
                { id: 'products', label: 'Products', icon: FaBox }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as 'overview' | 'users' | 'orders' | 'products')}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === id
                      ? 'text-[#0D3B66] border-b-2 border-[#0D3B66]'
                      : 'text-gray-600 hover:text-[#0D3B66]'
                  }`}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold">{order.username}</p>
                        <p className="text-sm text-gray-600">रु{order.grandTotal?.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-sm text-gray-600">रु{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">User Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900">Username</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Email</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-t hover:bg-gray-50">
                        <td className="p-4">{user.username}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 mx-auto"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{order.username}</h4>
                      <p className="text-gray-600">{order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Ordered Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const product = getProductDetails(item.productId);
                        return product ? (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{product.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">रु{product.price.toFixed(2)} each</p>
                            </div>
                          </div>
                        ) : (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Product not found (ID: {item.productId})</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{order.customer?.address?.street}, {order.customer?.address?.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-bold text-lg text-[#0D3B66]">रु{order.grandTotal?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(order.orderId, "pending")}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateStatus(order.orderId, "delivered")}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => updateStatus(order.orderId, "canceled")}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Canceled
                    </button>
                    <button
                      onClick={() => deleteOrder(order.orderId)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Products Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900">Product Management</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Image</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Name</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Category</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Price</th>
                        <th className="text-center p-4 font-semibold text-gray-900">Discount %</th>
                        <th className="text-center p-4 font-semibold text-gray-900">Stock</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t hover:bg-gray-50">
                          <td className="p-4">
                            <Image 
                              src={product.image} 
                              alt={product.name} 
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-lg" 
                            />
                          </td>
                          <td className="p-4">
                            <input
                              defaultValue={product.name}
                              onBlur={(e) => updateProduct(product.slug, { name: e.target.value })}
                              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              defaultValue={product.category}
                              onChange={(e) => updateProduct(product.slug, { category: e.target.value })}
                              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            >
                              <option value="cpu">CPU</option>
                              <option value="keyboard">Keyboard</option>
                              <option value="monitor">Monitor</option>
                              <option value="speaker">Speaker</option>
                              <option value="mouse">Mouse</option>
                              <option value="trending">Trending</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={product.price}
                              onBlur={(e) => updateProduct(product.slug, { price: Number(e.target.value) })}
                              className="border rounded-lg px-3 py-2 w-32 text-right bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              defaultValue={product.discountPercentage || 0}
                              onBlur={(e) => updateProduct(product.slug, { discountPercentage: Number(e.target.value) })}
                              className="border rounded-lg px-3 py-2 w-20 text-center bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => updateProduct(product.slug, { inStock: !product.inStock })}
                              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                product.inStock 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => deleteProduct(product.slug)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                            >
                              <FaTrash />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Product Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <FaPlus className="text-[#0D3B66]" />
                  <span>Add New Product</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                  />
                  <input
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                  >
                    <option value="cpu">CPU</option>
                    <option value="keyboard">Keyboard</option>
                    <option value="monitor">Monitor</option>
                    <option value="speaker">Speaker</option>
                    <option value="mouse">Mouse</option>
                    <option value="trending">Trending</option>
                  </select>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent w-full"
                      disabled={uploading}
                    />
                  </div>

                  {image && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preview
                      </label>
                      <Image
                        src={image}
                        alt="Uploaded preview"
                        width={200}
                        height={200}
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <button
                      onClick={addProduct}
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          <span>Add Product</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}