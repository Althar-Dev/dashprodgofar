export type Product = {
  botId?: number;
  id: string;
  sku?: string;
  name: string;
  description?: string;
  desc?: string;
  snk?: string;
  price: number;
  stock?: number;
  minStock?: number;
  category?: string;
  supplierId?: string;
  createdAt?: string;
  supplier?: null | Record<string, unknown>;
  account?: string[];
  terjual?: number;
};

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

const PRODUCTION = process.env.PRODUCTION === "true";
export const placeholderMode = !PRODUCTION;

const placeholderSuppliers: Supplier[] = [
  { id: "sup-1", name: "Amaris Supply", email: "hello@amaris.co", phone: "+62 812 3456 7890" },
  { id: "sup-2", name: "Nuryanto Wholesale", email: "support@nuryanto.id", phone: "+62 821 9876 5432" },
  { id: "sup-3", name: "Premium Stock", email: "sales@premiumstock.io", phone: "+62 813 1122 3344" },
];

const placeholderUsers = [
  {
    id: 1,
    name: "Admin Premium",
    role: "premium",
    balance: 1500000,
    transaksi: 12,
    membeli: 4,
    total_nominal_transaksi: 820000,
    banned: false,
  },
  {
    id: 2,
    name: "Member User",
    role: "member",
    balance: 500000,
    transaksi: 3,
    membeli: 2,
    total_nominal_transaksi: 250000,
    banned: false,
  },
];

const placeholderBots = [
  {
    id: 220208,
    name: "Dashboard Bot",
    terjual: 18,
    transaksi: 15,
    soldtoday: 3,
    trxtoday: 2,
    total_nominal_transaksi: 1230000,
    nominaltoday: 150000,
  },
];

const placeholderProducts: Product[] = [
  {
    botId: 220208,
    id: "premium-1",
    name: "Premium Account A",
    description: "Eksklusif akses akun premium dengan stok langsung.",
    desc: "Akun premium siap pakai untuk pelanggan VIP.",
    snk: "Digunakan sesuai ketentuan.",
    price: 85000,
    stock: 5,
    category: "Premium",
    supplierId: "sup-1",
    createdAt: new Date().toISOString(),
    account: ["acc-01", "acc-02", "acc-03", "acc-04", "acc-05"],
    terjual: 8,
  },
  {
    botId: 220208,
    id: "premium-2",
    name: "Premium Account B",
    description: "Paket akun premium dengan garansi 1 hari.",
    desc: "Akun siap jual dengan tambahan bonus privasi.",
    snk: "Berlaku satu kali pembelian.",
    price: 95000,
    stock: 3,
    category: "Premium",
    supplierId: "sup-2",
    createdAt: new Date().toISOString(),
    account: ["acc-11", "acc-12", "acc-13"],
    terjual: 10,
  },
  {
    botId: 220208,
    id: "starter-1",
    name: "Starter Package",
    description: "Produk stok cepat untuk pengguna baru.",
    desc: "Pilihan ekonomis dengan kualitas stabil.",
    snk: "Tidak dapat dikembalikan.",
    price: 45000,
    stock: 7,
    category: "Standard",
    supplierId: "sup-3",
    createdAt: new Date().toISOString(),
    account: ["acc-21", "acc-22", "acc-23", "acc-24", "acc-25", "acc-26", "acc-27"],
    terjual: 5,
  },
];

const placeholderCategories = [
  { botId: 220208, name: "Premium", products: ["premium-1", "premium-2"] },
  { botId: 220208, name: "Standard", products: ["starter-1"] },
];

const placeholderTransactions = [
  {
    _id: "trx-1001",
    userId: 1,
    botId: 220208,
    productId: "premium-1",
    productName: "Premium Account A",
    quantity: 1,
    price: 85000,
    status: "completed",
    accounts: ["acc-01"],
    totalAmount: 85000,
    paymentMethod: "balance",
    snk: "",
    reffId: "trx-1001",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "trx-1002",
    userId: 2,
    botId: 220208,
    productId: "starter-1",
    productName: "Starter Package",
    quantity: 1,
    price: 45000,
    status: "completed",
    accounts: ["acc-21"],
    totalAmount: 45000,
    paymentMethod: "balance",
    snk: "",
    reffId: "trx-1002",
    createdAt: new Date().toISOString(),
  },
];

function mapUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name || "No Name",
    balance: typeof user.balance === "number" ? user.balance : 0,
    isPremium: user.role === "premium",
  };
}

function getProductIndex(botId: number, productId: string) {
  return placeholderProducts.findIndex((product) => product.botId === botId && product.id === productId);
}

function getCategoryIndex(botId: number, name: string) {
  return placeholderCategories.findIndex((category) => category.botId === botId && category.name === name);
}

function getBotIndex(botId: number) {
  return placeholderBots.findIndex((bot) => bot.id === botId);
}

