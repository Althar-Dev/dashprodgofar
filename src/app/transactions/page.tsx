
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
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  ListOrdered,
  X
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalTransactions: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const botId = 220208;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trxRes, summaryRes] = await Promise.all([
        fetch(`/api/transactions?botId=${botId}`),
        fetch(`/api/transactions/summary?botId=${botId}`)
      ]);
      
      const trxJson = await trxRes.json();
      const summaryJson = await summaryRes.json();

      if (trxJson.success) {
        setTransactions(trxJson.data);
      }
      if (summaryJson.success) {
        setSummary(summaryJson.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      String(t.productName || "").toLowerCase().includes(search.toLowerCase()) || 
      String(t.userId || "").toLowerCase().includes(search.toLowerCase()) ||
      String(t._id || "").toLowerCase().includes(search.toLowerCase());

    if (!dateRange?.from) return matchesSearch;

    const trxDate = new Date(t.createdAt);
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);

    if (!dateRange.to) {
      return matchesSearch && trxDate >= fromDate;
    }

    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);

    return matchesSearch && trxDate >= fromDate && trxDate <= toDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage, dateRange]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const displayedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearPeriodFilter = () => {
    setDateRange(undefined);
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Total Volume</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xl md:text-2xl font-headline font-bold text-white truncate">
                  Rp {summary.totalRevenue.toLocaleString('id-ID')}
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] md:text-[10px] tracking-tight shrink-0">REALTIME</Badge>
              </div>
            </Card>
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Processed</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xl md:text-2xl font-headline font-bold text-accent">
                  {summary.totalTransactions}
                </h3>
                <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[10px] tracking-tight shrink-0">TOTAL</Badge>
              </div>
            </Card>
            <Card className="hidden lg:flex bg-card/40 border-white/5 shadow-xl rounded-2xl p-4 flex flex-col justify-between">
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
                className="pl-9 bg-secondary/30 border-none h-10 text-xs md:text-sm text-white rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(
                    "flex-1 md:flex-none gap-2 border-white/10 text-[10px] md:text-sm rounded-xl h-9 md:h-10 transition-all",
                    dateRange?.from ? "bg-primary/10 text-primary border-primary/20" : "text-white"
                  )}>
                    <CalendarIcon className="w-3 h-3 md:w-4 md:h-4" /> 
                    {dateRange?.from ? (
                      dateRange.to ? `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}` : format(dateRange.from, "dd/MM")
                    ) : "Period"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl w-[95vw] sm:max-w-[425px] bg-card border-none shadow-2xl p-0 overflow-hidden max-h-[90dvh] flex flex-col gap-0">
                  <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="font-headline text-xl text-white">Filter Period</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Select a date range to filter transaction logs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto flex justify-center p-4 min-h-0">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      className="rounded-xl border border-white/5 bg-secondary/20 text-white"
                    />
                  </div>
                  <DialogFooter className="p-6 pt-4 shrink-0 border-t border-white/5 flex flex-row items-center justify-end gap-2 bg-card">
                    <Button variant="ghost" onClick={clearPeriodFilter} className="text-white hover:bg-white/5 h-9 text-xs">
                      Clear Filter
                    </Button>
                    <Button onClick={() => setIsPeriodOpen(false)} className="bg-primary hover:bg-primary/90 text-white h-9 text-xs rounded-lg px-6">
                      Apply
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Select value={itemsPerPage.toString()} onValueChange={(val) => setItemsPerPage(Number(val))}>
                <SelectTrigger className="flex-1 md:w-[120px] bg-secondary/30 border-white/10 text-[10px] md:text-sm text-white rounded-xl h-9 md:h-10">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-3 h-3 md:w-4 md:h-4" />
                    <SelectValue placeholder="Limit" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-none bg-card/30 shadow-2xl overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto">
                <Table className="w-full min-w-full">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="hidden sm:table-cell pl-6 text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">ID</TableHead>
                      <TableHead className="hidden md:table-cell text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">User</TableHead>
                      <TableHead className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Product</TableHead>
                      <TableHead className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Amount</TableHead>
                      <TableHead className="hidden sm:table-cell text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Status</TableHead>
                      <TableHead className="text-right pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground animate-pulse uppercase tracking-widest text-xs">
                          Decrypting logs...
                        </TableCell>
                      </TableRow>
                    ) : displayedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <XCircle className="w-10 h-10 text-muted-foreground/20" />
                            <p className="text-muted-foreground text-xs md:text-sm">No records found for the selected criteria.</p>
                            {(search || dateRange) && (
                              <Button variant="link" onClick={() => { setSearch(""); setDateRange(undefined); }} className="text-primary text-xs">
                                Clear all filters
                              </Button>
                            )}
                          </div>
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
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white flex items-center gap-1">
                                <UserIcon className="w-3 h-3 text-muted-foreground" /> {t.userId}
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(t.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="hidden sm:flex w-8 h-8 rounded-lg bg-primary/10 items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] md:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">{t.productName}</span>
                                <span className="text-[9px] md:text-[10px] text-muted-foreground">Qty: {t.quantity} unit</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-headline font-bold text-accent text-xs md:text-base">
                            Rp {(t.totalAmount || t.price * t.quantity).toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[9px] md:text-[10px] font-bold tracking-widest",
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
              
              <div className="px-4 py-4 border-t border-white/10 bg-background/70 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
                  Records: <span className="text-white font-medium">{filteredTransactions.length}</span> (Page {currentPage} of {pageCount})
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                    className="h-8 px-3 text-[10px] md:text-xs text-white border border-white/5 hover:bg-white/5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === pageCount}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(pageCount, p + 1)); }}
                    className="h-8 px-3 text-[10px] md:text-xs text-white border border-white/5 hover:bg-white/5 disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
