// @ts-nocheck
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_URI || process.env.DST_MONGO_URI || process.env.NEXT_PUBLIC_MONGO_URI || "";
const dbName = process.env.DB_NAME || process.env.DST_DB_NAME || process.env.NEXT_PUBLIC_DB_NAME || undefined;
let isConnected = false;
const cache = new Map();

setInterval(() => {
  cache.clear();
}, 10000);

const connect = async () => {
  const initialConnect = !isConnected;
  try {
    await mongoose.connect(url, {
      dbName,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    if (!isConnected) {
      isConnected = true;
      console.log(chalk.green("✓ Berhasil connect ke MongoDB (dashboard)"));
    }

    await startInit();
  } catch (err) {
    console.log(chalk.red("x Gagal connect ke MongoDB:"), err);
    if (initialConnect) {
      throw err;
    }
    console.log(chalk.yellow("! Mencoba reconnect dalam 5 detik..."));
    setTimeout(connect, 5000);
  }
};

if (mongoose.connection.listeners("disconnected").length === 0) {
  mongoose.connection.on("disconnected", () => {
    console.log(chalk.red("x MongoDB terputus. Reconnecting..."));
    isConnected = false;
    connect();
  });
}

export async function connectDB() {
  if (!url) throw new Error("MONGO URI not set for dashboard. Set NEXT_PUBLIC_MONGO_URI in dashboard/.env.local");
  if (mongoose.connection.readyState === 1) return;
  await connect();
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB connection failed");
  }
}

export function getNativeDb() {
  return mongoose.connection.db;
}

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, default: "No Name" },
    role: { type: String, default: "member" },
    balance: { type: Number, default: 0 },
    transaksi: { type: Number, default: 0 },
    membeli: { type: Number, default: 0 },
    isTelegram: { type: Boolean, default: true },
    total_nominal_transaksi: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const botSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    terjual: { type: Number, default: 0 },
    transaksi: { type: Number, default: 0 },
    soldtoday: { type: Number, default: 0 },
    trxtoday: { type: Number, default: 0 },
    total_nominal_transaksi: { type: Number, default: 0 },
    nominaltoday: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    botId: { type: Number, required: true, index: true },
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    desc: { type: String, default: "" },
    snk: { type: String, default: "" },
    terjual: { type: Number, default: 0 },
    account: [String], 
  },
  { timestamps: true }
);
productSchema.index({ botId: 1, id: 1 }, { unique: true });

const categorySchema = new mongoose.Schema(
  {
    botId: { type: Number, required: true, index: true },
    name: { type: String, required: true },
    products: [String], 
  },
  { timestamps: true }
);
categorySchema.index({ botId: 1, name: 1 }, { unique: true });

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, index: true },
    botId: { type: Number, required: true, index: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    status: { type: String, default: "completed" },
    accounts: [String], 
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "balance" },
    snk: { type: String, default: "" },
    reffId: { type: String, default: "" },
  },
  { timestamps: true }
);

const authUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, sparse: true },
    password: { type: String, required: true },
    telegramId: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

authUserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

authUserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Bot = mongoose.models.Bot || mongoose.model("Bot", botSchema);
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", authUserSchema);

export async function startInit() {
  await User.init();
  await Bot.init();
  await Product.init();
  await Category.init();
  await Transaction.init();
}

