/**
 * TransferProperty.tsx
 * Form for transferring property ownership between wallets.
 * Collects buyer and seller details with validation.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWallet } from '@/context/WalletContext';
import { usePropertyRegistry } from '@/hooks/usePropertyRegistry';
import { ReceiptCard } from '@/components/ReceiptCard';
import { TransferFormData, ReceiptData } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowRightLeft, Loader2, User, UserCheck, Search, AlertCircle } from 'lucide-react';

// Initial form state
const initialFormData: TransferFormData = {
  propertyId: '',
  sellerName: '',
  sellerWallet: '',
  sellerPhone: '',
  sellerEmail: '',
  buyerName: '',
  buyerWallet: '',
  buyerPhone: '',
  buyerEmail: '',
};

// Form validation rules
const validateForm = (data: TransferFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.propertyId.trim()) errors.propertyId = 'Property ID is required';
  
  // Seller validation
  if (!data.sellerName.trim()) errors.sellerName = 'Seller name is required';
  if (!/^0x[a-fA-F0-9]{40}$/.test(data.sellerWallet)) {
    errors.sellerWallet = 'Invalid wallet address';
  }
  if (!/^\d{10}$/.test(data.sellerPhone)) {
    errors.sellerPhone = 'Phone must be 10 digits';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.sellerEmail)) {
    errors.sellerEmail = 'Invalid email address';
  }
  
  // Buyer validation
  if (!data.buyerName.trim()) errors.buyerName = 'Buyer name is required';
  if (!/^0x[a-fA-F0-9]{40}$/.test(data.buyerWallet)) {
    errors.buyerWallet = 'Invalid wallet address';
  }
  if (!/^\d{10}$/.test(data.buyerPhone)) {
    errors.buyerPhone = 'Phone must be 10 digits';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.buyerEmail)) {
    errors.buyerEmail = 'Invalid email address';
  }

  // Check wallets are different
  if (data.sellerWallet && data.buyerWallet && 
      data.sellerWallet.toLowerCase() === data.buyerWallet.toLowerCase()) {
    errors.buyerWallet = 'Buyer wallet must be different from seller';
  }

  return errors;
};

export const TransferProperty: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { transferProperty, getPropertyById, isProcessing } = usePropertyRegistry();
  
  const [formData, setFormData] = useState<TransferFormData>({
    ...initialFormData,
    sellerWallet: address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [propertyFound, setPropertyFound] = useState<boolean | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Search for property
  const handlePropertySearch = () => {
    if (!formData.propertyId.trim()) {
      setErrors(prev => ({ ...prev, propertyId: 'Enter a property ID to search' }));
      return;
    }
    
    const property = getPropertyById(formData.propertyId);
    setPropertyFound(!!property);
    
    if (!property) {
      toast({
        title: 'Property Not Found',
        description: 'No property found with this ID. Please check and try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Property Found',
        description: `${property.landDetails.address}`,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields.',
        variant: 'destructive',
      });
      return;
    }

    const result = await transferProperty(formData);
    if (result) {
      setReceipt(result);
    }
  };

  // Close receipt and reset form
  const handleReceiptClose = () => {
    setReceipt(null);
    setFormData({ ...initialFormData, sellerWallet: address || '' });
    setPropertyFound(null);
    navigate('/dashboard');
  };

  // If receipt is generated, show it
  if (receipt) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-display font-bold mb-6">Transfer Complete</h1>
          <ReceiptCard receipt={receipt} onClose={handleReceiptClose} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <ArrowRightLeft className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-2xl font-display font-bold">Transfer Property</h1>
          </div>
          <p className="text-muted-foreground">
            Transfer property ownership to a new wallet address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Search Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Property Lookup</CardTitle>
              </div>
              <CardDescription>Enter the property ID to initiate transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="propertyId"
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    placeholder="e.g., PROP-ABC123-XYZ"
                    className={errors.propertyId ? 'border-destructive' : ''}
                  />
                  {errors.propertyId && (
                    <p className="text-sm text-destructive mt-1">{errors.propertyId}</p>
                  )}
                </div>
                <Button type="button" variant="outline" onClick={handlePropertySearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
              {propertyFound === false && (
                <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Property not found in registry
                </div>
              )}
              {propertyFound === true && (
                <div className="flex items-center gap-2 mt-3 text-accent text-sm">
                  <UserCheck className="h-4 w-4" />
                  Property verified and ready for transfer
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Details Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Seller Details</CardTitle>
              </div>
              <CardDescription>Current property owner information</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label htmlFor="sellerName">Full Name *</Label>
                <Input
                  id="sellerName"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  placeholder="Seller's full name"
                  className={errors.sellerName ? 'border-destructive' : ''}
                />
                {errors.sellerName && (
                  <p className="text-sm text-destructive mt-1">{errors.sellerName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="sellerWallet">Wallet Address *</Label>
                <Input
                  id="sellerWallet"
                  name="sellerWallet"
                  value={formData.sellerWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                  className={`font-mono ${errors.sellerWallet ? 'border-destructive' : ''}`}
                />
                {errors.sellerWallet && (
                  <p className="text-sm text-destructive mt-1">{errors.sellerWallet}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sellerPhone">Phone Number *</Label>
                <Input
                  id="sellerPhone"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={errors.sellerPhone ? 'border-destructive' : ''}
                />
                {errors.sellerPhone && (
                  <p className="text-sm text-destructive mt-1">{errors.sellerPhone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sellerEmail">Email Address *</Label>
                <Input
                  id="sellerEmail"
                  name="sellerEmail"
                  type="email"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={errors.sellerEmail ? 'border-destructive' : ''}
                />
                {errors.sellerEmail && (
                  <p className="text-sm text-destructive mt-1">{errors.sellerEmail}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-accent" />
                <CardTitle className="text-lg">Buyer Details</CardTitle>
              </div>
              <CardDescription>New property owner information</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label htmlFor="buyerName">Full Name *</Label>
                <Input
                  id="buyerName"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  placeholder="Buyer's full name"
                  className={errors.buyerName ? 'border-destructive' : ''}
                />
                {errors.buyerName && (
                  <p className="text-sm text-destructive mt-1">{errors.buyerName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="buyerWallet">Wallet Address *</Label>
                <Input
                  id="buyerWallet"
                  name="buyerWallet"
                  value={formData.buyerWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                  className={`font-mono ${errors.buyerWallet ? 'border-destructive' : ''}`}
                />
                {errors.buyerWallet && (
                  <p className="text-sm text-destructive mt-1">{errors.buyerWallet}</p>
                )}
              </div>

              <div>
                <Label htmlFor="buyerPhone">Phone Number *</Label>
                <Input
                  id="buyerPhone"
                  name="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={errors.buyerPhone ? 'border-destructive' : ''}
                />
                {errors.buyerPhone && (
                  <p className="text-sm text-destructive mt-1">{errors.buyerPhone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="buyerEmail">Email Address *</Label>
                <Input
                  id="buyerEmail"
                  name="buyerEmail"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={errors.buyerEmail ? 'border-destructive' : ''}
                />
                {errors.buyerEmail && (
                  <p className="text-sm text-destructive mt-1">{errors.buyerEmail}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Transfer...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-5 w-5" />
                Transfer Property
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};
