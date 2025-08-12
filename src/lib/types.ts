export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  orders?: Order[];
  wishlist?: string[];
  cart?: CartItem[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderId?: string; // For admin display
  userId: string;
  username?: string; // For admin display
  email?: string; // For admin display
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'canceled';
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}
