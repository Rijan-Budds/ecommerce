"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  FaShoppingCart,
  FaTrash,
  FaHistory,
  FaCheck,
  FaTruck,
  FaBoxOpen,
  FaUndo,
  FaClock,
  FaTimes,
  FaEye,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// Define order status types and transitions
const ORDER_STATUSES = {
  pending: { 
    label: "Pending", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: FaClock,
    description: "Order received and being processed"
  },
  processing: { 
    label: "Processing", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FaBoxOpen,
    description: "Order is being prepared"
  },
  shipped: { 
    label: "Shipped", 
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: FaTruck,
    description: "Order has been shipped"
  },
  "out-for-delivery": { 
    label: "Out for Delivery", 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: FaTruck,
    description: "Order is out for delivery"
  },
  delivered: { 
    label: "Delivered", 
    color: "bg-green-100 text-green-800 border-green-200",
    icon: FaCheck,
    description: "Order has been delivered"
  },
  canceled: { 
    label: "Canceled", 
    color: "bg-red-100 text-red-800 border-red-200",
    icon: FaTimes,
    description: "Order has been canceled"
  },
  returned: { 
    label: "Returned", 
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FaUndo,
    description: "Order has been returned"
  },
} as const;

// Status transition rules (frontend validation)
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "canceled"],
  processing: ["shipped", "canceled"],
  shipped: ["out-for-delivery", "delivered", "returned"],
  "out-for-delivery": ["delivered", "returned"],
  delivered: ["returned"],
  canceled: [],
  returned: [],
};

interface StatusHistory {
  status: string;
  timestamp: string;
  updatedBy: string;
}

interface Order {
  orderId: string;
  userId: string;
  username: string;
  email: string;
  status: keyof typeof ORDER_STATUSES;
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: {
    name: string;
    email: string;
    address: { street: string; city: string };
  };
  items: { productId: string; quantity: number; name?: string; image?: string; price?: number }[];
  statusHistory?: StatusHistory[];
  lastStatusUpdate?: string;
}

interface Product {
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
}

interface OrderManagementProps {
  orders: Order[];
  products: Product[];
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export default function OrderManagement({ 
  orders, 
  products, 
  onUpdateStatus, 
  onDeleteOrder
}: OrderManagementProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | keyof typeof ORDER_STATUSES>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  const getProductDetails = (productId: string) => {
    return products.find((product) => product.id === productId);
  };

  const getFilteredOrders = () => {
    if (statusFilter === "all") return orders;
    return orders.filter(order => order.status === statusFilter);
  };

  const getPaginatedOrders = () => {
    const filtered = getFilteredOrders();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredOrders().length / itemsPerPage);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      await onUpdateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${ORDER_STATUSES[newStatus as keyof typeof ORDER_STATUSES].label}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOrders.length === 0) {
      toast.error("No orders selected");
      return;
    }

    setIsLoading(true);
    const promises = selectedOrders.map(orderId => onUpdateStatus(orderId, status));
    
