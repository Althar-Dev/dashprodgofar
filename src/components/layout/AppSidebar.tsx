"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Product', href: '/inventory', icon: Package },
  { name: 'Transaksi', href: '/transactions', icon: Receipt },
  { name: 'Users', href: '/users', icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 relative bg-white/5 border border-white/10">
            <Image 
              src="/img/icon.png" 
              alt="Rumah Premium" 
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            Rumah Premium
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Console
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href}
                  tooltip={item.name}
                  className={cn(
                    "h-11 px-4 transition-all duration-200",
                    pathname === item.href && "bg-sidebar-accent text-sidebar-primary"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {pathname === item.href && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="group-data-[collapsible=icon]:hidden p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
            Sistem Manajemen Inventaris v1.0
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
            <div className="w-4 h-4 relative">
              <Image 
                src="/img/icon.png" 
                alt="Icon" 
                fill 
                className="object-contain"
              />
            </div>
            Rumah Premium
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
