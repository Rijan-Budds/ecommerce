import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Product } from "@/lib/models";
import { getAuth } from "@/lib/auth";

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlugFromName(name: string) {
  const base = slugify(name || "item");
  let candidate = base || "item";
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await Product.exists({ slug: candidate });
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export async function POST(req: Request) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { name, slug: incomingSlug, price, category, image, description, stockQuantity, inStock } = await req.json();
  if (!name || price == null || !category || !image || stockQuantity == null)
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  const existingByName = await Product.findOne({
    name: { $regex: `^${name.trim()}$`, $options: "i" },
  });
  if (existingByName)
    return NextResponse.json(
      { message: "Product name already exists" },
      { status: 400 }
    );
  let slug = (incomingSlug || "").toString().trim();
  if (!slug) slug = await generateUniqueSlugFromName(name);
  else if (await Product.exists({ slug }))
    slug = await generateUniqueSlugFromName(name);
  const created = await Product.create({
    name: name.trim(),
    slug,
    price: Number(price),
    category: String(category).toLowerCase().trim(),
    image: String(image).trim(),
    description: description || "",
    stockQuantity: Number(stockQuantity),
    inStock: inStock !== undefined ? inStock : Number(stockQuantity) > 0,
  });
  return NextResponse.json(
    {
      message: "Product added",
      product: {
        id: created._id.toString(),
        slug: created.slug,
        name: created.name,
        price: created.price,
        category: created.category,
        image: created.image,
        description: created.description,
        stockQuantity: created.stockQuantity,
        inStock: created.inStock,
      },
    },
    { status: 201 }
  );
}
