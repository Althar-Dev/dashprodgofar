
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { db, Product, Supplier } from '@/lib/db';
import { 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash, 
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Zap,
  Truck,
  Copy,
  Info,
  Hash,
  BadgeCheck,
  CreditCard,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

function InventorySkeleton() {
  const { state, isMobile } = useSidebar();
  
  const gridClasses = cn(
    "grid gap-3 md:gap-6 grid-cols-2",
    state === "expanded" && !isMobile 
      ? "md:grid-cols-2 lg:grid-cols-3" 
      : "md:grid-cols-3 lg:grid-cols-4"
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <Skeleton className="h-10 w-full max-w-md bg-white/5" />
        <Skeleton className="h-9 w-24 bg-white/5" />
      </div>
      <div className={gridClasses}>
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-card/20 border-white/5 overflow-hidden rounded-2xl">
            <CardHeader className="p-3 md:p-6 pb-2 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 bg-white/5" />
                <Skeleton className="h-6 w-6 rounded-full bg-white/5" />
              </div>
              <Skeleton className="h-6 w-3/4 bg-white/5" />
              <Skeleton className="h-4 w-full bg-white/5" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-2 space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 bg-white/5" />
                  <Skeleton className="h-8 w-16 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 bg-white/5" />
                  <Skeleton className="h-8 w-20 bg-white/5" />
                </div>
              </div>
              <Skeleton className="h-2 w-full bg-white/5" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-3 w-16 bg-white/5" />
                <Skeleton className="h-3 w-20 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InventoryContent() {
  const { state, isMobile } = useSidebar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isCategoryMode = selectedCategory === null;
  const dialogActionLabel = isCategoryMode ? 'New Category' : 'New Product';
  const dialogTitle = isCategoryMode ? 'Create New Category' : 'Register New Product';
  const dialogDescription = isCategoryMode ? 'Define a new product category for catalog grouping.' : 'Assign SKU and initial stock levels for local persistence.';
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockInput, setStockInput] = useState("");
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 0,
    snk: '',
    category: selectedCategory || 'General',
    supplierId: ''
  });
  const [selectedProductView, setSelectedProductView] = useState<any | null>(null);

  const loadData = () => {
    const BOT_ID = 220208;
    (async () => {
      try {
        const res = await fetch(`/api/products?botId=${BOT_ID}`);
        const json = await res.json();
            if (json.success) {
              const prods = json.data.map((p: any) => ({
                id: p.id,
                sku: p.id,
                name: p.name,
                description: p.desc || "",
                price: p.price,
                snk: p.snk || "",
                stock: p.stock || 0,
                minStock: 0,
                category: "General",
                supplierId: "",
                createdAt: p.createdAt || new Date().toISOString(),
                supplier: null,
                account: p.account || [],
                terjual: p.terjual || 0
              }));
          setProducts(prods);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    (async () => {
      try {
        const res = await fetch(`/api/products?botId=${BOT_ID}&view=categories`);
        const json = await res.json();
        if (json.success) {
          setCategories(json.data || []);
        } else setCategories([]);
      } catch (e) {
        console.error(e);
        setCategories([]);
      }
    })();
    setSuppliers(db.getSuppliers());
  };

  useEffect(() => {
    loadData();
    setSelectedCategory(searchParams.get('category'));
    if (searchParams.get('add') === 'true') {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAddOpen && selectedCategory) {
      setFormData(prev => ({ ...prev, category: selectedCategory }));
    }
  }, [isAddOpen, selectedCategory]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCategoryMode) {
      (async () => {
        try {
          const BOT_ID = 220208;
          const productIds = (formData.description || "").split(',').map(s => s.trim()).filter(Boolean);
          const payload = { botId: BOT_ID, category: { name: formData.name, products: productIds } };
          const res = await fetch('/api/products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
          const json = await res.json();
          if (json.success) {
            setIsAddOpen(false);
            resetForm();
            loadData();
            toast({ title: "Success", description: `Category '${formData.name}' created.` });
          } else {
            toast({ title: 'Error creating category', description: json.error || 'Failed to create category', variant: 'destructive' });
          }
        } catch (e: any) {
          console.error(e);
          toast({ title: 'Error creating category', description: e.message || 'Request failed', variant: 'destructive' });
        }
      })();
      return;
    }

    (async () => {
      try {
        const BOT_ID = 220208;
        const payload = {
          botId: BOT_ID,
          product: {
            id: formData.sku || `prod-${Math.random().toString(36).substr(2,9)}`,
            name: formData.name,
            price: formData.price,
            desc: formData.description,
            snk: formData.snk || "",
          }
        };
        const res = await fetch('/api/products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        if (json.success) {
          const createdId = json.data?.id || payload.product.id;
          try {
            await fetch('/api/products', { method: 'PUT', body: JSON.stringify({ botId: BOT_ID, categoryUpdate: { name: selectedCategory, addProductId: createdId } }), headers: { 'Content-Type': 'application/json' } });
          } catch (e) {
            console.error('Failed to attach product to category', e);
          }
          setIsAddOpen(false);
          resetForm();
          loadData();
          toast({ title: "Success", description: "Product added to system" });
        } else {
          toast({ title: 'Error', description: json.error || 'Failed to add product', variant: 'destructive' });
        }
      } catch (e: any) {
        console.error(e);
        toast({ title: 'Error', description: e.message || 'Request failed', variant: 'destructive' });
      }
    })();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      (async () => {
        try {
        const BOT_ID = 220208;
          const payload = { botId: BOT_ID, id: editingProduct.id, updates: { name: formData.name, price: formData.price, desc: formData.description, snk: formData.snk || "" } };
          const res = await fetch('/api/products', { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
          const json = await res.json();
          if (json.success) {
            setEditingProduct(null);
            resetForm();
            loadData();
            toast({ title: "Updated", description: "Product record synchronized" });
          } else {
            toast({ title: 'Error', description: json.error || 'Failed to update', variant: 'destructive' });
          }
        } catch (e) {
          console.error(e);
          toast({ title: 'Error', description: 'Request failed', variant: 'destructive' });
        }
      })();
    }
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;

    (async () => {
      try {
        const BOT_ID = 220208;
        const accounts = stockInput.split('\n').map(s => s.trim()).filter(Boolean);
        if (accounts.length === 0) {
          toast({ title: 'No Accounts', description: 'Masukkan minimal satu Account ID (satu per baris).', variant: 'destructive' });
          return;
        }

        const payload = { botId: BOT_ID, id: stockProduct.id, stockUpdate: { accounts } };
        const res = await fetch('/api/products', { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        if (json.success) {
          const added = accounts.length;
          setStockProduct(null);
          setIsStockOpen(false);
          setStockInput("");
          loadData();
          toast({ title: 'Stock Updated', description: `Added ${added} units to ${stockProduct.name}` });
        } else {
          toast({ title: 'Error', description: json.error || 'Failed to add stock', variant: 'destructive' });
        }
      } catch (e: any) {
        console.error(e);
        toast({ title: 'Error', description: e.message || 'Request failed', variant: 'destructive' });
      }
    })();
  };

  const copyAccount = async (acc: string) => {
    try {
      await navigator.clipboard.writeText(acc);
      toast({ title: 'Copied', description: 'Account copied to clipboard.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not copy to clipboard.', variant: 'destructive' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product from inventory?")) {
      (async () => {
        try {
          const BOT_ID = 220208;
          const res = await fetch(`/api/products?botId=${BOT_ID}&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            loadData();
            toast({ title: "Deleted", description: "Item removed from system", variant: "destructive" });
          } else {
            toast({ title: 'Error', description: json.error || 'Failed to delete', variant: 'destructive' });
          }
        } catch (e) {
          console.error(e);
          toast({ title: 'Error', description: 'Request failed', variant: 'destructive' });
        }
      })();
    }
  };

  const handleDeleteCategory = (name: string) => {
    if (confirm(`Delete category '${name}'?`)) {
      (async () => {
        try {
          const BOT_ID = 220208;
          const res = await fetch(`/api/products?botId=${BOT_ID}&name=${encodeURIComponent(name)}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            loadData();
            toast({ title: 'Deleted', description: `Category '${name}' removed`, variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: json.error || 'Failed to delete category', variant: 'destructive' });
          }
        } catch (e) {
          console.error(e);
          toast({ title: 'Error', description: 'Request failed', variant: 'destructive' });
        }
      })();
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      minStock: 0,
      snk: '',
      category: selectedCategory || 'General',
      supplierId: ''
    });
  };

  const filteredProducts = (selectedCategory ? products.filter(p => p.category === selectedCategory || p.id && categories.find((c:any)=>c.name===selectedCategory && c.products.includes(p.id))) : products)
    .filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const gridClasses = cn(
    "grid gap-3 md:gap-6 grid-cols-2",
    state === "expanded" && !isMobile 
      ? "md:grid-cols-2 lg:grid-cols-3" 
      : "md:grid-cols-3 lg:grid-cols-4"
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <Button variant="outline" size="sm" className="text-white text-[10px] md:text-sm flex items-center gap-2" onClick={() => {
                setSelectedCategory(null);
                router.replace('/inventory');
              }}>
                <ChevronLeft className="w-2 h-2 md:w-4 md:h-4" />
              </Button>
            )}
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 md:hidden">
              <Image src="/img/icon.png" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight flex items-center gap-3 text-white">
            <span className="md:hidden text-[16px]">Rumah Premium</span>
            <span className="hidden md:inline">Product Catalog</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if(!val) resetForm(); }}>
            {!isMobile && (
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm text-white rounded-xl">
                  <Plus className="w-4 h-4" /> {dialogActionLabel}
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="rounded-2xl w-[95vw] sm:max-w-[550px] max-h-[85dvh] md:max-h-[90dvh] flex flex-col bg-card border-none shadow-2xl p-0 overflow-hidden">
              <form onSubmit={handleAdd} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                
                <DialogHeader className="p-6 pb-2 shrink-0">
                  <DialogTitle className="font-headline text-xl md:text-2xl text-white">{dialogTitle}</DialogTitle>
                  <DialogDescription className="text-xs md:text-sm text-muted-foreground">
                    {dialogDescription}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 px-6 min-h-0 overflow-y-auto content-scrollbar">
                  <div className="grid gap-4 py-4">
                    {!selectedCategory ? (
                      <div className="space-y-2">
                        <Label htmlFor="cat-name" className="text-xs md:text-sm text-white">Category Name</Label>
                        <Input id="cat-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Electronics" required className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                        <Label htmlFor="cat-desc" className="text-xs md:text-sm text-white">Optional initial product IDs (comma separated)</Label>
                        <Input id="cat-desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="prod-abc,prod-xyz" className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sku" className="text-xs md:text-sm text-white">Product ID</Label>
                            <Input id="sku" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="prod-123" required className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs md:text-sm text-white">Product Name</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Premium Product Name" required className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-xs md:text-sm text-white">Price (Rp)</Label>
                          <Input id="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="desc" className="text-xs md:text-sm text-white">Description</Label>
                          <Textarea id="desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Product description..." className="bg-secondary/50 border-none resize-none text-xs md:text-sm text-white rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="snk" className="text-xs md:text-sm text-white">Syarat & Ketentuan</Label>
                          <Textarea id="snk" value={formData.snk} onChange={e => setFormData({...formData, snk: e.target.value})} placeholder="Terms and conditions..." className="bg-secondary/50 border-none resize-none text-xs md:text-sm text-white rounded-lg" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <DialogFooter className="p-6 pt-2 shrink-0 flex flex-row items-center justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddOpen(false)} 
                    className="flex-1 sm:flex-none h-9 text-xs text-white border-white/10 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 h-9 text-xs text-white rounded-lg"
                  >
                    {isCategoryMode ? 'Create Category' : 'Initialize Product'}
                  </Button>
                </DialogFooter>
                
              </form>
            </DialogContent>

          </Dialog>
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Download className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="relative flex-1 max-md:mb-2 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search catalog..." 
              className="pl-9 bg-secondary/30 border-none h-10 text-xs md:text-sm text-white rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 text-xs text-white rounded-lg">
              <Filter className="w-4 h-4" /> Category
            </Button>
          </div>
        </div>

        <div className={gridClasses}>
          {!selectedCategory ? (
            categories.map((c) => (
              <Card key={c.name} className="bg-card/40 border-white/5 hover:bg-card/60 transition-all duration-300 group overflow-hidden shadow-xl rounded-2xl cursor-pointer" onClick={() => {
                setSelectedCategory(c.name);
                router.replace(`/inventory?category=${encodeURIComponent(c.name)}`);
              }}>
                <CardHeader className="p-3 md:p-6 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-mono text-[9px] md:text-[10px] tracking-tighter px-1 rounded-sm">
                      {c.count}
                    </Badge>
                    <div className="text-right text-xs text-muted-foreground">Category</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-7 w-7 md:h-8 md:w-8 text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(c.name);
                      }}
                    >
                      <Trash className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xs md:text-lg font-headline mt-2 line-clamp-1 text-white">{c.name}</CardTitle>
                  <CardDescription className="text-[10px] md:text-xs line-clamp-2 text-muted-foreground">{c.products && c.products.length} products</CardDescription>
                </CardHeader>
              </Card>
            ))
          ) : (
            filteredProducts.map((p) => (
              <Card key={p.id} onClick={(e) => { const el = e.target as HTMLElement; if (el.closest('button')) return; setSelectedProductView(p); }} className="bg-card/40 border-white/5 hover:bg-card/60 transition-all duration-300 group overflow-hidden shadow-xl rounded-2xl cursor-pointer">
              <CardHeader className="p-3 md:p-6 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-mono text-[9px] md:text-[10px] tracking-tighter px-1 rounded-sm">
                    {p.sku}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 md:h-8 md:w-8 -mt-1 -mr-2 hover:bg-destructive/20 hover:text-destructive rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                  >
                    <Trash className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  </Button>
                </div>
                <CardTitle className="text-xs md:text-lg font-headline mt-2 line-clamp-1 text-white">{p.name}</CardTitle>
                <CardDescription className="text-[10px] md:text-xs line-clamp-1 md:line-clamp-2 min-h-[14px] md:min-h-[32px] text-muted-foreground leading-relaxed">
                  {p.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-6 space-y-3 md:space-y-4 pt-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-0">
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">In Inventory</p>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className={cn(
                        "text-base md:text-2xl font-bold font-headline",
                        p.stock <= p.minStock ? "text-destructive animate-pulse" : "text-emerald-500"
                      )}>
                        {p.stock}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] text-muted-foreground">units</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Valuation</p>
                    <p className="text-sm md:text-2xl font-headline font-bold text-accent tracking-tighter">
                      Rp {p.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 md:space-y-1.5 hidden md:block">
                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                    <span>Stock Level</span>
                    <span>{Math.round((p.stock / (p.minStock * 5 || 5)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((p.stock / (p.minStock * 5 || 5)) * 100, 100)} 
                    className={cn(
                      "h-1 bg-white/5",
                      p.stock <= p.minStock ? "[&>div]:bg-destructive" : "[&>div]:bg-emerald-500"
                    )} 
                  />
                </div>

                <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-white/5 text-[8px] md:text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 truncate max-w-[60px] md:max-w-[100px]">
                    <Package className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" /> {p.category}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[60px] md:max-w-[120px]">
                    <Truck className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent" /> {p.supplier?.name || 'In-House'}
                  </span>
                </div>
              </CardContent>
              </Card>
            )))
          }
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-[10px] md:text-xs text-muted-foreground tracking-wide">
            Showing {filteredProducts.length} entries
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 border-white/10 text-white rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 border-white/10 text-white rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={!!selectedProductView} onOpenChange={(val) => { if(!val) setSelectedProductView(null); }}>
        <DialogContent className="rounded-[1.5rem] md:rounded-[2.5rem] w-[95vw] sm:max-w-[650px] max-h-[92dvh] md:max-h-[90dvh] flex flex-col bg-background/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 overflow-hidden animate-in fade-in zoom-in duration-300">
          
          <div className="h-20 md:h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent relative shrink-0">
             <div className="absolute inset-0 bg-[url('https://placehold.co/600x400/png?text=')] opacity-10 mix-blend-overlay"></div>
             <div className="absolute -bottom-6 md:-bottom-10 left-6 md:left-8">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-card border-2 md:border-4 border-background flex items-center justify-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:opacity-100 transition-opacity"></div>
                  <Package className="w-8 h-8 md:w-12 md:h-12 text-primary relative z-10" />
                </div>
             </div>
             <div className="absolute bottom-3 md:bottom-4 right-6 md:right-8 flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm font-headline backdrop-blur-md">
                   STOCK READY
                </Badge>
             </div>
          </div>

          <div className="mt-8 md:mt-12 px-6 md:px-8 pb-4 md:pb-6 space-y-4 md:space-y-6 flex-1 overflow-y-auto content-scrollbar">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
              <div className="space-y-0.5 md:space-y-1">
                <DialogTitle className="text-xl md:text-3xl font-headline font-bold text-white tracking-tight">
                  {selectedProductView?.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  <Hash className="w-2.5 h-2.5 md:w-3 md:h-3" /> {selectedProductView?.id}
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <BadgeCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" /> Premium Asset
                </DialogDescription>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-2.5 md:px-6 md:py-4 flex flex-col items-start md:items-end">
                <span className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Current Price</span>
                <span className="text-lg md:text-3xl font-headline font-bold text-accent tracking-tighter">
                  Rp {selectedProductView?.price?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
               <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 space-y-1 md:space-y-2">
                  <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold">
                    <CreditCard className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" /> Units Available
                  </div>
                  <div className="text-lg md:text-2xl font-headline font-bold text-white">{(selectedProductView?.account || []).length} <span className="text-[10px] md:text-xs text-muted-foreground font-body">PCS</span></div>
               </div>
               <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 space-y-1 md:space-y-2">
                  <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold">
                    <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent" /> Total Value
                  </div>
                  <div className="text-lg md:text-2xl font-headline font-bold text-white truncate">
                    Rp {((selectedProductView?.account?.length || 0) * (selectedProductView?.price || 0)).toLocaleString('id-ID')}
                  </div>
               </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest">
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4" /> Description & Features
              </div>
              <div className="p-4 md:p-5 rounded-none bg-secondary/20 border border-white/5 leading-relaxed text-xs md:text-sm text-white/80">
                {selectedProductView?.description || 'No detailed specifications provided for this asset.'}
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 pb-2 md:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest">
                  <Hash className="w-3.5 h-3.5 md:w-4 md:h-4" /> Secured Entries
                </div>
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-none text-[8px] md:text-[10px]">
                  ENCRYPTED STORAGE
                </Badge>
              </div>
              
              <ScrollArea className="h-48 md:h-64 bg-black/20 border border-white/5 p-3 md:p-4 rounded-none">
                <div className="grid gap-2 md:gap-3">
                  {(selectedProductView?.account || []).map((acc: string, i: number) => (
                    <div key={i} className="group flex items-center justify-between p-3 md:p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all duration-300 rounded-none">
                      <div className="flex items-center gap-3 md:gap-4">
                         <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 flex items-center justify-center text-[8px] md:text-[10px] font-mono text-white/30 border border-white/5 rounded-none">
                            {String(i + 1).padStart(2, '0')}
                         </div>
                         <div className="font-mono text-xs md:text-sm text-white/90 tracking-tight truncate max-w-[140px] sm:max-w-[200px] md:max-w-[300px]">
                            {acc}
                         </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="w-8 h-8 md:w-9 md:h-9 hover:bg-primary/20 hover:text-primary transition-colors rounded-none"
                        onClick={() => copyAccount(acc)}
                      >
                        <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  ))}
                  {((selectedProductView?.account || []).length === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center space-y-3 md:space-y-4">
                       <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Package className="w-6 h-6 md:w-8 md:h-8 text-white/20" />
                       </div>
                       <p className="text-[10px] md:text-xs text-muted-foreground max-w-[180px] md:max-w-[200px]">No active account entries detected in the database.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="p-4 md:p-6 shrink-0 bg-white/[0.02] border-t border-white/10 flex flex-row items-center justify-end gap-2 md:gap-3">
              <Button type="button" variant="outline" onClick={() => { setStockProduct(selectedProductView); setStockInput(""); setIsStockOpen(true); setSelectedProductView(null); }} className="flex-1 sm:flex-none h-10 md:h-11 px-4 md:px-8 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest text-white border-white/10 hover:bg-white/5 transition-all">Add Stock</Button>
              <Button type="button" onClick={() => { setEditingProduct(selectedProductView); setSelectedProductView(null); setFormData({
                  sku: selectedProductView.sku,
                  name: selectedProductView.name,
                  description: selectedProductView.description,
                  price: selectedProductView.price,
                  snk: selectedProductView.snk || "",
                  stock: selectedProductView.stock,
                  minStock: selectedProductView.minStock,
                  category: selectedProductView.category,
                  supplierId: selectedProductView.supplierId
                }); }} className="flex-1 sm:flex-none h-10 md:h-11 px-4 md:px-8 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Modify Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(val) => { if(!val) { setEditingProduct(null); resetForm(); } }}>
        <DialogContent className="rounded-2xl w-[95vw] sm:max-w-[550px] max-h-[90dvh] flex flex-col bg-card border-none shadow-2xl p-0 overflow-hidden">
        <form onSubmit={handleUpdate} className="flex flex-col flex-1 min-h-0">
          
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="font-headline text-xl md:text-2xl text-white">Modify Product</DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Editing product: {editingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sku" className="text-xs md:text-sm text-white">ID Produk</Label>
                  <Input id="edit-sku" value={formData.sku} readOnly className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-xs md:text-sm text-white">Nama Produk</Label>
                  <Input id="edit-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama produk" required className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-xs md:text-sm text-white">Harga (Rp)</Label>
                <Input id="edit-price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required className="bg-secondary/50 border-none h-9 text-xs md:text-sm text-white rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-xs md:text-sm text-white">Deskripsi</Label>
                <Textarea id="edit-desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Deskripsi produk..." className="bg-secondary/50 border-none resize-none text-xs md:text-sm text-white rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-snk" className="text-xs md:text-sm text-white">Syarat & Ketentuan</Label>
                <Textarea id="edit-snk" value={formData.snk} onChange={e => setFormData({...formData, snk: e.target.value})} placeholder="Syarat dan ketentuan..." className="bg-secondary/50 border-none resize-none text-xs md:text-sm text-white rounded-lg" />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 shrink-0 flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="h-9 text-xs text-white border-white/10 rounded-lg">Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 h-9 text-xs text-white rounded-lg">Sync Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>

      <Dialog open={isStockOpen} onOpenChange={(val) => { if(!val) { setStockProduct(null); setStockInput(""); } setIsStockOpen(val); }}>
        <DialogContent className="rounded-2xl w-[95vw] sm:max-w-[550px] max-h-[90dvh] flex flex-col bg-card border-none shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleAddStock} className="flex flex-col flex-1 min-h-0">
            <DialogHeader className="p-6 pb-2 shrink-0">
              <DialogTitle className="font-headline text-xl md:text-2xl text-white">Add Stock</DialogTitle>
              <DialogDescription className="text-xs md:text-sm text-muted-foreground">
                Restock {stockProduct?.name} by adding account entries—one per line.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 px-6 min-h-0 overflow-y-auto content-scrollbar">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm text-white">Account Entries (One per line)</Label>
                  <Textarea 
                    value={stockInput} 
                    onChange={e => setStockInput(e.target.value)} 
                    placeholder="Example:&#10;account_id_1&#10;account_id_2&#10;account_id_3" 
                    className="bg-secondary/50 border-none min-h-[200px] text-xs md:text-sm text-white rounded-lg focus-visible:ring-1 focus-visible:ring-primary" 
                  />
                  <p className="text-[10px] text-muted-foreground">Masukkan tiap ID akun di baris baru. Setiap baris akan dihitung sebagai 1 stok baru.</p>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-2 shrink-0 flex flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsStockOpen(false); setStockProduct(null); setStockInput(""); }} className="h-9 text-xs text-white border-white/10 rounded-lg">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 h-9 text-xs text-white rounded-lg">Confirm Restock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InventoryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Suspense fallback={<InventorySkeleton />}>
          <InventoryContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}

