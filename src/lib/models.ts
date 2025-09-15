import mongoose, { Schema, Document } from "mongoose";

// TypeScript interfaces
export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
}

export interface IOrder {
  items: IOrderItem[];
  createdAt: Date;
  status: "pending" | "canceled" | "delivered";
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: {
    name: string;
    email: string;
    address: { street: string; city: string };
  };
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  wishlist: string[];
  cart: ICartItem[];
  orders: IOrder[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  discountPercentage?: number;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

// User + embedded orders/cart
const CartItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  name: String,
  image: String,
  price: Number,
});

const OrderSchema = new Schema({
  items: [OrderItemSchema],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "canceled", "delivered"], default: "pending" },
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  customer: {
    name: String,
    email: String,
    address: { street: String, city: String },
  },
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: { type: [String], default: [] },
  cart: { type: [CartItemSchema], default: [] },
  orders: { type: [OrderSchema], default: [] },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


