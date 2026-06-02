import { NextResponse } from "next/server";
import { connectDB, Product, Category } from "@/lib/mongo";
import {
  placeholderMode,
  getProductList,
  getCategory,
  addCategory,
  addProduct,
  deleteProduct as deletePlaceholderProduct,
  addProductStock as addPlaceholderStock,
  addProductToCategory,
  updateProduct,
} from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const botIdParam = url.searchParams.get("botId");
  const view = url.searchParams.get("view");
  const botId = botIdParam ? Number(botIdParam) : undefined;
  if (!botId) return NextResponse.json({ success: false, error: "botId query param required" }, { status: 400 });
  try {
    if (placeholderMode) {
      if (view === 'categories') {
        const categories = await getCategory(botId);
        return NextResponse.json(categories);
      }
      return NextResponse.json(await getProductList(botId));
    }

    await connectDB();
    if (view === 'categories') {
      const categories = await Category.find({ botId }).lean();
      // return name and product count
      const data = categories.map(c => ({ name: c.name, products: c.products || [], count: (c.products || []).length }));
      return NextResponse.json({ success: true, data });
    }
    const products = await Product.aggregate([
      { $match: { botId } },
      {
        $project: {
          id: 1,
          name: 1,
          price: 1,
          desc: 1,
          snk: 1,
          terjual: 1,
          account: 1,
          createdAt: 1,
          stock: { $size: { $ifNull: ["$account", []] } }
        }
      }
    ]);
    return NextResponse.json({ success: true, data: products });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { botId, product, category } = body;
    if (!botId) return NextResponse.json({ success: false, error: "botId required" }, { status: 400 });

    if (placeholderMode) {
      if (category && category.name) {
        return NextResponse.json(await addCategory(botId, category.name, category.products || []));
      }
      if (!product || !product.id) {
        return NextResponse.json({ success: false, error: "product with id required" }, { status: 400 });
      }
      return NextResponse.json(await addProduct(botId, product));
    }

    await connectDB();

    // Create Category if payload contains `category`
    if (category && category.name) {
      const existsCat = await Category.exists({ botId, name: category.name });
      if (existsCat) return NextResponse.json({ success: false, error: "Category already exists." }, { status: 409 });
      const createdCat = await Category.create({ botId, name: category.name, products: category.products || [] });
      return NextResponse.json({ success: true, data: createdCat });
    }

    // Otherwise expect product payload
    if (!product || !product.id) {
      return NextResponse.json({ success: false, error: "product with id required" }, { status: 400 });
    }
    const exists = await Product.exists({ botId, id: product.id });
    if (exists) return NextResponse.json({ success: false, error: "ID produk sudah ada." }, { status: 409 });
    const created = await Product.create({ botId, id: product.id, name: product.name, price: Number(product.price), desc: product.desc || "", snk: product.snk || "", terjual: 0, account: [] });
    return NextResponse.json({ success: true, data: created });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const botId = Number(url.searchParams.get("botId"));
    const productId = url.searchParams.get("id");
    if (!botId || !productId) return NextResponse.json({ success: false, error: "botId and id required" }, { status: 400 });
    if (placeholderMode) {
      return NextResponse.json(await deletePlaceholderProduct(botId, productId));
    }
    await connectDB();
    const res = await Product.deleteOne({ botId, id: productId });
    if (res.deletedCount === 0) return NextResponse.json({ success: false, error: "Produk tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { botId, id, updates, categoryUpdate } = body;
    if (!botId) return NextResponse.json({ success: false, error: "botId required" }, { status: 400 });

    if (placeholderMode) {
      if (categoryUpdate && categoryUpdate.name && categoryUpdate.addProductId) {
        const res = await addProductToCategory(botId, categoryUpdate.name, categoryUpdate.addProductId);
        return NextResponse.json(res);
      }

      if (body.stockUpdate && body.stockUpdate.accounts) {
        const accounts = Array.isArray(body.stockUpdate.accounts)
          ? body.stockUpdate.accounts.filter(Boolean)
          : [];
        if (accounts.length === 0) {
          return NextResponse.json({ success: false, error: "accounts array required" }, { status: 400 });
        }
        return NextResponse.json(await addPlaceholderStock(botId, id, accounts));
      }

      if (!id || !updates) return NextResponse.json({ success: false, error: "id and updates required" }, { status: 400 });
      return NextResponse.json(await updateProduct(botId, id, updates));
    }

    await connectDB();

    // Handle adding product id to a category
    if (categoryUpdate && categoryUpdate.name && categoryUpdate.addProductId) {
      const res = await Category.findOneAndUpdate(
        { botId, name: categoryUpdate.name },
        { $addToSet: { products: categoryUpdate.addProductId } },
        { new: true }
      );
      if (!res) return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
      return NextResponse.json({ success: true, data: res });
    }

    if (body.stockUpdate && body.stockUpdate.accounts) {
      const accounts = Array.isArray(body.stockUpdate.accounts)
        ? body.stockUpdate.accounts.filter(Boolean)
        : [];
      if (accounts.length === 0) {
        return NextResponse.json({ success: false, error: "accounts array required" }, { status: 400 });
      }
      const updatedStock = await Product.findOneAndUpdate(
        { botId, id },
        { $push: { account: { $each: accounts } } },
        { new: true }
      );
      if (!updatedStock) return NextResponse.json({ success: false, error: "Produk tidak ditemukan." }, { status: 404 });
      return NextResponse.json({ success: true, data: { id: updatedStock.id, stock: (updatedStock.account || []).length, account: updatedStock.account } });
    }

    if (!id || !updates) return NextResponse.json({ success: false, error: "id and updates required" }, { status: 400 });
    const updated = await Product.findOneAndUpdate({ botId, id }, updates, { new: true });
    if (!updated) return NextResponse.json({ success: false, error: "Produk tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
