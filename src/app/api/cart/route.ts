import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User, Product, ICartItem } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const auth = await getAuth();
    
    if (!auth || auth.role === 'admin') {
      return NextResponse.json({ items: [] });
    }
    
    const user = await User.findById(auth.sub);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const ids = user.cart.map((ci: ICartItem) => ci.productId);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let docs: any[] = [];
    if (ids.length > 0) {
      docs = await Product.find({ _id: { $in: ids } }).lean();
    }
    
    const map = new Map(docs.map((d: any) => [String(d._id), { // eslint-disable-line @typescript-eslint/no-explicit-any 
      id: String(d._id), 
      slug: d.slug, 
      name: d.name, 
      price: Number(d.price) || 0, 
      category: d.category, 
      image: d.image 
    }]));
    
    const detailed = user.cart.map((ci: ICartItem) => {
      const product = map.get(ci.productId);
      return {
        productId: ci.productId,
        quantity: ci.quantity,
        product: product || null
      };
    });
    
    return NextResponse.json({ items: detailed });
    
  } catch (error) {
    console.error("GET /api/cart - Error:", error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const auth = await getAuth();
    
    if (!auth || auth.role === 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { action } = body || {};
    
    const user = await User.findById(auth.sub);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    if (action === 'add') {
      const { productId, quantity = 1 } = body;
      if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
      
      // Check product stock availability
      const product = await Product.findById(productId);
      if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      if (!product.inStock || product.stockQuantity <= 0) {
        return NextResponse.json({ message: 'Product is out of stock' }, { status: 400 });
      }
      
      const existing = user.cart.find((ci: ICartItem) => ci.productId === productId);
      const newQuantity = existing ? existing.quantity + Number(quantity) : Number(quantity);
      
      if (newQuantity > product.stockQuantity) {
        return NextResponse.json({ 
          message: `Only ${product.stockQuantity} items available in stock` 
        }, { status: 400 });
      }
      
      if (existing) existing.quantity = newQuantity;
      else user.cart.push({ productId, quantity: Number(quantity) });
      await user.save();
      return NextResponse.json({ message: 'Added to cart' });
    }
    
    if (action === 'update') {
      const { productId, quantity } = body;
      if (!productId || typeof quantity !== 'number') return NextResponse.json({ message: 'productId and quantity required' }, { status: 400 });
      const existing = user.cart.find((ci: ICartItem) => ci.productId === productId);
      if (!existing) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
      
      if (quantity <= 0) {
        user.cart = user.cart.filter((ci: ICartItem) => ci.productId !== productId);
      } else {
        // Check stock availability for quantity update
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        if (quantity > product.stockQuantity) {
          return NextResponse.json({ 
            message: `Only ${product.stockQuantity} items available in stock` 
          }, { status: 400 });
        }
        existing.quantity = quantity;
      }
      await user.save();
      return NextResponse.json({ message: 'Cart updated' });
    }
    
    if (action === 'remove') {
      const { productId } = body;
      if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
      user.cart = user.cart.filter((ci: ICartItem) => ci.productId !== productId);
      await user.save();
      return NextResponse.json({ message: 'Item removed' });
    }
    
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error("POST /api/cart - Error:", error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


