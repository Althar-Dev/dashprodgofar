
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { 
  Users as UsersIcon, 
  Search, 
  Trash, 
  Filter,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';


export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [userHistory, setUserHistory] = useState<Record<number, any[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<number, boolean>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "member", banned: false, balance: 0 });
  const PER_PAGE = 20;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (confirm(`Hapus user ${userId} dari sistem?`)) {
      try {
        const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          console.log("User telah dihapus");
          loadUsers();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      role: user.role || "member",
      banned: !!user.banned,
      balance: Number(user.balance || 0),
    });
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editForm.name.trim(),
          role: editForm.role.trim(),
          balance: Number(editForm.balance),
          banned: Boolean(editForm.banned),
        }),
      });
      const json = await res.json();
      if (json.success) {
        console.log("User berhasil diperbarui");
        loadUsers();
        setIsEditOpen(false);
        setEditingUser(null);
      } else {
        console.error(json.error || 'Update gagal');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toString().includes(search)
  );

  const loadUserHistory = async (userId: number) => {
    if (userHistory[userId] || historyLoading[userId]) return;
    setHistoryLoading((current) => ({ ...current, [userId]: true }));

    try {
      const res = await fetch(`/api/users/history?userId=${userId}&limit=5`);
      const json = await res.json();
      if (json.success) {
        setUserHistory((current) => ({ ...current, [userId]: json.data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading((current) => ({ ...current, [userId]: false }));
    }
  };

  const toggleUserDetails = (userId: number) => {
    setExpandedUserId((current) => {
      const next = current === userId ? null : userId;
      if (next !== null) {
        loadUserHistory(userId);
      }
      return next;
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const displayedUsers = filteredUsers.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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
              <span className="hidden md:inline">User Management</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2">
              <UserCheck className="w-4 h-4" /> Add Admin
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/40 border-white/5 shadow-xl rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Users</p>
                    <p className="text-2xl font-headline font-bold text-white">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search user ID or name..." 
                className="pl-9 bg-secondary/30 border-none h-10 text-white rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-white/10 text-white rounded-xl">
                <Filter className="w-4 h-4" /> Role
              </Button>
            </div>
          </div>

          <Card className="w-full border-none bg-card/30 shadow-2xl overflow-hidden rounded-2xl max-w-full">
            <CardContent className="p-0">
              {displayedUsers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  {loading ? "Synchronizing data..." : "No users found in system."}
                </div>
              ) : (
                <div className="grid gap-4 p-4">
                  {displayedUsers.map((u) => {
                    const expanded = expandedUserId === u.id;
                    return (
                      <Card key={u.id} className="bg-card/40 border border-white/10 rounded-3xl shadow-xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-accent text-sm font-semibold">
                                {u.name?.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground truncate">ID {u.id} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-2 py-1 rounded-full border-none",
                                    u.role === 'admin' ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"
                                  )}>
                                    {u.role?.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] px-2 py-1 rounded-full border-none bg-emerald-500/10 text-emerald-400">
                                    Rp {Number(u.balance || 0).toLocaleString('id-ID')}
                                  </Badge>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-2 py-1 rounded-full border-none",
                                    u.banned ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                                  )}>
                                    {u.banned ? 'Banned' : 'Active'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => toggleUserDetails(u.id)}>
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                <span className="ml-2 text-[11px] uppercase tracking-[0.2em]">{expanded ? 'Close' : 'Details'}</span>
                              </Button>
                            </div>
                          </div>

                          <div className={cn(
                            "overflow-hidden transition-all duration-200",
                            expanded ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                          )}>
                            <div className="rounded-3xl border border-white/10 bg-background/50 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Riwayat Transaksi</p>
                                {historyLoading[u.id] ? (
                                  <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
                                ) : (userHistory[u.id] && userHistory[u.id].length > 0) ? (
                                  <div className="max-h-[50vh] overflow-y-auto space-y-4 text-sm text-white pr-1">
                                    {userHistory[u.id].map((item: any, index: number) => (
                                      <div key={`${u.id}-${index}`} className="rounded-2xl bg-white/5 p-4">
                                        <p className="text-sm font-semibold text-white truncate">{item.productName || 'Unknown Product'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                                        <p className="text-sm font-semibold text-accent mt-2">Rp {Number(item.totalAmount || item.price || 0).toLocaleString('id-ID')}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Belum ada riwayat transaksi untuk user ini.</p>
                                )}
                              </div>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => openEditDialog(u)}>
                                  <Edit3 className="w-4 h-4" /> Edit Details
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-xl text-destructive border border-destructive/10" onClick={() => handleDelete(u.id)}>
                                  <Trash className="w-4 h-4" /> Delete
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">Updated {new Date(u.updatedAt || u.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              <div className="px-4 py-3 border-t border-white/10 bg-background/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">Showing {displayedUsers.length} / {filteredUsers.length} users</p>
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

          <Dialog open={isEditOpen} onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              setEditingUser(null);
            }
          }}>
            <DialogContent className="w-[95vw] max-w-xl rounded-xl">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Perbarui nama, role, balance, dan status banned user.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="User name"
                    className="mt-2 bg-secondary/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Role</label>
                  <Input
                    value={editForm.role}
                    onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}
                    placeholder="admin or member"
                    className="mt-2 bg-secondary/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Balance</label>
                  <Input
                    type="number"
                    value={editForm.balance}
                    onChange={(event) => setEditForm((current) => ({ ...current, balance: Number(event.target.value) }))}
                    placeholder="Balance"
                    className="mt-2 bg-secondary/10 text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="banned"
                    type="checkbox"
                    checked={editForm.banned}
                    onChange={(event) => setEditForm((current) => ({ ...current, banned: event.target.checked }))}
                    className="h-4 w-4 rounded border border-white/10 bg-background text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="banned" className="text-sm text-muted-foreground">Banned</label>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="ghost" className="rounded-xl">Cancel</Button>
                </DialogClose>
                <Button onClick={handleEditSave} className="rounded-xl">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}