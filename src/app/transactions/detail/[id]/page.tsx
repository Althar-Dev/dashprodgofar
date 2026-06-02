
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { 
  ChevronLeft, 
  Copy, 
  Package, 
  User as UserIcon, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Hash, 
  ShieldCheck,
  Download,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTransactionDetails();
    }
  }, [id]);

  const loadTransactionDetails = async () => {
    try {
      const botId = 220208;
      const res = await fetch(`/api/transactions?botId=${botId}`);
      const json = await res.json();
      if (json.success) {
        const found = json.data.find((t: any) => t._id === id);
        setTransaction(found);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load transaction data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="text-muted-foreground font-headline animate-pulse uppercase tracking-[0.2em] text-xs">Decrypting Secure Transaction...</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!transaction) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center h-[calc(100vh-64px)]">
            <XCircle className="w-16 h-16 text-destructive/50" />
            <h2 className="text-2xl font-headline font-bold">Transaction Not Found</h2>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl">Go Back</Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/10 rounded-full">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <h1 className="text-sm md:text-xl font-headline font-bold text-white tracking-tight">
              Transaction Details
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 text-white rounded-lg md:rounded-xl text-[10px] md:text-sm h-8 md:h-9">
              <Download className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-6 md:space-y-10 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
          {/* Header Card */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[9px] md:text-[10px] font-mono tracking-tighter">
                  REF: {String(transaction._id).substring(0, 12).toUpperCase()}
                </Badge>
                {transaction.status === 'completed' && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 md:px-3 py-0.5 text-[9px] md:text-[10px] font-bold">
                    SUCCESSFUL
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-4xl font-headline font-bold text-white tracking-tighter line-clamp-2">
                {transaction.productName}
              </h2>
              <p className="text-muted-foreground text-[10px] md:text-sm flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> {new Date(transaction.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            <div className="w-full md:w-auto bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-left md:text-right min-w-[180px] md:min-w-[220px]">
              <p className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Settlement</p>
              <p className="text-2xl md:text-4xl font-headline font-bold text-accent tracking-tighter">
                Rp {Number(transaction.totalAmount || transaction.price * transaction.quantity).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Info Cards */}
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-xl md:rounded-[1.5rem]">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3 text-muted-foreground uppercase text-[8px] md:text-[10px] font-bold tracking-widest">
                  <UserIcon className="w-3 h-3 md:w-4 md:h-4 text-primary" /> Customer Info
                </div>
                <div className="space-y-1">
                  <p className="text-sm md:text-base text-white font-bold truncate">{transaction.userId}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Internal Database ID</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-white/5 shadow-xl rounded-xl md:rounded-[1.5rem]">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3 text-muted-foreground uppercase text-[8px] md:text-[10px] font-bold tracking-widest">
                  <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-accent" /> Payment Mode
                </div>
                <div className="space-y-1">
                  <p className="text-sm md:text-base text-white font-bold">{transaction.paymentMethod?.toUpperCase() || 'BALANCE'}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Digital Wallet System</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-white/5 shadow-xl rounded-xl md:rounded-[1.5rem] sm:col-span-2 md:col-span-1">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3 text-muted-foreground uppercase text-[8px] md:text-[10px] font-bold tracking-widest">
                  <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" /> Security Status
                </div>
                <div className="space-y-1">
                  <p className="text-sm md:text-base text-white font-bold">VERIFIED ASSET</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">End-to-End Encrypted</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deliverables Card */}
          <Card className="bg-card/40 border-white/10 shadow-2xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-5 md:p-8 border-b border-white/5 flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg md:text-2xl font-headline font-bold text-white">Deliverables</CardTitle>
                <CardDescription className="text-[10px] md:text-sm text-muted-foreground">Secured digital asset entries transferred</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] md:text-xs font-bold px-3">
                {transaction.accounts?.length || 0} ITEMS
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] md:h-[400px]">
                <div className="p-4 md:p-8 space-y-3 md:space-y-4">
                  {(transaction.accounts || []).length > 0 ? (
                    transaction.accounts.map((acc: string, i: number) => (
                      <div key={i} className="group flex items-center justify-between p-4 md:p-6 bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] transition-all duration-300">
                        <div className="flex items-center gap-4 md:gap-8 min-w-0">
                          <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 bg-white/5 flex items-center justify-center text-[10px] font-mono text-white/30 border border-white/5">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div className="space-y-0.5 md:space-y-1 min-w-0">
                            <p className="font-mono text-xs md:text-base text-white tracking-tight truncate pr-4">{acc}</p>
                            <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">DIGITAL ASSET KEY</p>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="shrink-0 w-8 h-8 md:w-10 md:h-10 hover:bg-primary/20 hover:text-primary transition-colors rounded-full"
                          onClick={() => copyToClipboard(acc, "Account")}
                        >
                          <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center space-y-4">
                       <Package className="w-12 h-12 md:w-16 md:h-16 text-white/10" />
                       <p className="text-muted-foreground text-xs md:text-sm max-w-[200px] md:max-w-xs">No specific account data was associated with this transaction record.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Additional Info Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-4 md:pt-8 pb-10">
            <div className="space-y-3 md:space-y-4">
               <h3 className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Info className="w-3.5 h-3.5 md:w-4 md:h-4" /> Legal Policy
               </h3>
               <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                 This transaction is final and non-refundable. The digital assets provided above are intended for use under the terms agreed upon during purchase. Unauthorized distribution of these assets is strictly prohibited and monitored.
               </p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 md:gap-4">
               <Button 
                 variant="ghost" 
                 size="sm"
                 className="text-[8px] md:text-[10px] h-8 md:h-9 uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white rounded-lg"
                 onClick={() => copyToClipboard(String(transaction._id), "Transaction ID")}
               >
                 <Hash className="w-3 h-3" /> Copy Ref ID
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm"
                 className="text-[8px] md:text-[10px] h-8 md:h-9 uppercase font-bold tracking-widest gap-2 text-primary hover:bg-primary/10 rounded-lg"
               >
                 <ExternalLink className="w-3 h-3" /> Proof of Payment
               </Button>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
