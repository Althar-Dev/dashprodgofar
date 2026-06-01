import { NextResponse } from "next/server";
import * as db from "@/lib/database";

const DEFAULT_API_KEY = process.env.API_KEY || "gofarbotapi";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const apiKey = request.headers.get("x-api-key") || "";
  if (apiKey !== DEFAULT_API_KEY) return unauthorized();

  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  const path = slug.join("/");
  const body = await request.json().catch(() => ({}));

  try {
    // bot
    if (path === "bot/init") return NextResponse.json(await db.createDbBot(body.id, body.name));
    if (path === "bot/check") return NextResponse.json(await db.checkDbBot(body.id));

    // user
    if (path === "user/check") {
      console.log("[API] user/check body=", body);
      const result = await db.checkUser(body.id, body.name);
      console.log("[API] user/check result=", result);
      return NextResponse.json(result);
    }
    if (path === "user/balance") return NextResponse.json(await db.editUser(body.id, { balance: body.amount }));

    // sewa
    if (path === "sewa/register") return NextResponse.json({ success: false, error: "Sewa belum didukung di dashboard ini." });
    if (path === "sewa/stats") return NextResponse.json({ success: false, error: "Sewa stats belum didukung di dashboard ini." });

    // product list by bot: product/list/:botId
    if (slug[0] === "product" && slug[1] === "list" && slug[2]) {
      const botId = isNaN(Number(slug[2])) ? slug[2] : Number(slug[2]);
      const productsRes = await db.getProductList(botId);
      if (!productsRes.success) return NextResponse.json(productsRes);
      return NextResponse.json({
        success: true,
        data: productsRes.data,
      });
    }

    if (path === "product/add") return NextResponse.json(await db.addProduct(body.botId, body));
    if (path === "product/stock") {
      const accounts = Array.isArray(body.accounts) ? body.accounts : [];
      return NextResponse.json(await db.addProductStock(body.botId, body.id, accounts));
    }
    if (path === "product/delete") return NextResponse.json(await db.deleteProduct(body.botId, body.id));
    if (path === "product/edit") {
      if (body.newId) return NextResponse.json(await db.editProductID(body.botId, body.id, body.newId));
      if (body.name) return NextResponse.json(await db.editProductName(body.botId, body.id, body.name));
      if (body.price !== undefined) return NextResponse.json(await db.editProductPrice(body.botId, body.id, body.price));
      if (body.desc) return NextResponse.json(await db.editProductDesk(body.botId, body.id, body.desc));
      if (body.snk) return NextResponse.json(await db.editProductSnk(body.botId, body.id, body.snk));
      return NextResponse.json({ success: false, error: "No valid edit fields provided." });
    }
    if (path === "product/sold") return NextResponse.json(await db.addProductSold(body.botId, body.id, body.sold || 0));

    // product account
    if (path === "product/account/take") return NextResponse.json(await db.takeProductAccount(body.botId, body.id, body.total || 1));
    if (path === "product/account/get") return NextResponse.json(await db.getProductAccount(body.botId, body.id, body.total || 1));

    // transactions
    if (path === "transaction/process") {
      const payload = body;
      const takeRes = await db.takeProductAccount(payload.botId, payload.productId, payload.quantity || 1);
      if (!takeRes.success) return NextResponse.json(takeRes);
      const accounts = takeRes.data || [];
      const history = await db.addTransactionHistory(payload.userId, payload.botId, payload.productId, payload.productName || "", payload.quantity || 1, payload.price || 0, accounts, payload.status || "completed", payload.paymentMethod || "balance", payload.snk || "", payload.reffId || "");
      await db.recordSale(payload.botId, payload.productId, payload.quantity || 1, (payload.price || 0) * (payload.quantity || 1));
      return NextResponse.json(history);
    }

    if (path === "transaction/add") return NextResponse.json(await db.addTransactionHistory(body.userId, body.botId, body.productId, body.productName, body.quantity, body.price, body.accounts || [], body.status || "completed", body.paymentMethod || "balance"));

    if (path === "transaction/history") return NextResponse.json(await db.getAllTransactions(body.botId || body.botId));

    return NextResponse.json({ success: false, error: "Endpoint tidak ditemukan." }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const apiKey = request.headers.get("x-api-key") || "";
  if (apiKey !== DEFAULT_API_KEY) return unauthorized();
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  // handle GET product list: /product/list/:botId
  if (slug[0] === "product" && slug[1] === "list" && slug[2]) {
    const botId = isNaN(Number(slug[2])) ? slug[2] : Number(slug[2]);
    const productsRes = await db.getProductList(botId);
    if (!productsRes.success) return NextResponse.json(productsRes);
    return NextResponse.json({
      success: true,
      data: productsRes.data,
    });
  }
  return NextResponse.json({ success: false, error: "Endpoint tidak ditemukan." }, { status: 404 });
}
