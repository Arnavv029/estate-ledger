/**
 * property.ts
 * Type definitions for property-related data structures
 */

// Property registration form data
export interface PropertyFormData {
  ownerName: string;
  aadhaarNumber: string;
  voterId: string;
  phone: string;
  email: string;
  landAddress: string;
  landArea: string;
  surveyNumber: string;
  district: string;
  state: string;
}

// Document files for property registration
export interface PropertyDocuments {
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panCard: File | null;
  ownerPhoto: File | null;
  propertyPhoto: File | null;
  ownershipDocument: File | null;
}

// Document URLs stored in database
export interface PropertyDocumentUrls {
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  panCardUrl?: string;
  ownerPhotoUrl?: string;
  propertyPhotoUrl?: string;
  ownershipDocumentUrl?: string;
}

// Registered property with blockchain info
export interface RegisteredProperty {
  id: string;
  propertyId: string;
  ownerName: string;
  ownerAddress: string;
  landDetails: {
    address: string;
    area: string;
    surveyNumber: string;
    district: string;
    state: string;
  };
  registrationDate: Date;
  transactionHash: string;
  blockNumber: number;
}

// Transfer form data
export interface TransferFormData {
  propertyId: string;
  sellerName: string;
  sellerWallet: string;
  sellerPhone: string;
  sellerEmail: string;
  buyerName: string;
  buyerWallet: string;
  buyerPhone: string;
  buyerEmail: string;
}

// Transfer record
export interface TransferRecord {
  id: string;
  propertyId: string;
  fromAddress: string;
  toAddress: string;
  sellerName: string;
  buyerName: string;
  transferDate: Date;
  transactionHash: string;
  blockNumber: number;
}

// Receipt data structure
export interface ReceiptData {
  type: 'registration' | 'transfer';
  propertyId: string;
  propertyDetails: {
    address: string;
    area: string;
    surveyNumber: string;
    district: string;
    state: string;
  };
  parties: {
    owner?: string;
    seller?: string;
    buyer?: string;
    ownerWallet?: string;
    sellerWallet?: string;
    buyerWallet?: string;
  };
  transaction: {
    hash: string;
    blockNumber: number;
    timestamp: Date;
    gasUsed?: string;
  };
}
