"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Package, Receipt, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Product', href: '/inventory', icon: Package },
  { name: 'Add', href: '/inventory?add=true', icon: Plus, isSpecial: true },
  { name: 'Transaksi', href: '/transactions', icon: Receipt },
  { name: 'Users', href: '/users', icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addHref = pathname === '/inventory'
    ? `/inventory?add=true${searchParams.get('category') ? `&category=${encodeURIComponent(searchParams.get('category')!)}` : ''}`
    : '/inventory?add=true';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/5 px-4 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const currentHref = item.isSpecial ? addHref : item.href;
          const isActive = pathname === item.href;
          
          if (item.isSpecial) {
            return (
              <Link
                key={item.name}
                href={currentHref}
                className="flex flex-col items-center justify-center -mt-8 flex-1"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background transition-transform active:scale-90">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-[9px] font-bold tracking-tight uppercase mt-1 text-primary">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "fill-current/20")} />
              </div>
              <span className={cn(
                "text-[9px] font-bold tracking-tight uppercase transition-opacity",
                isActive ? "opacity-100" : "opacity-80"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
