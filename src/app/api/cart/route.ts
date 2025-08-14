import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User, Product, ICartItem } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const auth = await getAuth();
    console.log("GET /api/cart - Auth result:", auth);
    
    if (!auth || auth.role === 'admin') {
      console.log("User not authenticated or is admin, returning empty cart");
      return NextResponse.json({ items: [] });
    }
    
    const user = await User.findById(auth.sub);
    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    console.log("User found:", { id: user._id, cartLength: user.cart.length });
    
    const ids = user.cart.map((ci: ICartItem) => ci.productId);
    console.log("Cart product IDs:", ids);
    
    const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
    console.log("Found products:", docs.map(d => ({ 
      id: String(d._id), 
      name: d.name, 
      price: d.price, 
      priceType: typeof d.price,
      isNaN: isNaN(d.price)
    })));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new Map(docs.map((d: any) => [String(d._id), { 
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
    
    console.log("Detailed cart items:", detailed.map((item: { productId: string; product: { id: string; name: string; price: number } | null }) => ({ 
      productId: item.productId, 
      product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        priceType: typeof item.product.price
      } : null 
    })));
    
    console.log("Final response:", { items: detailed });
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
    console.log("POST /api/cart - Auth result:", auth);
    
    if (!auth || auth.role === 'admin') {
      console.log("User not authenticated, returning 401");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { action } = body || {};
    
    const user = await User.findById(auth.sub);
    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    if (action === 'add') {
      const { productId, quantity = 1 } = body;
      if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
      const existing = user.cart.find((ci: ICartItem) => ci.productId === productId);
      if (existing) existing.quantity += Number(quantity);
      else user.cart.push({ productId, quantity: Number(quantity) });
      await user.save();
      return NextResponse.json({ message: 'Added to cart' });
    }
    
    if (action === 'update') {
      const { productId, quantity } = body;
      if (!productId || typeof quantity !== 'number') return NextResponse.json({ message: 'productId and quantity required' }, { status: 400 });
      const existing = user.cart.find((ci: ICartItem) => ci.productId === productId);
      if (!existing) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
      if (quantity <= 0) user.cart = user.cart.filter((ci: ICartItem) => ci.productId !== productId);
      else existing.quantity = quantity;
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


