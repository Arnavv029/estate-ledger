/**
 * Dashboard.tsx
 * Main dashboard showing user's properties and recent activity.
 * Provides quick access to registration and transfer features.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWallet } from '@/context/WalletContext';
import { usePropertyRegistry } from '@/hooks/usePropertyRegistry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  FileText,
  ArrowRightLeft,
  Plus,
  ExternalLink,
  Clock,
  Hash,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { address } = useWallet();
  const { properties, transfers } = usePropertyRegistry();

  // Format address for display
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Stats cards data
  const stats = [
    {
      label: 'Registered Properties',
      value: properties.length,
      icon: Building2,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Transfers',
      value: transfers.length,
      icon: ArrowRightLeft,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-mono">{formatAddress(address || '')}</span>
            </p>
          </div>
          <Link to="/register">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Property
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-display font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Link to="/register">
              <div className="p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                <FileText className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Register New Property</h3>
                <p className="text-sm text-muted-foreground">
                  Add a new property to the blockchain registry
                </p>
              </div>
            </Link>
            <Link to="/transfer">
              <div className="p-6 rounded-xl border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
                <ArrowRightLeft className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Transfer Property</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer ownership to another wallet
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Properties</CardTitle>
            {properties.length > 0 && (
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View All
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No properties registered yet</p>
                <Link to="/register">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Register Your First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{property.landDetails.address}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">{property.propertyId}</span>
                          <span>•</span>
                          <span>{property.landDetails.area}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        {property.registrationDate.toLocaleDateString()}
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${property.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Hash className="h-3 w-3" />
                        View Tx
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