function makeProductView(product: Product) {
  return {
    ...product,
    stock: product.account ? product.account.length : 0,
    sku: product.id,
    description: product.description || product.desc || "",
  };
}

export function getSuppliers() {
  return placeholderSuppliers;
}

async function loadDatabase() {
  return await import("./database");
}

async function runDb<T = any>(fn: string, ...args: any[]): Promise<T> {
  if (placeholderMode) {
    const impl = (placeholderDb as any)[fn];
    if (!impl) {
      throw new Error(`Placeholder function ${fn} is not implemented.`);
    }
    return await impl(...args);
  }

  const db = await loadDatabase();
  return await (db as any)[fn](...args);
}

const placeholderDb = {
  createDbBot: async (id: number, name: string) => {
    const exists = placeholderBots.some((bot) => bot.id === id);
    if (exists) return { success: true, data: placeholderBots.find((bot) => bot.id === id) };
    const bot = {
      id,
      name,
      terjual: 0,
      transaksi: 0,
      soldtoday: 0,
      trxtoday: 0,
      total_nominal_transaksi: 0,
      nominaltoday: 0,
    };
    placeholderBots.push(bot);
    return { success: true, data: bot };
  },

  checkDbBot: async (id: number) => {
    return { success: true, data: placeholderBots.some((bot) => bot.id === id) };
  },

  checkUser: async (id: number, name?: string) => {
    let user = placeholderUsers.find((item) => item.id === id);
    if (!user && name) {
      user = {
        id,
        name,
        role: "member",
        balance: 0,
        transaksi: 0,
        membeli: 0,
        total_nominal_transaksi: 0,
        banned: false,
      };
      placeholderUsers.push(user);
    }
    return { success: true, data: mapUser(user) };
  },

  editUser: async (id: number, updates: Record<string, any>) => {
    const user = placeholderUsers.find((item) => item.id === id);
    if (!user) return { success: false, error: "User not found." };
    Object.assign(user, updates);
    return { success: true, data: user };
  },

  getAllUsers: async () => {
    return { success: true, data: placeholderUsers };
  },

  deleteUser: async (id: number) => {
    const index = placeholderUsers.findIndex((item) => item.id === id);
    if (index === -1) return { success: false, error: "User not found." };
    const deleted = placeholderUsers.splice(index, 1)[0];
    return { success: true, data: deleted };
  },

  getAllTransactions: async (botId: number) => {
    const data = placeholderTransactions.filter((trx) => trx.botId === botId);
    return { success: true, data };
  },

  calculateTotalRevenue: async (botId: number) => {
    const filtered = placeholderTransactions.filter((trx) => trx.botId === botId);
    return filtered.reduce((sum, trx) => sum + (trx.totalAmount || 0), 0);
  },

  calculateTotalPcs: async (botId: number) => {
    const filtered = placeholderTransactions.filter((trx) => trx.botId === botId);
    return filtered.reduce((sum, trx) => sum + (trx.quantity || 0), 0);
  },

  calculateTotalTransactions: async (botId: number) => {
    const filtered = placeholderTransactions.filter((trx) => trx.botId === botId);
    return filtered.length;
  },

  getUserTransactionHistory: async (userId: number, limit = 10, skip = 0) => {
    const history = placeholderTransactions
      .filter((trx) => trx.userId === userId)
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(skip, skip + limit);
    return { success: true, data: history };
  },

  getProductList: async (botId: number) => {
    const products = placeholderProducts
      .filter((product) => product.botId === botId)
      .map(makeProductView);
    return { success: true, data: products };
  },

  getProductDetails: async (botId: number, productId: string) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    return { success: true, data: makeProductView(product) };
  },

  addProduct: async (botId: number, productData: any) => {
    if (!productData || !productData.id) {
      return { success: false, error: "Product id required." };
    }
    const exists = placeholderProducts.some((product) => product.botId === botId && product.id === productData.id);
    if (exists) return { success: false, error: "Product already exists." };
    const product: Product = {
      botId,
      id: productData.id,
      name: productData.name || productData.id,
      description: productData.desc || productData.description || "",
      desc: productData.desc || productData.description || "",
      snk: productData.snk || "",
      price: Number(productData.price) || 0,
      account: [],
      terjual: 0,
      createdAt: new Date().toISOString(),
      category: productData.category || "General",
    };
    placeholderProducts.push(product);
    return { success: true, data: product };
  },

  addProductStock: async (botId: number, productId: string, accounts: string[]) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    product.account = [...(product.account || []), ...accounts.filter(Boolean)];
    product.stock = product.account.length;
    return { success: true, data: product };
  },

  deleteProduct: async (botId: number, productId: string) => {
    const index = placeholderProducts.findIndex((item) => item.botId === botId && item.id === productId);
    if (index === -1) return { success: false, error: "Product not found." };
    placeholderProducts.splice(index, 1);
    placeholderCategories.forEach((category) => {
      if (category.botId === botId) {
        category.products = category.products.filter((id) => id !== productId);
      }
    });
    return { success: true, data: `Produk ${productId} berhasil dihapus.` };
  },

  editProductID: async (botId: number, oldId: string, newId: string) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === oldId);
    if (!product) return { success: false, error: "Product not found." };
    if (placeholderProducts.some((item) => item.botId === botId && item.id === newId)) {
      return { success: false, error: "New product ID already exists." };
    }
    product.id = newId;
    placeholderCategories.forEach((category) => {
      if (category.botId === botId) {
        category.products = category.products.map((id) => (id === oldId ? newId : id));
      }
    });
    return { success: true, data: product };
  },

  editProductName: async (botId: number, productId: string, newName: string) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    product.name = newName;
    return { success: true, data: product };
  },

  editProductPrice: async (botId: number, productId: string, newPrice: number) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    product.price = Number(newPrice);
    return { success: true, data: product };
  },

  editProductDesk: async (botId: number, productId: string, newDesc: string) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    product.desc = newDesc;
    product.description = newDesc;
    return { success: true, data: product };
  },

  editProductSnk: async (botId: number, productId: string, newSnk: string) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    product.snk = newSnk;
    return { success: true, data: product };
  },

  takeProductAccount: async (botId: number, productId: string, total = 1) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    const accounts = product.account || [];
    if (accounts.length < total) return { success: false, error: "Not enough stock." };
    const taken = accounts.splice(0, total);
    product.stock = accounts.length;
    return { success: true, data: taken };
  },

  addTransactionHistory: async (
    userId: number,
    botId: number,
    productId: string,
    productName: string,
    quantity: number,
    price: number,
    accounts: string[] = [],
    status = "completed",
    paymentMethod = "balance",
    snk = "",
    reffId = ""
  ) => {
    const transaction = {
      _id: reffId || `trx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      botId,
      productId,
      productName,
      quantity,
      price,
      status,
      accounts,
      totalAmount: Number(price) * Number(quantity),
      paymentMethod,
      snk,
      reffId,
      createdAt: new Date().toISOString(),
    };
    placeholderTransactions.push(transaction);
    return { success: true, data: transaction };
  },

  recordSale: async (botId: number, productCode: string, quantity: number, finalPrice: number) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productCode);
    const bot = placeholderBots.find((item) => item.id === botId);
    if (product) {
      product.terjual = (product.terjual || 0) + quantity;
      product.stock = (product.account?.length ?? 0);
    }
    if (bot) {
      bot.terjual += quantity;
      bot.transaksi += 1;
      bot.soldtoday += quantity;
      bot.trxtoday += 1;
      bot.total_nominal_transaksi += finalPrice;
      bot.nominaltoday += finalPrice;
    }
    return { success: true, data: { bot, product } };
  },

  addProductSold: async (botId: number, productId: string, totalTerjual: number) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    product.terjual = (product.terjual || 0) + totalTerjual;
    return { success: true, data: product };
  },

  getCategory: async (botId: number) => {
    const categories = placeholderCategories
      .filter((item) => item.botId === botId)
      .map((category) => ({
        name: category.name,
        products: category.products,
        count: category.products.length,
      }));
    return { success: true, data: categories };
  },

  addCategory: async (botId: number, categoryName: string, productIds: string[] = []) => {
    const exists = placeholderCategories.some((item) => item.botId === botId && item.name === categoryName);
    if (exists) return { success: false, error: "Category already exists." };
    const category = { botId, name: categoryName, products: productIds };
    placeholderCategories.push(category);
    return { success: true, data: category };
  },

  updateCategory: async (botId: number, categoryName: string, productIds: string[]) => {
    const category = placeholderCategories.find((item) => item.botId === botId && item.name === categoryName);
    if (!category) return { success: false, error: "Category not found." };
    category.products = Array.from(new Set([...(category.products || []), ...productIds]));
    return { success: true, data: category };
  },

  deleteCategory: async (botId: number, categoryName: string) => {
    const index = placeholderCategories.findIndex((item) => item.botId === botId && item.name === categoryName);
    if (index === -1) return { success: false, error: "Category not found." };
    placeholderCategories.splice(index, 1);
    return { success: true };
  },

  addProductToCategory: async (botId: number, categoryName: string, productId: string) => {
    let category = placeholderCategories.find((item) => item.botId === botId && item.name === categoryName);
    if (!category) {
      category = { botId, name: categoryName, products: [] };
      placeholderCategories.push(category);
    }
    if (!category.products.includes(productId)) {
      category.products.push(productId);
    }
    return { success: true, data: category };
  },

  updateProduct: async (botId: number, productId: string, updates: Record<string, any>) => {
    const product = placeholderProducts.find((item) => item.botId === botId && item.id === productId);
    if (!product) return { success: false, error: "Product not found." };
    if (updates.id) {
      const exists = placeholderProducts.some((item) => item.botId === botId && item.id === updates.id);
      if (exists) return { success: false, error: "Product ID already exists." };
      placeholderCategories.forEach((category) => {
        category.products = category.products.map((id) => (id === productId ? updates.id : id));
      });
      product.id = updates.id;
    }
    if (updates.name !== undefined) product.name = updates.name;
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.desc !== undefined) {
      product.desc = updates.desc;
      product.description = updates.desc;
    }
    if (updates.snk !== undefined) product.snk = updates.snk;
    if (updates.account !== undefined && Array.isArray(updates.account)) {
      product.account = updates.account;
      product.stock = updates.account.length;
    }
    return { success: true, data: product };
  },
};

export const createDbBot = async (id: number, name: string) => runDb("createDbBot", id, name);
export const checkDbBot = async (id: number) => runDb("checkDbBot", id);
export const checkUser = async (id: number, name?: string) => runDb("checkUser", id, name);
export const editUser = async (id: number, updates: Record<string, any>) => runDb("editUser", id, updates);
export const getAllUsers = async () => runDb("getAllUsers");
export const deleteUser = async (id: number) => runDb("deleteUser", id);
export const getAllTransactions = async (botId: string | number) => runDb("getAllTransactions", botId);
export const calculateTotalRevenue = async (botId: string | number) => runDb("calculateTotalRevenue", botId);
export const calculateTotalPcs = async (botId: string | number) => runDb("calculateTotalPcs", botId);
export const calculateTotalTransactions = async (botId: string | number) => runDb("calculateTotalTransactions", botId);
export const getUserTransactionHistory = async (userId: number, limit = 10, skip = 0) => runDb("getUserTransactionHistory", userId, limit, skip);
export const getProductList = async (botId: string | number) => runDb("getProductList", botId);
export const getProductDetails = async (botId: string | number, productId: string) => runDb("getProductDetails", botId, productId);
export const addProduct = async (botId: string | number, productData: any) => runDb("addProduct", botId, productData);
export const addProductStock = async (botId: string | number, productId: string, accounts: string[] = []) => runDb("addProductStock", botId, productId, accounts);
export const deleteProduct = async (botId: string | number, productId: string) => runDb("deleteProduct", botId, productId);
export const editProductID = async (botId: string | number, oldId: string, newId: string) => runDb("editProductID", botId, oldId, newId);
export const editProductName = async (botId: string | number, productId: string, newName: string) => runDb("editProductName", botId, productId, newName);
export const editProductPrice = async (botId: string | number, productId: string, newPrice: number) => runDb("editProductPrice", botId, productId, newPrice);
export const editProductDesk = async (botId: string | number, productId: string, newDesc: string) => runDb("editProductDesk", botId, productId, newDesc);
export const editProductSnk = async (botId: string | number, productId: string, newSnk: string) => runDb("editProductSnk", botId, productId, newSnk);
export const takeProductAccount = async (botId: string | number, productId: string, total = 1) => runDb("takeProductAccount", botId, productId, total);
export const getProductAccount = async (botId: string | number, productId: string, total = 1) => runDb("takeProductAccount", botId, productId, total);
export const addTransactionHistory = async (
  userId: number,
  botId: string | number,
  productId: string,
  productName: string,
  quantity: number,
  price: number,
  accounts: string[] = [],
  status = "completed",
  paymentMethod = "balance",
  snk = "",
  reffId = ""
) => runDb("addTransactionHistory", userId, botId, productId, productName, quantity, price, accounts, status, paymentMethod, snk, reffId);
export const recordSale = async (botId: string | number, productCode: string, quantity: number, finalPrice: number) => runDb("recordSale", botId, productCode, quantity, finalPrice);
export const addProductSold = async (botId: string | number, productId: string, totalTerjual: number) => runDb("addProductSold", botId, productId, totalTerjual);
export const getCategory = async (botId: string | number) => runDb("getCategory", botId);
export const addCategory = async (botId: string | number, categoryName: string, productIds: string[] = []) => runDb("addCategory", botId, categoryName, productIds);
export const updateCategory = async (botId: string | number, categoryName: string, productIds: string[]) => runDb("updateCategory", botId, categoryName, productIds);
export const deleteCategory = async (botId: string | number, categoryName: string) => runDb("deleteCategory", botId, categoryName);
export const addProductToCategory = async (botId: string | number, categoryName: string, productId: string) => runDb("addProductToCategory", botId, categoryName, productId);
export const updateProduct = async (botId: string | number, productId: string, updates: Record<string, any>) => runDb("updateProduct", botId, productId, updates);
export const db = { getSuppliers, placeholderMode };
