"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaPlus,
  FaTrash,
  FaSignOutAlt,
  FaEye,
} from "react-icons/fa";
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
  const [products, setProducts] = useState<
    {
      id: string;
      slug: string;
      name: string;
      price: number;
      category: string;
      image: string;
      discountPercentage?: number;
      inStock: boolean;
      stockQuantity: number;
      description?: string;
    }[]
  >([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("cpu");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "orders" | "products"
  >("overview");

  // Pagination states
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const itemsPerPage = 5;
  
  // Order filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "delivered" | "canceled">("all");

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
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load admin data";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload products";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete order";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const addProduct = async () => {
    if (!name || !price || !category || !image || !stockQuantity) {
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
          description,
          stockQuantity: Number(stockQuantity),
          inStock: Number(stockQuantity) > 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      toast.success("Product added");
      setName("");
      setPrice("");
      setCategory("cpu");
      setImage("");
      setDescription("");
      setStockQuantity("");
      await reloadProducts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add product";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete product";
      toast.error(errorMessage);
    }
  };

  const updateProduct = async (
    slug: string,
    updates: Partial<{
      name: string;
      price: number;
      category: string;
      image: string;
      discountPercentage: number;
      inStock: boolean;
      stockQuantity: number;
      description: string;
    }>
  ) => {
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setProducts((prev) =>
        prev.map((p) => (p.slug === slug ? data.product : p))
      );
      toast.success("Product updated");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update product";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProductDetails = (productId: string) => {
    return products.find((product) => product.id === productId);
  };
  
  // Filter orders based on status
  const getFilteredOrders = () => {
    if (orderStatusFilter === "all") return orders;
    return orders.filter(order => order.status === orderStatusFilter);
  };

  // Pagination helper functions
  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number): number => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg ${
                page === currentPage
                  ? "bg-[#0D3B66] text-white"
                  : "bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
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
                Admin{" "}
                <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                  Dashboard
                </span>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {orders.length}
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {products.length}
                  </p>
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
                    रु
                    {orders
                      .reduce((sum, order) => sum + (order.grandTotal || 0), 0)
                      .toFixed(2)}
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
                { id: "overview", label: "Overview", icon: FaEye },
                { id: "users", label: "Users", icon: FaUsers },
                { id: "orders", label: "Orders", icon: FaShoppingCart },
                { id: "products", label: "Products", icon: FaBox },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(
                      id as "overview" | "users" | "orders" | "products"
                    );
                    // Reset pagination when switching tabs
                    setProductsPage(1);
                    setOrdersPage(1);
                    setUsersPage(1);
                  }}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === id
                      ? "text-[#0D3B66] border-b-2 border-[#0D3B66]"
                      : "text-gray-600 hover:text-[#0D3B66]"
                  }`}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Orders
                </h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold">{order.username}</p>
                        <p className="text-sm text-gray-600">
                          रु{order.grandTotal?.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          रु{product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">
                  User Management ({users.length} users)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900">
                        Username
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(users, usersPage).map((user) => (
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
                <div className="p-6">
                  <PaginationControls
                    currentPage={usersPage}
                    totalPages={getTotalPages(users.length)}
                    onPageChange={setUsersPage}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Orders Management</h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full">
                        Total: {orders.length}
                      </span>
                      <span className="bg-yellow-500/20 px-3 py-1 rounded-full">
                        Pending: {orders.filter(o => o.status === 'pending').length}
                      </span>
                      <span className="bg-green-500/20 px-3 py-1 rounded-full">
                        Delivered: {orders.filter(o => o.status === 'delivered').length}
                      </span>
                      <span className="bg-red-500/20 px-3 py-1 rounded-full">
                        Canceled: {orders.filter(o => o.status === 'canceled').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(e.target.value as "all" | "pending" | "delivered" | "canceled");
                        setOrdersPage(1); // Reset to first page when filtering
                      }}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="all" className="text-gray-900">All Orders</option>
                      <option value="pending" className="text-gray-900">Pending</option>
                      <option value="delivered" className="text-gray-900">Delivered</option>
                      <option value="canceled" className="text-gray-900">Canceled</option>
                    </select>
                    <div className="text-right text-sm">
                      <div className="opacity-80">Page {ordersPage} of {getTotalPages(getFilteredOrders().length)}</div>
                      <div className="opacity-70 text-xs">{itemsPerPage} orders per page</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Orders will appear here when customers start placing them.</p>
                  </div>
                ) : getFilteredOrders().length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No {orderStatusFilter !== "all" ? orderStatusFilter : ""} orders found
                    </h3>
                    <p className="text-gray-500">
                      {orderStatusFilter !== "all" 
                        ? `There are no ${orderStatusFilter} orders at the moment.`
                        : "Try adjusting your filter or check if orders exist."
                      }
                    </p>
                  </div>
                ) : getPaginatedData(getFilteredOrders(), ordersPage).length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No orders on this page</h3>
                    <p className="text-gray-500">Try navigating to a different page.</p>
                  </div>
                ) : (
                  getPaginatedData(getFilteredOrders(), ordersPage).map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {order.username}
                        </h4>
                        <p className="text-gray-500 text-sm">{order.email}</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <span
                          className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2 font-medium">
                        Ordered Items:
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => {
                          const product = getProductDetails(item.productId);
                          return product ? (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                                <p className="text-xs text-gray-500">
                                  रु{product.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <p className="text-xs text-red-500">
                                Product not found (ID: {item.productId})
                              </p>
                              <p className="text-xs text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-400">Address</p>
                        <p className="font-medium text-gray-700">
                          {order.customer?.address?.street},{" "}
                          {order.customer?.address?.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-bold text-lg text-[#0D3B66]">
                          रु{order.grandTotal?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => updateStatus(order.orderId, "pending")}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updateStatus(order.orderId, "delivered")}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() => updateStatus(order.orderId, "canceled")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Canceled
                      </button>
                      <button
                        onClick={() => deleteOrder(order.orderId)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 text-sm font-medium"
                      >
                        <FaTrash className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {getFilteredOrders().length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {Math.min((ordersPage - 1) * itemsPerPage + 1, getFilteredOrders().length)} to{' '}
                      {Math.min(ordersPage * itemsPerPage, getFilteredOrders().length)} of {getFilteredOrders().length} 
                      {orderStatusFilter !== "all" ? `${orderStatusFilter} ` : ""}orders
                      {orderStatusFilter !== "all" && orders.length !== getFilteredOrders().length && (
                        <span className="text-gray-400"> (filtered from {orders.length} total)</span>
                      )}
                    </div>
                    <PaginationControls
                      currentPage={ordersPage}
                      totalPages={getTotalPages(getFilteredOrders().length)}
                      onPageChange={setOrdersPage}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-8">
              {/* Products Table - Desktop */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-[#0D3B66]/5 to-[#1E5CAF]/5">
                  <h3 className="text-xl font-bold text-gray-900">
                    Product Management ({products.length} products)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Manage your product inventory, pricing, and details</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto min-w-[1200px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900 w-20">
                          Image
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 min-w-[200px]">
                          Name
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 w-32">
                          Category
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 w-28">
                          Price
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 w-25">
                          Discount %
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 w-32">
                          Stock
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 min-w-[200px]">
                          Description
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900 w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(products, productsPage).map(
                        (product) => (
                          <tr
                            key={product.id}
                            className="border-t hover:bg-gray-50 transition-colors"
                          >
                            {/* Image */}
                            <td className="p-3 align-top">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              />
                            </td>
                            
                            {/* Name */}
                            <td className="p-3 align-top">
                              <input
                                defaultValue={product.name}
                                onBlur={(e) =>
                                  updateProduct(product.slug, {
                                    name: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                              />
                            </td>

                            {/* Category */}
                            <td className="p-3 align-top">
                              <select
                                defaultValue={product.category}
                                onChange={(e) =>
                                  updateProduct(product.slug, {
                                    category: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                              >
                                <option value="cpu">CPU</option>
                                <option value="keyboard">Keyboard</option>
                                <option value="monitor">Monitor</option>
                                <option value="speaker">Speaker</option>
                                <option value="mouse">Mouse</option>
                                <option value="trending">Trending</option>
                              </select>
                            </td>

                            {/* Price */}
                            <td className="p-3 align-top">
                              <input
                                type="number"
                                step="0.01"
                                defaultValue={product.price}
                                onBlur={(e) =>
                                  updateProduct(product.slug, {
                                    price: Number(e.target.value),
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                              />
                            </td>

                            {/* Discount */}
                            <td className="p-3 align-top">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                defaultValue={product.discountPercentage || 0}
                                onBlur={(e) =>
                                  updateProduct(product.slug, {
                                    discountPercentage: Number(e.target.value),
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                              />
                            </td>
                            
                            {/* Stock */}
                            <td className="p-3 align-top">
                              <div className="space-y-2">
                                <div className="text-center">
                                  <span
                                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                      product.stockQuantity > 0
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  defaultValue={product.stockQuantity}
                                  onBlur={(e) => {
                                    const quantity = Number(e.target.value);
                                    updateProduct(product.slug, {
                                      stockQuantity: quantity,
                                      inStock: quantity > 0,
                                    });
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                                />
                              </div>
                            </td>

                            {/* Description */}
                            <td className="p-3 align-top">
                              <textarea
                                placeholder="Product description..."
                                defaultValue={product.description}
                                rows={3}
                                onBlur={(e) =>
                                  updateProduct(product.slug, {
                                    description: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent resize-none transition-all"
                              />
                            </td>
                            
                            {/* Actions */}
                            <td className="p-3 align-top">
                              <button
                                onClick={() => deleteProduct(product.slug)}
                                className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 shadow-sm"
                              >
                                <FaTrash className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 border-t">
                  <PaginationControls
                    currentPage={productsPage}
                    totalPages={getTotalPages(products.length)}
                    onPageChange={setProductsPage}
                  />
                </div>
              </div>

              {/* Products Cards - Mobile */}
              <div className="lg:hidden space-y-4">
                <div className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-1">
                    Product Management
                  </h3>
                  <p className="text-white/80 text-sm">{products.length} products</p>
                </div>
                
                {getPaginatedData(products, productsPage).map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <input
                          defaultValue={product.name}
                          onBlur={(e) =>
                            updateProduct(product.slug, {
                              name: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base font-medium bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all mb-2"
                        />
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            product.stockQuantity > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                          <span className="text-sm text-gray-500">Stock: {product.stockQuantity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select
                          defaultValue={product.category}
                          onChange={(e) =>
                            updateProduct(product.slug, {
                              category: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                        >
                          <option value="cpu">CPU</option>
                          <option value="keyboard">Keyboard</option>
                          <option value="monitor">Monitor</option>
                          <option value="speaker">Speaker</option>
                          <option value="mouse">Mouse</option>
                          <option value="trending">Trending</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price (रु)</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={product.price}
                          onBlur={(e) =>
                            updateProduct(product.slug, {
                              price: Number(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={product.discountPercentage || 0}
                          onBlur={(e) =>
                            updateProduct(product.slug, {
                              discountPercentage: Number(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stockQuantity}
                          onBlur={(e) => {
                            const quantity = Number(e.target.value);
                            updateProduct(product.slug, {
                              stockQuantity: quantity,
                              inStock: quantity > 0,
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        placeholder="Product description..."
                        defaultValue={product.description}
                        rows={3}
                        onBlur={(e) =>
                          updateProduct(product.slug, {
                            description: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent resize-none transition-all"
                      />
                    </div>
                    
                    <button
                      onClick={() => deleteProduct(product.slug)}
                      className="w-full px-4 py-3 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span>Delete Product</span>
                    </button>
                  </div>
                ))}
                
                {/* Mobile Pagination */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex justify-center">
                  <PaginationControls
                    currentPage={productsPage}
                    totalPages={getTotalPages(products.length)}
                    onPageChange={setProductsPage}
                  />
                </div>
              </div>

              {/* Add Product Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-[#0D3B66]/5 to-[#1E5CAF]/5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center space-x-2">
                    <FaPlus className="text-[#0D3B66]" />
                    <span>Add New Product</span>
                  </h3>
                  <p className="text-sm text-gray-600">Create a new product for your inventory</p>
                </div>
                <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (रु) *</label>
                    <input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      placeholder="0"
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all"
                    >
                      <option value="cpu">CPU</option>
                      <option value="keyboard">Keyboard</option>
                      <option value="monitor">Monitor</option>
                      <option value="speaker">Speaker</option>
                      <option value="mouse">Mouse</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0D3B66] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#0D3B66] file:text-white hover:file:bg-[#0D3B66]/90 file:cursor-pointer cursor-pointer"
                        disabled={uploading}
                      />
                      <p className="text-sm text-gray-500 mt-2">Upload product image (JPG, PNG, GIF)</p>
                    </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
                    <textarea
                      placeholder="Enter a detailed description of the product..."
                      value={description}
                      rows={4}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent resize-none transition-all"
                    />
                  </div>

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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
