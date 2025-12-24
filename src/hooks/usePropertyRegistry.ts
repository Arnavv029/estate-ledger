/**
 * usePropertyRegistry.ts
 * Custom hook for managing property registry operations.
 * Handles registration, transfer, and receipt generation with blockchain + database storage.
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  PropertyFormData, 
  PropertyDocuments,
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

/**
 * Upload a document file to Supabase storage
 */
const uploadDocument = async (
  file: File, 
  propertyId: string, 
  docType: string
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}/${docType}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('property-documents')
    .upload(fileName, file, { upsert: true });
  
  if (error) {
    console.error(`Failed to upload ${docType}:`, error);
    return null;
  }
  
  const { data: urlData } = supabase.storage
    .from('property-documents')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
};

export const usePropertyRegistry = () => {
  const { address, signer, isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<RegisteredProperty[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  /**
   * Fetch all properties from database on mount
   */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database records to RegisteredProperty format
        const mappedProperties: RegisteredProperty[] = (data || []).map(p => ({
          id: p.id,
          propertyId: p.property_id,
          ownerName: p.owner_name,
          ownerAddress: p.owner_wallet,
          landDetails: {
            address: p.land_address,
            area: p.land_area,
            surveyNumber: p.survey_number,
            district: p.district,
            state: p.state,
          },
          registrationDate: new Date(p.created_at),
          transactionHash: p.transaction_hash,
          blockNumber: p.block_number,
        }));

        setProperties(mappedProperties);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  /**
   * Fetch transfers from database
   */
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const { data, error } = await supabase
          .from('transfers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database records to TransferRecord format
        const mappedTransfers: TransferRecord[] = (data || []).map(t => ({
          id: t.id,
          propertyId: t.property_id,
          fromAddress: t.seller_wallet,
          toAddress: t.buyer_wallet,
          sellerName: t.seller_name,
          buyerName: t.buyer_name,
          transferDate: new Date(t.created_at),
          transactionHash: t.transaction_hash,
          blockNumber: t.block_number,
        }));

        setTransfers(mappedTransfers);
      } catch (error) {
        console.error('Failed to fetch transfers:', error);
      }
    };

    fetchTransfers();
  }, []);

  /**
   * Register a new property on the blockchain and save to database
   */
  const registerProperty = useCallback(async (
    formData: PropertyFormData, 
    documents?: PropertyDocuments
  ): Promise<ReceiptData | null> => {
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

      // Upload documents if provided
      let documentUrls: Record<string, string | null> = {};
      if (documents) {
        const uploadPromises = [];
        
        if (documents.aadhaarFront) {
          uploadPromises.push(
            uploadDocument(documents.aadhaarFront, propertyId, 'aadhaar-front')
              .then(url => ({ key: 'aadhaar_front_url', url }))
          );
        }
        if (documents.aadhaarBack) {
          uploadPromises.push(
            uploadDocument(documents.aadhaarBack, propertyId, 'aadhaar-back')
              .then(url => ({ key: 'aadhaar_back_url', url }))
          );
        }
        if (documents.panCard) {
          uploadPromises.push(
            uploadDocument(documents.panCard, propertyId, 'pan-card')
              .then(url => ({ key: 'pan_card_url', url }))
          );
        }
        if (documents.ownerPhoto) {
          uploadPromises.push(
            uploadDocument(documents.ownerPhoto, propertyId, 'owner-photo')
              .then(url => ({ key: 'owner_photo_url', url }))
          );
        }
        if (documents.propertyPhoto) {
          uploadPromises.push(
            uploadDocument(documents.propertyPhoto, propertyId, 'property-photo')
              .then(url => ({ key: 'property_photo_url', url }))
          );
        }
        if (documents.ownershipDocument) {
          uploadPromises.push(
            uploadDocument(documents.ownershipDocument, propertyId, 'ownership-document')
              .then(url => ({ key: 'ownership_document_url', url }))
          );
        }

        const uploadResults = await Promise.all(uploadPromises);
        uploadResults.forEach(result => {
          documentUrls[result.key] = result.url;
        });
      }

      // Save to database
      const { data: dbProperty, error: dbError } = await supabase
        .from('properties')
        .insert({
          property_id: propertyId,
          owner_name: formData.ownerName,
          owner_wallet: address,
          aadhaar_number: formData.aadhaarNumber,
          voter_id: formData.voterId,
          phone: formData.phone,
          email: formData.email,
          land_address: formData.landAddress,
          land_area: formData.landArea,
          survey_number: formData.surveyNumber,
          district: formData.district,
          state: formData.state,
          transaction_hash: hash,
          block_number: blockNumber,
          ...documentUrls,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create registered property record
      const newProperty: RegisteredProperty = {
        id: dbProperty.id,
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
        registrationDate: new Date(dbProperty.created_at),
        transactionHash: hash,
        blockNumber,
      };

      // Update local state
      setProperties(prev => [newProperty, ...prev]);

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
      // Find the property from database
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('property_id', formData.propertyId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (!property) {
        toast({
          title: "Property Not Found",
          description: "The specified property ID does not exist.",
          variant: "destructive",
        });
        return null;
      }

      // Verify ownership
      if (property.owner_wallet.toLowerCase() !== address.toLowerCase()) {
        toast({
          title: "Unauthorized",
          description: "You are not the owner of this property.",
          variant: "destructive",
        });
        return null;
      }

      // Simulate blockchain transaction
      const { hash, blockNumber } = await simulateTransaction();

      // Save transfer to database
      const { data: dbTransfer, error: transferError } = await supabase
        .from('transfers')
        .insert({
          property_id: formData.propertyId,
          seller_name: formData.sellerName,
          seller_wallet: formData.sellerWallet,
          seller_phone: formData.sellerPhone,
          seller_email: formData.sellerEmail,
          buyer_name: formData.buyerName,
          buyer_wallet: formData.buyerWallet,
          buyer_phone: formData.buyerPhone,
          buyer_email: formData.buyerEmail,
          transaction_hash: hash,
          block_number: blockNumber,
        })
        .select()
        .single();

      if (transferError) throw transferError;

      // Update property ownership in database
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          owner_name: formData.buyerName,
          owner_wallet: formData.buyerWallet,
        })
        .eq('property_id', formData.propertyId);

      if (updateError) throw updateError;

      // Create transfer record
      const transfer: TransferRecord = {
        id: dbTransfer.id,
        propertyId: formData.propertyId,
        fromAddress: formData.sellerWallet,
        toAddress: formData.buyerWallet,
        sellerName: formData.sellerName,
        buyerName: formData.buyerName,
        transferDate: new Date(dbTransfer.created_at),
        transactionHash: hash,
        blockNumber,
      };

      // Update local state
      setProperties(prev => prev.map(p => 
        p.propertyId === formData.propertyId
          ? { ...p, ownerAddress: formData.buyerWallet, ownerName: formData.buyerName }
          : p
      ));

      setTransfers(prev => [transfer, ...prev]);

      // Generate receipt
      const receipt: ReceiptData = {
        type: 'transfer',
        propertyId: formData.propertyId,
        propertyDetails: {
          address: property.land_address,
          area: property.land_area,
          surveyNumber: property.survey_number,
          district: property.district,
          state: property.state,
        },
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
  }, [address, isConnected]);

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
    isLoading,
    properties,
    transfers,
    currentReceipt,
    registerProperty,
    transferProperty,
    getPropertyById,
    clearReceipt,
  };
};
