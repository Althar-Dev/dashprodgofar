import mongoose from "mongoose";

const url = process.env.MONGO_URI || process.env.DST_MONGO_URI || process.env.NEXT_PUBLIC_MONGO_URI || "";
const dbName = process.env.DB_NAME || process.env.DST_DB_NAME || process.env.NEXT_PUBLIC_DB_NAME || undefined;

let isConnected = false;

export async function connectDB() {
  if (!url) throw new Error("MONGO URI not set. Set MONGO_URI or NEXT_PUBLIC_MONGO_URI in environment.");
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(url, { dbName, family: 4, serverSelectionTimeoutMS: 5000 });
    isConnected = true;
  } catch (e) {
    console.error("Failed to connect to Mongo:", e);
    throw e;
  }
}

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

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default mongoose;
