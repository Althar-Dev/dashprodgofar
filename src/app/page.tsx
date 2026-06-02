
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { db, Product } from '@/lib/db';
import { 
  TrendingUp, 
  Search,
  ArrowUpRight,
  Filter,
  Wallet,
  ShoppingBag,
  Activity,
  Package,
  Clock
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    topCategories: 0,
    totalTransactions: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const BOT_ID = Number(process.env.NEXT_PUBLIC_BOT_ID) || 1000447248;
    (async () => {
      try {
        const [productsRes, summaryRes] = await Promise.all([
          fetch(`/api/products?botId=${BOT_ID}`),
          fetch(`/api/transactions/summary?botId=${BOT_ID}`)
        ]);
        const productsJson = await productsRes.json();
        const summaryJson = await summaryRes.json();
        
        if (productsJson.success) {
          const prods = productsJson.data.map((p: any) => ({
            id: p.id,
            sku: p.id,
            name: p.name,
            description: p.desc || "",
            price: p.price,
            stock: p.stock || 0,
            minStock: 0,
            category: "General",
            supplierId: "",
            createdAt: p.createdAt || new Date().toISOString(),
            supplier: null
          }));
          setRecentProducts(prods.slice(0,5));
          setStats({
            totalProducts: prods.length,
            totalValue: prods.reduce((acc:any, x:any) => acc + (x.price * x.stock), 0),
            lowStockCount: prods.filter((x:any) => x.stock <= (x.minStock || 0)).length,
            topCategories: Array.from(new Set(prods.map((x:any) => x.category))).length,
            totalTransactions: summaryJson.success ? (summaryJson.data?.totalTransactions || 0) : 0
          });
        } else {
          setRecentProducts([]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const filteredProducts = recentProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <SidebarTrigger />
            </div>
            <h1 className="text-xl font-headline font-bold tracking-tight flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 md:hidden">
                <Image src="/img/icon.png" alt="Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="md:hidden text-[16px]">Rumah Premium</span>
              <span className="hidden md:inline">Command Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Lookup SKU or Product..." 
                className="pl-9 w-64 h-9 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" className="gap-2 text-white border-white/10">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <Card className="border-none bg-gradient-to-br from-primary/20 via-card/50 to-accent/10 shadow-xl shadow-black/20 group hover:from-primary/30 hover:to-accent/20 transition-all duration-500 flex flex-col justify-center min-h-[140px] relative overflow-hidden border border-white/5">
              <Wallet className="absolute -right-4 -top-4 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors" />
              <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <Wallet className="w-3 h-3 text-primary" /> Income
                  </span>
                  <div className="text-3xl md:text-4xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-tight">
                    Rp {formatNumber(stats.totalValue)}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-500 font-medium">
                    <span className="bg-emerald-500/10 px-2 py-0.5 rounded">Sales Overview</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-card/50 shadow-xl shadow-black/20 group hover:bg-card transition-all duration-300 flex flex-col justify-center min-h-[140px]">
              <CardContent className="p-0 h-full">
                <div className="grid grid-cols-4 h-full">
                  <div className="flex flex-col items-center justify-center border-r border-white/5 py-6 px-1">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-2xl md:text-3xl font-headline font-bold text-white">{formatNumber(stats.totalTransactions)}</span>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1 text-center">Penjualan</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-r border-white/5 py-6 px-1">
                    <Activity className="w-4 h-4 text-emerald-500/50 mb-2 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-2xl md:text-3xl font-headline font-bold text-emerald-500">100%</span>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1 text-center">Success</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-r border-white/5 py-6 px-1">
                    <Package className="w-4 h-4 text-primary/50 mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-2xl md:text-3xl font-headline font-bold text-primary">{formatNumber(stats.totalProducts)}</span>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1 text-center">Product</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-6 px-1">
                    <Clock className="w-4 h-4 text-accent/50 mb-2 group-hover:text-accent transition-colors" />
                    <span className="text-2xl md:text-3xl font-headline font-bold text-accent">0</span>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1 text-center">Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="border-none bg-card/30 shadow-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <CardTitle className="font-headline text-base md:text-lg text-white">New Transactions</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-muted-foreground">Recent operational flow</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs" asChild>
                  <a href="/inventory">View All <ArrowUpRight className="ml-2 w-4 h-4" /></a>
                </Button>
              </CardHeader>
              <CardContent className="pt-6 px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5 px-4">
                      <TableHead className="w-[80px] pl-6 text-xs text-muted-foreground">ID</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Transaction Detail</TableHead>
                      <TableHead className="text-right pr-6 text-xs text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id} className="border-white/5 group hover:bg-white/[0.02]">
                        <TableCell className="font-mono text-[9px] md:text-[10px] text-primary pl-6">{p.sku}</TableCell>
                        <TableCell className="font-medium text-xs md:text-sm text-white">
                          <div className="flex flex-col">
                            <span>{p.name}</span>
                            <span className="text-[9px] md:text-[10px] text-muted-foreground">{p.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn(
                              "text-[10px] md:text-xs font-semibold text-emerald-500"
                            )}>
                              Completed
                            </span>
                            <Progress value={100} className="w-10 md:w-12 h-1 bg-white/5 [&>div]:bg-emerald-500" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
