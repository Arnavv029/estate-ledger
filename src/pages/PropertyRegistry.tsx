/**
 * PropertyRegistry.tsx
 * Form for registering new properties on the blockchain.
 * Collects owner details, land information, and document uploads with validation.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWallet } from '@/context/WalletContext';
import { usePropertyRegistry } from '@/hooks/usePropertyRegistry';
import { ReceiptCard } from '@/components/ReceiptCard';
import { DocumentUpload } from '@/components/DocumentUpload';
import { PropertyFormData, PropertyDocuments, ReceiptData } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { FileText, Loader2, User, MapPin, Wallet, Upload } from 'lucide-react';

// Initial form state
const initialFormData: PropertyFormData = {
  ownerName: '',
  aadhaarNumber: '',
  voterId: '',
  phone: '',
  email: '',
  landAddress: '',
  landArea: '',
  surveyNumber: '',
  district: '',
  state: '',
};

// Initial document state
const initialDocuments: PropertyDocuments = {
  aadhaarFront: null,
  aadhaarBack: null,
  panCard: null,
  ownerPhoto: null,
  propertyPhoto: null,
  ownershipDocument: null,
};

// Form validation rules
const validateForm = (data: PropertyFormData, documents: PropertyDocuments): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.ownerName.trim()) errors.ownerName = 'Owner name is required';
  
  // Aadhaar: 12 digits
  if (!/^\d{12}$/.test(data.aadhaarNumber)) {
    errors.aadhaarNumber = 'Aadhaar must be 12 digits';
  }
  
  // Voter ID: alphanumeric, 10 characters
  if (!/^[A-Z]{3}\d{7}$/.test(data.voterId.toUpperCase())) {
    errors.voterId = 'Invalid Voter ID format (e.g., ABC1234567)';
  }
  
  // Phone: 10 digits
  if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = 'Phone must be 10 digits';
  }
  
  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!data.landAddress.trim()) errors.landAddress = 'Land address is required';
  if (!data.landArea.trim()) errors.landArea = 'Land area is required';
  if (!data.surveyNumber.trim()) errors.surveyNumber = 'Survey number is required';
  if (!data.district.trim()) errors.district = 'District is required';
  if (!data.state.trim()) errors.state = 'State is required';

  // Document validations
  if (!documents.aadhaarFront) errors.aadhaarFront = 'Aadhaar front is required';
  if (!documents.aadhaarBack) errors.aadhaarBack = 'Aadhaar back is required';
  if (!documents.panCard) errors.panCard = 'PAN card is required';
  if (!documents.ownerPhoto) errors.ownerPhoto = 'Owner photograph is required';
  if (!documents.propertyPhoto) errors.propertyPhoto = 'Property photograph is required';
  if (!documents.ownershipDocument) errors.ownershipDocument = 'Ownership document is required';

  return errors;
};

export const PropertyRegistry: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { registerProperty, isProcessing } = usePropertyRegistry();
  
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [documents, setDocuments] = useState<PropertyDocuments>(initialDocuments);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle document changes
  const handleDocumentChange = (field: keyof PropertyDocuments, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form and documents
    const validationErrors = validateForm(formData, documents);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields and upload all required documents.',
        variant: 'destructive',
      });
      return;
    }

    // Register property with documents
    const result = await registerProperty(formData, documents);
    if (result) {
      setReceipt(result);
    }
  };

  // Close receipt and reset form
  const handleReceiptClose = () => {
    setReceipt(null);
    setFormData(initialFormData);
    setDocuments(initialDocuments);
    navigate('/dashboard');
  };

  // If receipt is generated, show it
  if (receipt) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-display font-bold mb-6">Registration Complete</h1>
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
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold">Register New Property</h1>
          </div>
          <p className="text-muted-foreground">
            Fill in the details below to register a property on the blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Owner Details Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Owner Details</CardTitle>
              </div>
              <CardDescription>Personal information of the property owner</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label htmlFor="ownerName">Full Name *</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={errors.ownerName ? 'border-destructive' : ''}
                />
                {errors.ownerName && (
                  <p className="text-sm text-destructive mt-1">{errors.ownerName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                <Input
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="12-digit Aadhaar"
                  maxLength={12}
                  className={errors.aadhaarNumber ? 'border-destructive' : ''}
                />
                {errors.aadhaarNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.aadhaarNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="voterId">Voter ID *</Label>
                <Input
                  id="voterId"
                  name="voterId"
                  value={formData.voterId}
                  onChange={handleChange}
                  placeholder="e.g., ABC1234567"
                  maxLength={10}
                  className={errors.voterId ? 'border-destructive' : ''}
                />
                {errors.voterId && (
                  <p className="text-sm text-destructive mt-1">{errors.voterId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Land Details Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Land Details</CardTitle>
              </div>
              <CardDescription>Information about the property to be registered</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label htmlFor="landAddress">Property Address *</Label>
                <Textarea
                  id="landAddress"
                  name="landAddress"
                  value={formData.landAddress}
                  onChange={handleChange}
                  placeholder="Full address of the property"
                  rows={3}
                  className={errors.landAddress ? 'border-destructive' : ''}
                />
                {errors.landAddress && (
                  <p className="text-sm text-destructive mt-1">{errors.landAddress}</p>
                )}
              </div>

              <div>
                <Label htmlFor="landArea">Land Area *</Label>
                <Input
                  id="landArea"
                  name="landArea"
                  value={formData.landArea}
                  onChange={handleChange}
                  placeholder="e.g., 2500 sq ft"
                  className={errors.landArea ? 'border-destructive' : ''}
                />
                {errors.landArea && (
                  <p className="text-sm text-destructive mt-1">{errors.landArea}</p>
                )}
              </div>

              <div>
                <Label htmlFor="surveyNumber">Survey Number *</Label>
                <Input
                  id="surveyNumber"
                  name="surveyNumber"
                  value={formData.surveyNumber}
                  onChange={handleChange}
                  placeholder="e.g., SY/123/2024"
                  className={errors.surveyNumber ? 'border-destructive' : ''}
                />
                {errors.surveyNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.surveyNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                  className={errors.district ? 'border-destructive' : ''}
                />
                {errors.district && (
                  <p className="text-sm text-destructive mt-1">{errors.district}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className={errors.state ? 'border-destructive' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-destructive mt-1">{errors.state}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Identity Documents Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Owner Identity Documents</CardTitle>
              </div>
              <CardDescription>Upload identity verification documents</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <DocumentUpload
                id="aadhaarFront"
                label="Aadhaar Card (Front)"
                description="Upload front side of Aadhaar card"
                accept="image/*,application/pdf"
                file={documents.aadhaarFront}
                onFileChange={(file) => handleDocumentChange('aadhaarFront', file)}
                error={errors.aadhaarFront}
                required
              />
              <DocumentUpload
                id="aadhaarBack"
                label="Aadhaar Card (Back)"
                description="Upload back side of Aadhaar card"
                accept="image/*,application/pdf"
                file={documents.aadhaarBack}
                onFileChange={(file) => handleDocumentChange('aadhaarBack', file)}
                error={errors.aadhaarBack}
                required
              />
              <DocumentUpload
                id="panCard"
                label="PAN Card"
                description="Upload PAN card image or PDF"
                accept="image/*,application/pdf"
                file={documents.panCard}
                onFileChange={(file) => handleDocumentChange('panCard', file)}
                error={errors.panCard}
                required
              />
              <DocumentUpload
                id="ownerPhoto"
                label="Owner Photograph"
                description="Upload a recent photograph"
                accept="image/*"
                file={documents.ownerPhoto}
                onFileChange={(file) => handleDocumentChange('ownerPhoto', file)}
                error={errors.ownerPhoto}
                required
              />
            </CardContent>
          </Card>

          {/* Property Documents Section */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Property Documents</CardTitle>
              </div>
              <CardDescription>Upload property-related documents</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <DocumentUpload
                id="propertyPhoto"
                label="Land / Property Photograph"
                description="Upload a photograph of the property"
                accept="image/*"
                file={documents.propertyPhoto}
                onFileChange={(file) => handleDocumentChange('propertyPhoto', file)}
                error={errors.propertyPhoto}
                required
              />
              <DocumentUpload
                id="ownershipDocument"
                label="Property Ownership Document"
                description="Sale deed, registry paper, or ownership proof"
                accept="image/*,application/pdf"
                file={documents.ownershipDocument}
                onFileChange={(file) => handleDocumentChange('ownershipDocument', file)}
                error={errors.ownershipDocument}
                required
              />
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <Card className="border-border/50 bg-secondary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Wallet className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registering Wallet</p>
                  <p className="font-mono text-sm">{address}</p>
                </div>
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
                Processing Transaction...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Register Property
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};
