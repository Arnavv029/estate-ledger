/**
 * ReceiptPage.tsx
 * Page for viewing and managing transaction receipts.
 * Allows users to view past receipts and generate new ones.
 */

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePropertyRegistry } from '@/hooks/usePropertyRegistry';
import { ReceiptCard } from '@/components/ReceiptCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, FileText, ArrowRightLeft, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReceiptPage: React.FC = () => {
  const { properties, transfers, currentReceipt, clearReceipt } = usePropertyRegistry();

  // Combine properties and transfers for timeline view
  const allTransactions = [
    ...properties.map(p => ({
      type: 'registration' as const,
      id: p.id,
      propertyId: p.propertyId,
      date: p.registrationDate,
      hash: p.transactionHash,
      description: `Registered: ${p.landDetails.address}`,
    })),
    ...transfers.map(t => ({
      type: 'transfer' as const,
      id: t.id,
      propertyId: t.propertyId,
      date: t.transferDate,
      hash: t.transactionHash,
      description: `Transferred to: ${t.buyerName}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // If there's a current receipt to display
  if (currentReceipt) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-display font-bold mb-6">Transaction Receipt</h1>
          <ReceiptCard receipt={currentReceipt} onClose={clearReceipt} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold">Receipts</h1>
          </div>
          <p className="text-muted-foreground">
            View and download receipts for all your property transactions.
          </p>
        </div>

        {/* Transaction History */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {allTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                <div className="flex justify-center gap-3">
                  <Link to="/register">
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Register Property
                    </Button>
                  </Link>
                  <Link to="/transfer">
                    <Button variant="outline" className="gap-2">
                      <ArrowRightLeft className="h-4 w-4" />
                      Transfer Property
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {allTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        tx.type === 'registration' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}>
                        {tx.type === 'registration' ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <ArrowRightLeft className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">{tx.propertyId}</span>
                          <span>•</span>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        {tx.date.toLocaleDateString()}
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on Etherscan
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-border/50 bg-secondary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">About Receipts</h3>
                <p className="text-sm text-muted-foreground">
                  All receipts contain blockchain transaction hashes that can be independently 
                  verified on the Ethereum Sepolia network. Download receipts as PDF for your records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
