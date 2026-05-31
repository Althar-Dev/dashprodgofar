
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
  User as UserIcon
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;
  const botId = 220208;

  useEffect(() => {
    loadTransactions();
    loadSummary();
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

  const loadSummary = async () => {
    try {
      const res = await fetch(`/api/transactions/summary?botId=${botId}`);
      const json = await res.json();
      if (json.success) {
        // optionally you can use json.data.totalRevenue elsewhere
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.productName.toLowerCase().includes(search.toLowerCase()) || 
    t.userId.toString().includes(search)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PER_PAGE));
  const displayedTransactions = filteredTransactions.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalNominal = transactions.reduce((acc, t) => acc + Number(t.totalAmount ?? t.total_nominal_transaksi ?? t.total_nominal ?? 0), 0);

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
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Total Nominal</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-headline font-bold text-white">
                  Rp {totalNominal.toLocaleString('id-ID')}
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px]">+12%</Badge>
              </div>
            </Card>
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Total Transactions</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xl font-headline font-bold text-accent">
                  {transactions.length}
                </h3>
              </div>
            </Card>
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Success Rate</p>
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
                placeholder="Search by product or user ID..." 
                className="pl-9 bg-secondary/30 border-none h-10 text-white rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-white/10 text-white rounded-xl">
                <Calendar className="w-4 h-4" /> This Month
              </Button>
            </div>
          </div>

          <Card className="border-none bg-card/30 shadow-2xl overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto mx-0 sm:-mx-4 sm:px-4 px-4 touch-pan-x">
                <Table className="w-full min-w-full table-fixed">
                  <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="hidden sm:table-cell pl-6 text-xs text-muted-foreground">ID Transaksi</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs text-muted-foreground">User / Customer</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Product Detail</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Amount</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs text-muted-foreground">Method</TableHead>
                    <TableHead className="hidden sm:table-cell text-right pr-6 text-xs text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        {loading ? "Decrypting logs..." : "No transactions found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedTransactions.map((t) => (
                      <TableRow key={t._id} className="border-white/5 group hover:bg-white/[0.02]">
                        <TableCell className="hidden sm:table-cell font-mono text-[9px] text-primary pl-6">
                          TRX-{t._id.toString().substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell min-w-0">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white flex items-center gap-1 truncate">
                              <UserIcon className="w-3 h-3 text-muted-foreground" /> <span className="truncate">{t.userId}</span>
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate">
                              {new Date(t.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-white truncate max-w-[160px]">{t.productName}</span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">Qty: {t.quantity} unit</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-headline font-bold text-accent">
                          Rp {(t.totalAmount || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-[9px] bg-secondary/50 border-none rounded-md px-2 py-0.5">
                            {t.paymentMethod || "BALANCE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <span className={cn(
                              "text-[10px] font-bold",
                              t.status === 'completed' ? "text-emerald-500" : "text-destructive"
                            )}>
                              {t.status === 'completed' ? 'SUCCESS' : 'FAILED'}
                            </span>
                            {t.status === 'completed' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-background/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Showing {displayedTransactions.length} / {filteredTransactions.length} transactions</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="rounded px-3 py-2 bg-white/5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                >Prev</Button>
                <span className="text-sm text-muted-foreground">Page {currentPage} of {pageCount}</span>
                <Button
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  className="rounded px-3 py-2 bg-white/5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
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