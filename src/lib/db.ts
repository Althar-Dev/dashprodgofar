
"use client";

// This is a simulated SQLite storage interface that operates on local storage
// providing a relational-like experience for the demo.

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  supplierId: string;
  createdAt: string;
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Global Tech Distro', contact: '+62 811 001', email: 'sales@globaltech.com' },
  { id: 'sup-2', name: 'Nippon Hardware', contact: '+81 03 1234', email: 'support@nippon.jp' },
  { id: 'sup-3', name: 'Aurora Components', contact: '+1 415 999', email: 'orders@aurora.io' },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod-1', sku: 'RP-001', name: 'Quantum Laptop Pro', description: 'High performance computing machine', price: 2500, stock: 45, minStock: 10, category: 'Electronics', supplierId: 'sup-1', createdAt: new Date().toISOString() },
  { id: 'prod-2', sku: 'RP-002', name: 'Celestial Monitor 8K', description: 'Ultrawide professional display', price: 1200, stock: 12, minStock: 5, category: 'Electronics', supplierId: 'sup-1', createdAt: new Date().toISOString() },
  { id: 'prod-3', sku: 'RP-003', name: 'Indigo Mechanical Key', description: 'Premium tactile experience', price: 180, stock: 5, minStock: 20, category: 'Peripherals', supplierId: 'sup-2', createdAt: new Date().toISOString() },
  { id: 'prod-4', sku: 'RP-004', name: 'Onyx Storage Node 4TB', description: 'Reliable cloud storage unit', price: 450, stock: 85, minStock: 15, category: 'Storage', supplierId: 'sup-3', createdAt: new Date().toISOString() },
  { id: 'prod-5', sku: 'RP-005', name: 'Fusion Power Cell', description: 'Long lasting energy module', price: 95, stock: 200, minStock: 50, category: 'Energy', supplierId: 'sup-3', createdAt: new Date().toISOString() },
];

class Database {
  private products: Product[] = [];
  private suppliers: Supplier[] = [];
  private initialized: boolean = false;

  private init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    const storedProducts = localStorage.getItem('rp_products');
    const storedSuppliers = localStorage.getItem('rp_suppliers');

    this.products = storedProducts ? JSON.parse(storedProducts) : DEFAULT_PRODUCTS;
    this.suppliers = storedSuppliers ? JSON.parse(storedSuppliers) : DEFAULT_SUPPLIERS;
    this.initialized = true;
    this.persist();
  }

  private persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('rp_products', JSON.stringify(this.products));
    localStorage.setItem('rp_suppliers', JSON.stringify(this.suppliers));
  }

  // Relational Joins
  getProductsWithSuppliers() {
    this.init();
    return this.products.map(p => ({
      ...p,
      supplier: this.suppliers.find(s => s.id === p.supplierId)
    }));
  }

  getSuppliers() {
    this.init();
    return this.suppliers;
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    this.init();
    const newProduct: Product = {
      ...product,
      id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.products.push(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    this.init();
    this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p);
    this.persist();
  }

  deleteProduct(id: string) {
    this.init();
    this.products = this.products.filter(p => p.id !== id);
    this.persist();
  }

  getStats() {
    this.init();
    const totalValue = this.products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockCount = this.products.filter(p => p.stock <= p.minStock).length;
    return {
      totalProducts: this.products.length,
      totalValue,
      lowStockCount,
      topCategories: Array.from(new Set(this.products.map(p => p.category))).length
    };
  }
}

export const db = new Database();
