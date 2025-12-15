/**
 * DashboardLayout.tsx
 * Layout component for authenticated dashboard pages.
 * Includes sidebar navigation and main content area.
 */

import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  ArrowRightLeft,
  Receipt,
  Building2,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Sidebar navigation items
const sidebarItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/register', label: 'Register Property', icon: FileText },
  { href: '/transfer', label: 'Transfer Property', icon: ArrowRightLeft },
  { href: '/receipt', label: 'Receipts', icon: Receipt },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isConnected } = useWallet();
  const location = useLocation();

  // Redirect to home if not connected
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-card/50 min-h-[calc(100vh-4rem)] fixed">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Estate Registry</p>
                <p className="text-xs text-muted-foreground">Blockchain Powered</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Network indicator */}
          <div className="mt-auto p-6">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-medium text-accent">Sepolia Testnet</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All transactions are on testnet
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
