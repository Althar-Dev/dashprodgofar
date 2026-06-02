
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { 
  Receipt, 
  Search, 
  ArrowUpRight, 
  Filter, 
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;
  const botId = 220208;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions?botId=${botId}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    String(t.productName || "").toLowerCase().includes(search.toLowerCase()) || 
    String(t.userId || "").toLowerCase().includes(search.toLowerCase()) ||
    String(t._id || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PER_PAGE));
  const displayedTransactions = filteredTransactions.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalNominal = transactions.reduce((acc, t) => acc + Number(t.totalAmount ?? t.price * t.quantity ?? 0), 0);

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
              <span className="hidden md:inline">Transaction Logs</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-9 w-9">
              <Download className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Total Volume</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-headline font-bold text-white">
                  Rp {totalNominal.toLocaleString('id-ID')}
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px]">+12%</Badge>
              </div>
            </Card>
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Processed</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xl font-headline font-bold text-accent">
                  {transactions.length}
                </h3>
              </div>
            </Card>
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Integrity</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-headline font-bold text-emerald-500">100%</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
              </div>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9 bg-secondary/30 border-none h-10 text-white rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-white/10 text-white rounded-xl">
                <Calendar className="w-4 h-4" /> Period
              </Button>
            </div>
          </div>

          <Card className="border-none bg-card/30 shadow-2xl overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto">
                <Table className="w-full min-w-full">
                  <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="hidden sm:table-cell pl-6 text-xs text-muted-foreground uppercase tracking-widest font-bold">ID</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs text-muted-foreground uppercase tracking-widest font-bold">User</TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Product</TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Amount</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs text-muted-foreground uppercase tracking-widest font-bold">Status</TableHead>
                    <TableHead className="text-right pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        {loading ? "Decrypting logs..." : "No records found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedTransactions.map((t) => (
                      <TableRow 
                        key={t._id} 
                        className="border-white/5 group hover:bg-white/[0.02] cursor-pointer transition-colors"
                        onClick={() => router.push(`/transactions/detail/${t._id}`)}
                      >
                        <TableCell className="hidden sm:table-cell font-mono text-[9px] text-primary pl-6">
                          TRX-{String(t._id || "").substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              <UserIcon className="w-3 h-3 text-muted-foreground" /> {t.userId}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white truncate max-w-[150px]">{t.productName}</span>
                              <span className="text-[10px] text-muted-foreground">Qty: {t.quantity} unit</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-headline font-bold text-accent">
                          Rp {(t.totalAmount || t.price * t.quantity).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold tracking-widest",
                              t.status === 'completed' ? "text-emerald-500" : "text-destructive"
                            )}>
                              {t.status === 'completed' ? 'SUCCESS' : 'FAILED'}
                            </span>
                            {t.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors inline-block" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-background/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Records: {filteredTransactions.length}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                  className="h-8 px-3 text-xs text-white"
                >Prev</Button>
                <span className="text-xs text-muted-foreground">{currentPage} / {pageCount}</span>
                <Button
                  variant="ghost"
                  disabled={currentPage === pageCount}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(pageCount, p + 1)); }}
                  className="h-8 px-3 text-xs text-white"
                >Next</Button>
              </div>
            </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