export async function userRegister(id, name) {
  cache.clear();
  await connectDB();
  try {
    const exist = await User.findOne({ id });
    if (exist) return { success: false, error: "ID sudah digunakan." };
    const create = await User.create({ id, name });
    return { success: true, data: create };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editBalance(id, amount) {
  cache.clear();
  await connectDB();
  try {
    if (!id || amount == null) throw new Error("Masukan data id dan amount!");
    const update = await User.findOneAndUpdate(
      { id },
      { $inc: { balance: amount } },
      { new: true }
    );
    if (!update) return { success: false, error: "ID tidak ditemukan." };
    return { success: true, data: update };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editRole(id, role) {
  cache.clear();
  await connectDB();
  try {
    const update = await User.findOneAndUpdate(
      { id },
      { $set: { role } },
      { new: true }
    );
    if (!update) return { success: false, error: "ID tidak ditemukan." };
    return { success: true, data: update };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function mapUser(user) {
  if (!user) return false;
  const plain = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: plain.id,
    name: plain.name || "No Name",
    balance: typeof plain.balance === "number" ? plain.balance : 0,
    isPremium: plain.role === "premium",
  };
}

export async function checkUser(id, name) {
  const key = `checkUser:${id}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    let exist = await User.findOne({ id });
    if (!exist && name) {
      exist = await User.create({ id, name });
    }
    const res = { success: true, data: mapUser(exist) };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function dbUser(id) {
  const key = `dbUser:${id}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const exist = await User.findOne({ id });
    const res = { success: true, data: mapUser(exist) };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function checkDbBot(id) {
  const key = `checkDbBot:${id}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const exist = await Bot.findOne({ id }).lean();
    const res = { success: true, data: !!exist };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createDbBot(id, name) {
  cache.clear();
  await connectDB();
  try {
    const exist = await Bot.findOne({ id });
    if (exist) return { success: false, error: "ID bot sudah terdaftar." };
    const create = await Bot.create({ id, name });
    return { success: true, data: create };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function dbBot(id) {
  const key = `dbBot:${id}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const bot = await Bot.findOne({ id }).lean();
    if (!bot) return { success: false, message: "Bot not found" };
    const products = await Product.aggregate([
      { $match: { botId: id } },
      {
        $project: {
          id: 1,
          name: 1,
          price: 1,
          desc: 1,
          snk: 1,
          terjual: 1,
          stock: { $size: { $ifNull: ["$account", []] } }
        }
      }
    ]);
    const categories = await Category.find({ botId: id }).lean();
    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });
    const viewMap = {};
    categories.forEach(c => { viewMap[c.name] = { id: c.products }; });
    bot.product = new Map(Object.entries(productMap));
    bot.product_view = new Map(Object.entries(viewMap));
    const res = { success: true, data: bot };
    cache.set(key, res);
    return res;
  } catch (e) {
    return { success: false, message: e.message };
  }
}

export async function createProductView(botId, title) {
  cache.clear();
  await connectDB();
  try {
    const botExists = await Bot.exists({ id: botId });
    if (!botExists) return { success: false, error: "Bot tidak ditemukan." };
    const exist = await Category.findOne({ botId, name: title });
    if (exist) return { exist: true };
    await Category.create({ botId, name: title, products: [] });
    return { success: true, data: { id: [] } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addProductView(botId, title, accounts = []) {
  cache.clear();
  await connectDB();
  try {
    const category = await Category.findOne({ botId, name: title });
    if (!category) return { success: false, error: "Kategori tidak ditemukan." };
    category.products.push(...accounts);
    await category.save();
    return { success: true, data: { id: category.products } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getCategory(botId) {
  const key = `getCategory:${botId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const categories = await Category.find({ botId }).lean();
    let data = {};
    for (let cat of categories) { data[cat.name] = cat.products; }
    const res = { success: true, data };
    cache.set(key, res);
    return res;
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getProductDetails(botId, productId) {
  const key = `getProductDetails:${botId}:${productId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const product = await Product.findOne({ botId, id: productId });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    const res = { success: true, data: product };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addStock(botId, productId, accounts = []) {
  cache.clear();
  await connectDB();
  try {
    const product = await Product.findOne({ botId, id: productId });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    const accountsArray = Array.isArray(accounts) ? accounts : [];
    product.account.push(...accountsArray);
    await product.save();
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function delProduct(botId, productId) {
  cache.clear();
  await connectDB();
  try {
    const result = await Product.deleteOne({ botId, id: productId });
    if (result.deletedCount === 0) return { success: false, error: "Produk tidak ditemukan." };
    await Category.updateMany({ botId }, { $pull: { products: productId } });
    return { success: true, data: `Produk ${productId} berhasil dihapus.` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editProductName(botId, productId, newName) {
  cache.clear();
  await connectDB();
  try {
    const product = await Product.findOneAndUpdate({ botId, id: productId }, { name: newName }, { new: true });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editProductPrice(botId, productId, newPrice) {
  cache.clear();
  await connectDB();
  try {
    const product = await Product.findOneAndUpdate({ botId, id: productId }, { price: Number(newPrice) }, { new: true });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editProductDesk(botId, productId, newDesc) {
  cache.clear();
  await connectDB();
  try {
    const product = await Product.findOneAndUpdate({ botId, id: productId }, { desc: newDesc }, { new: true });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editProductSnk(botId, productId, newSnk) {
  cache.clear();
  await connectDB();
  try {
    const product = await Product.findOneAndUpdate({ botId, id: productId }, { snk: newSnk }, { new: true });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editProductID(botId, oldId, newId) {
  cache.clear();
  await connectDB();
  try {
    const checkNew = await Product.findOne({ botId, id: newId });
    if (checkNew) return { success: false, error: "ID baru sudah digunakan." };
    const product = await Product.findOneAndUpdate({ botId, id: oldId }, { id: newId }, { new: true });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    const cats = await Category.find({ botId, products: oldId });
    for(let cat of cats) {
        const idx = cat.products.indexOf(oldId);
        if(idx !== -1) {
            cat.products[idx] = newId;
            await cat.save();
        }
    }
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getProductAccount(botId, productId, total = 1) {
  const key = `getProductAccount:${botId}:${productId}:${total}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const product = await Product.findOne({ botId, id: productId }, { account: { $slice: total } });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    const res = { success: true, data: product.account };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getProductList(botId) {
  const key = `getProductList:${botId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const products = await Product.aggregate([
      { $match: { botId: botId } },
      {
        $project: {
          id: 1,
          name: 1,
          price: 1,
          desc: 1,
          snk: 1,
          terjual: 1,
          stock: { $size: { $ifNull: ["$account", []] } }
        }
      }
    ]);
    const res = { success: true, data: products };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function takeProductAccount(botId, productId, total = 1) {
  cache.clear();
  await connectDB();
  try {
    const product = await Product.findOne({ botId, id: productId });
    if (!product) return { success: false, error: "Produk tidak ditemukan." };
    if ((product.account || []).length < total) return { success: false, error: "Stok tidak mencukupi." };
    const takenAccounts = product.account.slice(0, total);
    product.account.splice(0, total);
    product.markModified("account"); 
    await product.save();
    return { success: true, data: takenAccounts };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addProduct(botId, productData) {
  cache.clear();
  await connectDB();
  try {
    const botExists = await Bot.exists({ id: botId });
    if (!botExists) return { success: false, error: "Bot tidak ditemukan." };
    const checkProduct = await Product.exists({ botId, id: productData.id });
    if (checkProduct) return { success: false, error: "ID produk sudah ada." };
    const newProduct = await Product.create({
      botId: botId,
      id: productData.id,
      name: productData.name,
      price: productData.price,
      desc: productData.desc || "",
      snk: productData.snk || "",
      terjual: 0,
      account: [],
    });
    return { success: true, data: newProduct };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteProduct(botId, productId) {
    cache.clear();
    return await delProduct(botId, productId);
}

export async function addProductStock(botId, productId, accounts) {
    cache.clear();
    const res = await addStock(botId, productId, accounts);
    if(res.success) {
        return { success: true, data: { stock: res.data.account.length } };
    }
    return res;
}

export async function addCategory(botId, categoryName, productIds) {
  cache.clear();
  await connectDB();
  try {
    const botExists = await Bot.exists({ id: botId });
    if (!botExists) return { success: false, error: "Bot tidak ditemukan." };
    const exist = await Category.exists({ botId, name: categoryName });
    if (exist) return { success: false, error: "Kategori sudah ada." };
    await Category.create({ botId, name: categoryName, products: productIds });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateCategory(botId, categoryName, productIds) {
  cache.clear();
  await connectDB();
  try {
    const category = await Category.findOneAndUpdate({ botId, name: categoryName }, { products: productIds }, { new: true });
    if (!category) return { success: false, error: "Kategori tidak ditemukan." };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteCategory(botId, categoryName) {
  cache.clear();
  await connectDB();
  try {
    const res = await Category.deleteOne({ botId, name: categoryName });
    if (res.deletedCount === 0) return { success: false, error: "Kategori tidak ditemukan." };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAdminStats(botId) {
  const key = `getAdminStats:${botId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const totalUsers = await User.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({ botId });
    const bot = await Bot.findOne({ id: botId });
    if (!bot) return { success: false, error: "Bot tidak ditemukan." };
    const totalProducts = await Product.countDocuments({ botId });
    const totalRevenue = bot.total_nominal_transaksi || 0;
    const totalProductsSold = bot.terjual || 0;
    const res = {
      success: true,
      data: { totalUsers, totalTransactions, totalProducts, totalRevenue, totalProductsSold },
    };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function recordSale(botId, productCode, quantity, finalPrice) {
  cache.clear();
  try {
    await Product.updateOne({ botId, id: productCode }, { $inc: { terjual: quantity } });
    const botData = await Bot.findOne({ id: botId });
    if (botData) {
        botData.terjual = (botData.terjual || 0) + quantity;
        botData.soldtoday = (botData.soldtoday || 0) + quantity;
        botData.trxtoday = (botData.trxtoday || 0) + finalPrice;
        await botData.save();
    }
  } catch (dbError) {
    console.error(dbError);
  }
}

export async function addProductSold(botId, productId, totalTerjual) {
  cache.clear();
  await connectDB();
  try {
    await Bot.findOneAndUpdate({ id: botId }, { $inc: { terjual: totalTerjual } });
    const updatedProduct = await Product.findOneAndUpdate({ botId, id: productId }, { $inc: { terjual: totalTerjual } }, { new: true });
    if (!updatedProduct) return { success: false, error: "Produk tidak ditemukan." };
    return { success: true, data: updatedProduct };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getDBData(fn, ...args) {
  try {
    const result = await fn(...args);
    if (!result.success) throw new Error(result.message);
    return result.data;
  } catch (e) {
    return null;
  }
}

export async function getAllUsers() {
  const key = "getAllUsers";
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const users = await User.find({}).select("-__v").lean();
    const res = { success: true, data: users };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function editUser(userId, updates) {
  cache.clear();
  await connectDB();
  try {
    if (!userId || !updates || Object.keys(updates).length === 0) {
      return { success: false, error: "No update fields provided." };
    }
    const allowed = ["name", "role", "balance", "banned"];
    const sanitized = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        sanitized[key] = updates[key];
      }
    }
    if (Object.keys(sanitized).length === 0) {
      return { success: false, error: "No valid update fields provided." };
    }

    const update = await User.findOneAndUpdate({ id: userId }, { $set: sanitized }, { new: true });
    if (!update) return { success: false, error: "User tidak ditemukan." };
    return { success: true, data: update };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteUser(userId) {
  cache.clear();
  await connectDB();
  try {
    const user = await User.findOneAndDelete({ id: userId });
    if (!user) return { success: false, error: "User tidak ditemukan." };
    await AuthUser.deleteOne({ telegramId: userId });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAllTransactions(botId) {
  const key = `getAllTransactions:${botId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const transactions = await Transaction.find({ botId }).sort({ createdAt: -1 }).limit(100).lean();
    const res = { success: true, data: transactions };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getPublicStats(botId) {
  const key = `getPublicStats:${botId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const bot = await Bot.findOne({ id: botId });
    if (!bot) return { success: false, error: "Bot tidak ditemukan." };
    const res = { success: true, data: { totalRevenue: bot.total_nominal_transaksi || 0, totalProductsSold: bot.terjual || 0 } };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addTransactionHistory(userId, botId, productId, productName, quantity, price, accounts = [], status = "completed", paymentMethod = "balance", snk = "", reffId = "") {
  cache.clear();
  await connectDB();
  try {
    const totalAmount = price * quantity;
    const newTransaction = await Transaction.create({ userId, botId, productId, productName, quantity, price, status, accounts, totalAmount, paymentMethod, snk, reffId });
    return { success: true, data: newTransaction };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getUserTransactionHistory(userId, limit = 10, skip = 0) {
  const key = `getUserTransactionHistory:${userId}:${limit}:${skip}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const history = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(limit).skip(skip);
    const res = { success: true, data: history };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getBotGlobalTransactionHistory(botId, limit = 10, skip = 0) {
  const key = `getBotGlobalTransactionHistory:${botId}:${limit}:${skip}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const history = await Transaction.find({ botId }).sort({ createdAt: -1 }).limit(limit).skip(skip);
    const res = { success: true, data: history };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addBotTransactionDetailed(botId, totalTransaksi, totalTerjual, totalSoldToday, totalTrxToday, nominalLifetime, nominalToday) {
  cache.clear();
  await connectDB();
  try {
    const update = await Bot.findOneAndUpdate({ id: botId }, { $inc: { transaksi: totalTransaksi, terjual: totalTerjual, soldtoday: totalSoldToday, trxtoday: totalTrxToday, total_nominal_transaksi: nominalLifetime, nominaltoday: nominalToday } }, { new: true });
    if (!update) return { success: false, error: "ID Bot tidak ditemukan." };
    return { success: true, data: update };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addBotTransaction(botId, totalTransaksi = 1, totalNominal = 0) {
  cache.clear();
  await connectDB();
  try {
    const update = await Bot.findOneAndUpdate({ id: botId }, { $inc: { transaksi: totalTransaksi, total_nominal_transaksi: totalNominal } }, { new: true });
    if (!update) return { success: false, error: "ID Bot tidak ditemukan." };
    return { success: true, data: update };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function calculateTotalRevenue(botId) {
  const key = `calculateTotalRevenue:${botId ?? 'all'}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const match: any = { status: "completed" };
    if (botId) match.botId = Number(botId);
    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const res = result[0]?.total || 0;
    cache.set(key, res);
    return res;
  } catch (err) {
    return 0;
  }
}

export async function getRevenueByDate(startDate, endDate) {
  const key = `getRevenueByDate:${startDate}:${endDate}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const result = await Transaction.aggregate([{ $match: { status: "completed", createdAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const res = result[0]?.total || 0;
    cache.set(key, res);
    return res;
  } catch (err) {
    return 0;
  }
}

export async function calculateTotalPcs(botId) {
  const key = `calculateTotalPcs:${botId ?? 'all'}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const match: any = { status: "completed" };
    if (botId) match.botId = Number(botId);
    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, totalPcs: { $sum: "$quantity" } } }
    ]);
    const res = result[0]?.totalPcs || 0;
    cache.set(key, res);
    return res;
  } catch (err) {
    return 0;
  }
}

export async function calculateTotalTransactions(botId) {
  const key = `calculateTotalTransactions:${botId ?? 'all'}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const filter: any = {};
    if (botId) filter.botId = Number(botId);
    const count = await Transaction.countDocuments(filter);
    cache.set(key, count);
    return count;
  } catch (err) {
    return 0;
  }
}

export async function getPcsPerProduk() {
  const key = "getPcsPerProduk";
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const result = await Transaction.aggregate([{ $match: { status: "completed" } }, { $group: { _id: "$productId", productName: { $first: "$productName" }, totalPcs: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalAmount" } } }, { $sort: { totalPcs: -1 } }]);
    cache.set(key, result);
    return result;
  } catch (err) {
    return [];
  }
}

export async function getPcsTerjualPerProduk(productId) {
  const key = `getPcsTerjualPerProduk:${productId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const result = await Transaction.aggregate([{ $match: { status: "completed", productId } }, { $group: { _id: "$productId", totalPcs: { $sum: "$quantity" } } }]);
    const res = result[0]?.totalPcs || 0;
    cache.set(key, res);
    return res;
  } catch (err) {
    return 0;
  }
}

export async function addUserTransaction(userId, totalTransaksi, totalMembeli, nominal) {
  cache.clear();
  await connectDB();
  try {
    const update = await User.findOneAndUpdate({ id: userId }, { $inc: { transaksi: totalTransaksi, membeli: totalMembeli, total_nominal_transaksi: nominal } }, { new: true });
    if (!update) return { success: false, error: "ID User tidak ditemukan." };
    return { success: true, data: update };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function pcsPerProdukDariTransaksi(botId) {
  const key = `pcsPerProduk:${botId}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  const hasil = await Transaction.aggregate([{ $match: { status: "completed", botId } }, { $group: { _id: "$productId", namaProduk: { $first: "$productName" }, totalPcs: { $sum: "$quantity" }, totalPendapatan: { $sum: "$totalAmount" } } }, { $sort: { totalPcs: -1 } }]);
  cache.set(key, hasil);
  return hasil;
}

export async function totalTransaksi(botId) {
  const key = `totalTransaksi:${botId}`;
  if (cache.has(key)) return cache.get(key);
  try {
    let data = await pcsPerProdukDariTransaksi(botId);
    let totalPcs = 0;
    let totalPendapatan = 0;
    data.forEach((item) => { totalPcs += item.totalPcs; totalPendapatan += item.totalPendapatan; });
    const res = { totalPcs, totalPendapatan };
    cache.set(key, res);
    return res;
  } catch (e) {
    return { totalPcs: 0, totalPendapatan: 0 };
  }
}

export async function getTelegramUsers() {
  const key = "getTelegramUsers";
  if (cache.has(key)) return cache.get(key);
  try {
    await connectDB();
    let data = await User.find({ isTelegram: true });
    cache.set(key, data);
    return data;
  } catch (error) {
    return [];
  }
}

export async function getProdukPopuler(botId, limit = 10) {
  const key = `getProdukPopuler:${botId}:${limit}`;
  if (cache.has(key)) return cache.get(key);
  await connectDB();
  try {
    const topProducts = await Transaction.aggregate([{ $match: { botId: botId, status: "completed" } }, { $group: { _id: "$productId", productName: { $first: "$productName" }, totalSold: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalAmount" }, lastTransaction: { $max: "$createdAt" } } }, { $sort: { totalSold: -1 } }, { $limit: limit }]);
    const res = { success: true, data: topProducts };
    cache.set(key, res);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}
