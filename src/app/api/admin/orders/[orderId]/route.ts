import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

// Define valid order statuses and transitions
const VALID_STATUSES = ["pending", "processing", "shipped", "out-for-delivery", "delivered", "canceled", "returned"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

// Define which status transitions are allowed
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "pending": ["processing", "canceled"],
  "processing": ["shipped", "canceled"],
  "shipped": ["out-for-delivery", "delivered", "returned"],
  "out-for-delivery": ["delivered", "returned"],
  "delivered": ["returned"], // Delivered orders can only be returned
  "canceled": [], // Canceled orders cannot change status
  "returned": [], // Returned orders cannot change status
};

function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
}

function getStatusValidationMessage(currentStatus: OrderStatus, newStatus: OrderStatus): string {
  if (currentStatus === "delivered") {
    return "Delivered orders cannot be canceled. They can only be marked as returned.";
  }
  if (currentStatus === "canceled") {
    return "Canceled orders cannot have their status changed.";
  }
  if (currentStatus === "returned") {
    return "Returned orders cannot have their status changed.";
  }
  return `Cannot change status from ${currentStatus} to ${newStatus}. Invalid transition.`;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await params;
  const { status } = await req.json();
  
  // Validate status
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ 
      message: "Invalid status", 
      validStatuses: VALID_STATUSES 
    }, { status: 400 });
  }

  const users = await User.find({});
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      const oldStatus = order.status as OrderStatus;
      const newStatus = status as OrderStatus;
      
      // Check if status transition is valid
      if (oldStatus !== newStatus && !isValidStatusTransition(oldStatus, newStatus)) {
        return NextResponse.json({ 
          message: getStatusValidationMessage(oldStatus, newStatus),
          currentStatus: oldStatus,
          attemptedStatus: newStatus,
          validTransitions: VALID_TRANSITIONS[oldStatus]
        }, { status: 400 });
      }
      
      // Update order with timestamp tracking
      const now = new Date();
      order.status = newStatus;
      
      // Add status history tracking
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      
      if (oldStatus !== newStatus) {
        order.statusHistory.push({
          status: newStatus,
          timestamp: now,
          updatedBy: auth.sub || 'admin'
        });
        order.lastStatusUpdate = now;
      }
      
      await u.save();
      
      // Send status update email if status actually changed
      if (oldStatus !== newStatus) {
        const emailResult = await sendOrderStatusUpdateEmail(order, orderId, status);
        if (!emailResult.success) {
          console.error('Failed to send status update email:', emailResult.error);
          // Don't fail the status update if email fails, but log it
        }
      }
      
      return NextResponse.json({ 
        message: "Order updated successfully", 
        emailSent: oldStatus !== newStatus,
        previousStatus: oldStatus,
        newStatus: newStatus,
        validNextStatuses: VALID_TRANSITIONS[newStatus]
      });
    }
  }
  return NextResponse.json({ message: "Order not found" }, { status: 404 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await params;
  const users = await User.find({});
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      order.deleteOne();
      await u.save();
      return NextResponse.json({ message: "Order deleted" });
    }
  }
  return NextResponse.json({ message: "Order not found" }, { status: 404 });
}
