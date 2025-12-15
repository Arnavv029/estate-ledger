/**
 * usePropertyRegistry.ts
 * Custom hook for managing property registry operations.
 * Handles registration, transfer, and receipt generation with blockchain interaction.
 */

import { useState, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { 
  PropertyFormData, 
  RegisteredProperty, 
  TransferFormData, 
  TransferRecord,
  ReceiptData 
} from '@/types/property';
import { toast } from '@/hooks/use-toast';

// Generate a unique property ID
const generatePropertyId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PROP-${timestamp}-${random}`.toUpperCase();
};

// Simulate blockchain transaction (replace with actual smart contract calls)
const simulateTransaction = async (): Promise<{ hash: string; blockNumber: number }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock transaction data
  const hash = '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  const blockNumber = Math.floor(Math.random() * 1000000) + 5000000;
  
  return { hash, blockNumber };
};

export const usePropertyRegistry = () => {
  const { address, signer, isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [properties, setProperties] = useState<RegisteredProperty[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  /**
   * Register a new property on the blockchain
   */
  const registerProperty = useCallback(async (formData: PropertyFormData): Promise<ReceiptData | null> => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to register a property.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      // Generate unique property ID
      const propertyId = generatePropertyId();

      // Simulate blockchain transaction
      // In production, this would interact with your smart contract
      const { hash, blockNumber } = await simulateTransaction();

      // Create registered property record
      const newProperty: RegisteredProperty = {
        id: crypto.randomUUID(),
        propertyId,
        ownerName: formData.ownerName,
        ownerAddress: address,
        landDetails: {
          address: formData.landAddress,
          area: formData.landArea,
          surveyNumber: formData.surveyNumber,
          district: formData.district,
          state: formData.state,
        },
        registrationDate: new Date(),
        transactionHash: hash,
        blockNumber,
      };

      // Update local state
      setProperties(prev => [...prev, newProperty]);

      // Generate receipt data
      const receipt: ReceiptData = {
        type: 'registration',
        propertyId,
        propertyDetails: newProperty.landDetails,
        parties: {
          owner: formData.ownerName,
          ownerWallet: address,
        },
        transaction: {
          hash,
          blockNumber,
          timestamp: new Date(),
        },
      };

      setCurrentReceipt(receipt);

      toast({
        title: "Property Registered Successfully!",
        description: `Property ID: ${propertyId}`,
      });

      return receipt;
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "An error occurred during property registration.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isConnected]);

  /**
   * Transfer property ownership
   */
  const transferProperty = useCallback(async (formData: TransferFormData): Promise<ReceiptData | null> => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to transfer property.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      // Find the property
      const property = properties.find(p => p.propertyId === formData.propertyId);
      
      if (!property) {
        toast({
          title: "Property Not Found",
          description: "The specified property ID does not exist.",
          variant: "destructive",
        });
        return null;
      }

      // Verify ownership (in production, this would be verified on-chain)
      if (property.ownerAddress.toLowerCase() !== address.toLowerCase()) {
        toast({
          title: "Unauthorized",
          description: "You are not the owner of this property.",
          variant: "destructive",
        });
        return null;
      }

      // Simulate blockchain transaction
      const { hash, blockNumber } = await simulateTransaction();

      // Create transfer record
      const transfer: TransferRecord = {
        id: crypto.randomUUID(),
        propertyId: formData.propertyId,
        fromAddress: formData.sellerWallet,
        toAddress: formData.buyerWallet,
        sellerName: formData.sellerName,
        buyerName: formData.buyerName,
        transferDate: new Date(),
        transactionHash: hash,
        blockNumber,
      };

      // Update property ownership
      setProperties(prev => prev.map(p => 
        p.propertyId === formData.propertyId
          ? { ...p, ownerAddress: formData.buyerWallet, ownerName: formData.buyerName }
          : p
      ));

      // Add transfer record
      setTransfers(prev => [...prev, transfer]);

      // Generate receipt
      const receipt: ReceiptData = {
        type: 'transfer',
        propertyId: formData.propertyId,
        propertyDetails: property.landDetails,
        parties: {
          seller: formData.sellerName,
          buyer: formData.buyerName,
          sellerWallet: formData.sellerWallet,
          buyerWallet: formData.buyerWallet,
        },
        transaction: {
          hash,
          blockNumber,
          timestamp: new Date(),
        },
      };

      setCurrentReceipt(receipt);

      toast({
        title: "Transfer Successful!",
        description: `Property ${formData.propertyId} transferred to ${formData.buyerName}`,
      });

      return receipt;
    } catch (error) {
      console.error('Transfer failed:', error);
      toast({
        title: "Transfer Failed",
        description: "An error occurred during property transfer.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isConnected, properties]);

  /**
   * Get property by ID
   */
  const getPropertyById = useCallback((propertyId: string) => {
    return properties.find(p => p.propertyId === propertyId);
  }, [properties]);

  /**
   * Clear current receipt
   */
  const clearReceipt = useCallback(() => {
    setCurrentReceipt(null);
  }, []);

  return {
    isProcessing,
    properties,
    transfers,
    currentReceipt,
    registerProperty,
    transferProperty,
    getPropertyById,
    clearReceipt,
  };
};
