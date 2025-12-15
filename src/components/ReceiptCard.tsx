/**
 * ReceiptCard.tsx
 * Displays transaction receipt with property and blockchain details.
 * Supports PDF download functionality.
 */

import React, { useRef } from 'react';
import { ReceiptData } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, ExternalLink, CheckCircle2, Building2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

interface ReceiptCardProps {
  receipt: ReceiptData;
  onClose?: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  };

  // Format wallet address
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  // Download receipt as PDF
  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`receipt-${receipt.propertyId}.pdf`);

      toast({
        title: "Receipt Downloaded",
        description: "Your receipt has been saved as PDF.",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open transaction on Etherscan
  const viewOnEtherscan = () => {
    window.open(
      `https://sepolia.etherscan.io/tx/${receipt.transaction.hash}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-4">
      {/* Receipt Card */}
      <div ref={receiptRef} className="bg-card">
        <Card className="border-2 border-accent/20 overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {receipt.type === 'registration' ? 'Registration' : 'Transfer'} Receipt
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Transaction Confirmed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-display font-semibold">EstateRegistry</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Property ID */}
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Property ID</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {receipt.propertyId}
              </p>
            </div>

            {/* Property Details */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Property Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{receipt.propertyDetails.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Area</p>
                  <p className="font-medium">{receipt.propertyDetails.area}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Survey Number</p>
                  <p className="font-medium">{receipt.propertyDetails.surveyNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">District</p>
                  <p className="font-medium">{receipt.propertyDetails.district}, {receipt.propertyDetails.state}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Parties Involved */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {receipt.type === 'registration' ? 'Owner Details' : 'Parties Involved'}
              </h4>
              
              {receipt.type === 'registration' ? (
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground text-sm">Owner</p>
                  <p className="font-medium">{receipt.parties.owner}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {receipt.parties.ownerWallet}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <p className="text-muted-foreground text-sm">Seller</p>
                    <p className="font-medium">{receipt.parties.seller}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {formatAddress(receipt.parties.sellerWallet || '')}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10">
                    <p className="text-muted-foreground text-sm">Buyer</p>
                    <p className="font-medium">{receipt.parties.buyer}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {formatAddress(receipt.parties.buyerWallet || '')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Transaction Details */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Blockchain Transaction
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">Ethereum Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Number</span>
                  <span className="font-mono">{receipt.transaction.blockNumber}</span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs bg-secondary/50 p-2 rounded break-all">
                    {receipt.transaction.hash}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span className="text-right">{formatDate(receipt.transaction.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                This receipt is cryptographically secured on the Ethereum blockchain.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={downloadPDF} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={viewOnEtherscan} variant="outline" className="flex-1 gap-2">
          <ExternalLink className="h-4 w-4" />
          View on Etherscan
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};
