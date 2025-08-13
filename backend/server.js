import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();

const app = express();
const port = 5000;

// In production, move this to process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "Admin/1234";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists and is served statically
const uploadDir = path.join(__dirname, "uploads");
console.log("Upload directory path:", uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory");
} else {
  console.log("Uploads directory already exists");
}

app.use("/uploads", express.static(uploadDir));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    console.log("Multer destination called, uploadDir:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "");
    const filename = `${uniqueSuffix}${ext}`;
    console.log("Multer filename generated:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    console.log("File filter check:", file.mimetype);
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rijanbuddhacharya:Rijan1234@rijan.cmzjbaa.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Rijan';

console.log("Attempting to connect to MongoDB...");
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Database name:', mongoose.connection.db.databaseName);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Monitor MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  name: { type: String },
  image: { type: String },
  price: { type: Number },
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'canceled', 'delivered'], default: 'pending' },
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  customer: {
    name: String,
    email: String,
    address: {
      street: String,
      city: String,
    },
  },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: { type: [String], default: [] },
  cart: { type: [cartItemSchema], default: [] },
  orders: { type: [orderSchema], default: [] },
}, { timestamps: true }); // Add timestamps

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

// Shipping cities and fees
const cityFees = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

// Helper: sign JWT
function signUserToken(user, role = 'user') {
  return jwt.sign(
    { sub: user._id ? user._id.toString() : 'admin', email: user.email, username: user.username || 'admin', role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper: auth middleware
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// Helper: slugify string and ensure uniqueness
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlugFromName(name) {
  const base = slugify(name || 'item');
  let candidate = base || 'item';
  let counter = 2;
  
  while (true) {
    const exists = await Product.exists({ slug: candidate });
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

function escapeRegex(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mapProduct(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    price: doc.price,
    category: doc.category,
    image: doc.image,
  };
}

// Products endpoints
app.get('/products', async (req, res) => {
  try {
    console.log("GET /products called");
    const { category } = req.query;
    let query = {};
    if (category) {
      query = { category: { $regex: `^${escapeRegex(String(category))}$`, $options: 'i' } };
    }
    const docs = await Product.find(query).lean();
    console.log(`Found ${docs.length} products`);
    res.json({ products: docs.map((d) => mapProduct(d)) });
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.json({ products: [] });
  try {
    const regex = new RegExp(escapeRegex(q), 'i');
    const docs = await Product.find({
      $or: [{ name: regex }, { slug: regex }, { category: regex }],
    }).lean();
    res.json({ products: docs.map((d) => mapProduct(d)) });
  } catch (err) {
    console.error('GET /search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/products/:slug', async (req, res) => {
  try {
    const doc = await Product.findOne({ slug: req.params.slug }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ product: mapProduct(doc) });
  } catch (err) {
    console.error('GET /products/:slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Shipping cities endpoint
app.get('/shipping/cities', (_req, res) => {
  res.json({ cities: Object.keys(cityFees).map((name) => ({ name, fee: cityFees[name] })) })
});

// Image upload endpoint with enhanced logging
app.post('/upload', requireAuth, requireAdmin, (req, res) => {
  console.log("Upload endpoint called");
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err.message || 'Upload error' });
    }
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log("File uploaded successfully:", req.file);
    const publicUrl = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${publicUrl}`;
    
    // Verify file exists on disk
    const filePath = path.join(uploadDir, req.file.filename);
    if (fs.existsSync(filePath)) {
      console.log("File verified on disk:", filePath);
    } else {
      console.error("File NOT found on disk:", filePath);
    }
    
    return res.status(201).json({ url: absoluteUrl, path: publicUrl });
  });
});

// Registration with enhanced logging
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Registration attempt for:", { username, email });

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log("User already exists:", existingUser.username, existingUser.email);
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    console.log("✅ User registered successfully:", savedUser._id, savedUser.username);

    // Verify user was saved by querying
    const verifyUser = await User.findById(savedUser._id);
    console.log("✅ User verification:", verifyUser ? "Found" : "Not found");

    const token = signUserToken(savedUser, 'user');
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { 
        id: savedUser._id, 
        email: savedUser.email, 
        username: savedUser.username, 
        role: 'user' 
      } 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    // Admin hard-coded login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ sub: 'admin', email: ADMIN_EMAIL, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({ message: 'Admin login successful', user: { id: 'admin', email: ADMIN_EMAIL, username: 'admin', role: 'admin' } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signUserToken(user, 'user');
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful', user: { id: user._id, email: user.email, username: user.username, role: 'user' } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Current user
app.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(200).json({ user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { id: payload.sub, email: payload.email, username: payload.username, role: payload.role || 'user' } });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

// Admin endpoints
app.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({}, { username: 1, email: 1, createdAt: 1 }).lean();
    console.log(`Found ${users.length} users in database`);
    res.json({ users });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/admin/users/:userId', requireAuth, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId === 'admin') {
    return res.status(400).json({ message: 'Invalid userId' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.deleteOne({ _id: userId });
    console.log("User deleted:", userId);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('DELETE /admin/users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin products with enhanced logging
app.post('/admin/products', requireAuth, requireAdmin, async (req, res) => {
  const { name, slug: incomingSlug, price, category, image } = req.body || {};
  console.log("Creating product with data:", { name, price, category, image });
  
  if (!name || price == null || !category || !image) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  
  try {
    const existingByName = await Product.findOne({ 
      name: { $regex: `^${escapeRegex(String(name).trim())}$`, $options: 'i' } 
    });
    if (existingByName) {
      console.log("Product name already exists:", name);
      return res.status(400).json({ message: 'Product name already exists' });
    }

    let slug = (incomingSlug || '').toString().trim();
    if (!slug) {
      slug = await generateUniqueSlugFromName(name);
    } else {
      slug = slugify(slug);
      const conflict = await Product.exists({ slug });
      if (conflict) slug = await generateUniqueSlugFromName(name);
    }

    const productData = {
      name: String(name).trim(),
      slug,
      price: Number(price),
      category: String(category).toLowerCase().trim(),
      image: String(image).trim(),
    };

    console.log("Creating product with final data:", productData);
    const created = await Product.create(productData);
    console.log("✅ Product created successfully:", created._id, created.name);
    
    // Verify product was saved
    const verifyProduct = await Product.findById(created._id);
    console.log("✅ Product verification:", verifyProduct ? "Found" : "Not found");
    
    res.status(201).json({ message: 'Product added', product: mapProduct(created) });
  } catch (err) {
    console.error('❌ POST /admin/products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/admin/orders', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({}).lean();
    const allOrders = [];
    for (const u of users) {
      (u.orders || []).forEach((o) => {
        allOrders.push({
          orderId: o._id?.toString(),
          userId: u._id.toString(),
          username: u.username,
          email: u.email,
          status: o.status,
          createdAt: o.createdAt,
          subtotal: o.subtotal,
          deliveryFee: o.deliveryFee,
          grandTotal: o.grandTotal,
          customer: o.customer,
          items: o.items,
        });
      });
    }
    console.log(`Found ${allOrders.length} total orders`);
    res.json({ orders: allOrders });
  } catch (err) {
    console.error('GET /admin/orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/admin/orders/:orderId', requireAuth, requireAdmin, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body || {};
  if (!['pending', 'canceled', 'delivered'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  try {
    const users = await User.find({});
    let updated = false;
    for (const u of users) {
      const order = u.orders.id(orderId);
      if (order) {
        order.status = status;
        await u.save();
        updated = true;
        break;
      }
    }
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error('PATCH /admin/orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/admin/orders/:orderId', requireAuth, requireAdmin, async (req, res) => {
  const { orderId } = req.params;
  try {
    const users = await User.find({});
    let removed = false;
    for (const u of users) {
      const order = u.orders.id(orderId);
      if (order) {
        order.deleteOne();
        await u.save();
        removed = true;
        break;
      }
    }
    if (!removed) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('DELETE /admin/orders/:orderId error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/admin/products/:slug', requireAuth, requireAdmin, async (req, res) => {
  const { slug } = req.params;
  const { name, price, category, image } = req.body || {};
  try {
    const doc = await Product.findOne({ slug });
    if (!doc) return res.status(404).json({ message: 'Product not found' });

    if (name != null && String(name).trim().toLowerCase() !== doc.name.trim().toLowerCase()) {
      const existingByName = await Product.findOne({ name: { $regex: `^${escapeRegex(String(name).trim())}$`, $options: 'i' } });
      if (existingByName && existingByName._id.toString() !== doc._id.toString()) {
        return res.status(400).json({ message: 'Product name already exists' });
      }
    }

    if (name != null) doc.name = String(name).trim();
    if (price != null) doc.price = Number(price);
    if (category != null) doc.category = String(category).toLowerCase().trim();
    if (image != null) doc.image = String(image).trim();

    await doc.save();
    console.log("Product updated:", doc._id, doc.name);
    res.json({ message: 'Product updated', product: mapProduct(doc) });
  } catch (err) {
    console.error('PATCH /admin/products/:slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/admin/products/:slug', requireAuth, requireAdmin, async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const productIdStr = product._id.toString();
    await Product.deleteOne({ _id: product._id });

    try {
      const users = await User.find({});
      for (const u of users) {
        u.cart = u.cart.filter((ci) => ci.productId !== productIdStr);
        u.wishlist = u.wishlist.filter((pid) => pid !== productIdStr);
        await u.save();
      }
    } catch (e) {
      console.error('Failed to cascade delete from users:', e);
    }
    console.log("Product deleted:", productIdStr);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /admin/products/:slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wishlist endpoints
app.get('/wishlist', requireAuth, async (req, res) => {
  try {
    if (req.user?.role === 'admin') {
      return res.json({ items: [] });
    }
    const user = await User.findById(req.user.sub);
    if (!user) return res.json({ items: [] });
    const ids = (user.wishlist || []).filter(Boolean).filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
    if (ids.length === 0) return res.json({ items: [] });
    const docs = await Product.find({ _id: { $in: ids } }).lean();
    res.json({ items: docs.map((d) => mapProduct(d)) });
  } catch (err) {
    console.error('GET /wishlist error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/wishlist/toggle', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  try {
    const user = await User.findById(req.user.sub);
    const index = user.wishlist.indexOf(productId);
    if (index >= 0) user.wishlist.splice(index, 1); else user.wishlist.push(productId);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error('POST /wishlist/toggle error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cart endpoints
app.get('/cart', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    const ids = (user.cart || [])
      .map((ci) => ci.productId)
      .filter(Boolean)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
    const map = new Map(docs.map((d) => [d._id.toString(), mapProduct(d)]));
    const detailed = user.cart.map((ci) => ({
      ...ci.toObject(),
      product: map.get(ci.productId) || null,
    }));
    res.json({ items: detailed });
  } catch (err) {
    console.error('GET /cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/cart/add', requireAuth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  try {
    const user = await User.findById(req.user.sub);
    const existing = user.cart.find(ci => ci.productId === productId);
    if (existing) existing.quantity += Number(quantity);
    else user.cart.push({ productId, quantity: Number(quantity) });
    await user.save();
    res.json({ message: 'Added to cart', cart: user.cart });
  } catch (err) {
    console.error('POST /cart/add error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/cart/update', requireAuth, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || typeof quantity !== 'number') return res.status(400).json({ message: 'productId and quantity required' });
  try {
    const user = await User.findById(req.user.sub);
    const existing = user.cart.find(ci => ci.productId === productId);
    if (!existing) return res.status(404).json({ message: 'Item not found' });
    if (quantity <= 0) {
      user.cart = user.cart.filter(ci => ci.productId !== productId);
    } else {
      existing.quantity = quantity;
    }
    await user.save();
    res.json({ message: 'Cart updated', cart: user.cart });
  } catch (err) {
    console.error('POST /cart/update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/cart/remove', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  try {
    const user = await User.findById(req.user.sub);
    user.cart = user.cart.filter(ci => ci.productId !== productId);
    await user.save();
    res.json({ message: 'Item removed', cart: user.cart });
  } catch (err) {
    console.error('POST /cart/remove error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders endpoints
app.get('/orders', requireAuth, async (req, res) => {
  try {
    if (req.user?.role === 'admin') {
      return res.json({ orders: [] });
    }
    const user = await User.findById(req.user.sub);
    if (!user) return res.json({ orders: [] });
    res.json({ orders: user.orders });
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/orders/checkout', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    const { name, email, address } = req.body || {};
    if (!name || !email || !address?.city) {
      return res.status(400).json({ message: 'name, email, city are required' });
    }
    if (user.cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const ids = (user.cart || [])
      .map((ci) => ci.productId)
      .filter(Boolean)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
    const productMap = new Map(docs.map((d) => [d._id.toString(), { price: d.price, name: d.name, image: d.image }]));
    
    const subtotal = user.cart.reduce((sum, ci) => {
      const price = productMap.get(ci.productId)?.price || 0;
      return sum + price * ci.quantity;
    }, 0);

    const deliveryFee = cityFees[address.city] ?? 5.0;
    const grandTotal = subtotal + deliveryFee;

    user.orders.push({
      items: user.cart.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        name: productMap.get(ci.productId)?.name,
        image: productMap.get(ci.productId)?.image,
        price: productMap.get(ci.productId)?.price,
      })),
      status: 'pending',
      subtotal,
      deliveryFee,
      grandTotal,
      customer: {
        name,
        email,
        address: {
          street: address?.street || '',
          city: address.city,
        },
      },
    });
    user.cart = [];
    await user.save();
    console.log("Order created for user:", user.username);
    res.json({ message: 'Order placed', orders: user.orders });
  } catch (err) {
    console.error('POST /orders/checkout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
  res.json({ message: 'Logged out' });
});

// Add a test endpoint to verify database connectivity
app.get('/test/db', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("Testing database connectivity...");
    
    // Test basic connection
    const connectionStatus = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Count documents
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    
    // Try to create and delete a test document
    const testProduct = new Product({
      name: `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      price: 99.99,
      category: 'test',
      image: '/test.jpg'
    });
    
    const savedTest = await testProduct.save();
    await Product.deleteOne({ _id: savedTest._id });
    
    res.json({
      message: 'Database test successful',
      connection: connectionStates[connectionStatus],
      database: mongoose.connection.db.databaseName,
      userCount,
      productCount,
      testCreateDelete: 'success'
    });
  } catch (err) {
    console.error('Database test failed:', err);
    res.status(500).json({ 
      message: 'Database test failed', 
      error: err.message,
      connection: mongoose.connection.readyState
    });
  }
});

// Add an endpoint to list files in uploads directory
app.get('/test/uploads', requireAuth, requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.json({
      uploadDir,
      files,
      count: files.length
    });
  } catch (err) {
    console.error('Error reading uploads directory:', err);
    res.status(500).json({ 
      message: 'Error reading uploads directory', 
      error: err.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🗄️  Database: ${mongoose.connection.db?.databaseName || 'Not connected'}`);
});