    try {
      await Promise.all(promises);
      toast.success(`Updated ${selectedOrders.length} orders to ${ORDER_STATUSES[status as keyof typeof ORDER_STATUSES].label}`);
      setSelectedOrders([]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update orders";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const isStatusTransitionValid = (currentStatus: string, newStatus: string) => {
    return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
  };

  const StatusProgressBar = ({ status }: { status: keyof typeof ORDER_STATUSES }) => {
    const statusOrder = ["pending", "processing", "shipped", "out-for-delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(status);
    const progressPercentage = currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;

    if (status === "canceled" || status === "returned") {
      return (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="bg-red-500 h-2 rounded-full" style={{ width: "100%" }}></div>
        </div>
      );
    }

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <FaShoppingCart className="text-white/90" />
              <span>Order Management</span>
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                <span key={status} className="bg-white/20 px-3 py-1 rounded-full">
                  {config.label}: {orders.filter(o => o.status === status).length}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setCurrentPage(1);
              }}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all" className="text-gray-900">All Orders</option>
              {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                <option key={status} value={status} className="text-gray-900">
                  {config.label}
                </option>
              ))}
            </select>
            
            {selectedOrders.length > 0 && (
              <div className="bg-white/20 rounded-lg p-2 text-sm">
                {selectedOrders.length} orders selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              Bulk Actions ({selectedOrders.length} selected):
            </span>
            {Object.entries(ORDER_STATUSES).map(([status, config]) => (
              <button
                key={status}
                onClick={() => handleBulkStatusUpdate(status)}
                disabled={isLoading}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                  config.color.replace("bg-", "bg-").replace("text-", "text-").replace("border-", "border-")
                } border hover:scale-105 disabled:opacity-50`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {getPaginatedOrders().length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {statusFilter !== "all" 
                ? `No ${ORDER_STATUSES[statusFilter].label.toLowerCase()} orders found.`
                : "No orders to display."
              }
            </p>
          </div>
        ) : (
          getPaginatedOrders().map((order) => {
            const statusConfig = ORDER_STATUSES[order.status];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrders.includes(order.orderId);
            
            return (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.orderId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(prev => [...prev, order.orderId]);
                          } else {
                            setSelectedOrders(prev => prev.filter(id => id !== order.orderId));
                          }
                        }}
                        className="mt-1 w-4 h-4 text-[#0D3B66] border-gray-300 rounded focus:ring-[#0D3B66]"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{order.username}</h4>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusConfig.label}</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{order.email}</p>
                        <StatusProgressBar status={order.status} />
                        <p className="text-xs text-gray-400">{statusConfig.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#0D3B66]">रु{order.grandTotal?.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => toggleOrderExpansion(order.orderId)}
                        className="flex items-center space-x-1 text-[#0D3B66] hover:text-[#0D3B66]/80 text-sm font-medium transition-colors"
                      >
                        <FaEye className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        {isExpanded ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50 space-y-6">
                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Customer Information</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Name:</span> {order.customer?.name}</p>
                          <p><span className="text-gray-600">Email:</span> {order.customer?.email}</p>
                          <p><span className="text-gray-600">Address:</span> {order.customer?.address?.street}, {order.customer?.address?.city}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Order Summary</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Subtotal:</span> रु{order.subtotal?.toFixed(2)}</p>
                          <p><span className="text-gray-600">Delivery Fee:</span> रु{order.deliveryFee?.toFixed(2)}</p>
                          <p className="font-semibold"><span className="text-gray-600">Grand Total:</span> रु{order.grandTotal?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Ordered Items</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.map((item, index) => {
                          const product = getProductDetails(item.productId);
                          return (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                              {product && (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.name || product?.name || "Product Not Found"}</p>
                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                <p className="text-xs text-gray-600">रु{(item.price || product?.price || 0).toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <FaHistory className="w-4 h-4" />
                          <span>Status History</span>
                        </h5>
                        <div className="space-y-2">
                          {order.statusHistory
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((history, index) => {
                              const historyStatus = ORDER_STATUSES[history.status as keyof typeof ORDER_STATUSES];
                              const HistoryIcon = historyStatus?.icon || FaClock;
                              
                              return (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border-l-4 border-[#0D3B66]">
                                  <HistoryIcon className="w-4 h-4 text-[#0D3B66]" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      Status changed to {historyStatus?.label || history.status}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {new Date(history.timestamp).toLocaleString()} by {history.updatedBy}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ORDER_STATUSES).map(([status, config]) => {
                      const isCurrentStatus = order.status === status;
                      const isValidTransition = isStatusTransitionValid(order.status, status);
                      const shouldShow = !isCurrentStatus && (isValidTransition || order.status === status);
                      
                      if (!shouldShow) return null;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.orderId, status)}
                          disabled={isLoading || isCurrentStatus}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                            isCurrentStatus 
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : `${config.color.replace("border-", "border-")} border hover:scale-105 hover:shadow-md`
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <config.icon className="w-3 h-3" />
                          <span>{config.label}</span>
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => onDeleteOrder(order.orderId)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 hover:scale-105 hover:shadow-md disabled:opacity-50"
                    >
                      <FaTrash className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                  
                  {!isStatusTransitionValid(order.status, "canceled") && order.status !== "canceled" && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>Some actions may be restricted based on current status</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {getTotalPages() > 1 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, getFilteredOrders().length)} to{' '}
              {Math.min(currentPage * itemsPerPage, getFilteredOrders().length)} of {getFilteredOrders().length} 
              {statusFilter !== "all" ? ` ${ORDER_STATUSES[statusFilter].label.toLowerCase()} ` : " "}
              orders
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-[#0D3B66] text-white shadow-lg"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                disabled={currentPage === getTotalPages()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}