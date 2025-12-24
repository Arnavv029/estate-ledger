-- Create storage bucket for property documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', true);

-- Create storage policies for property documents
CREATE POLICY "Anyone can upload property documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-documents');

CREATE POLICY "Anyone can view property documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-documents');

-- Add document URL columns to properties table
ALTER TABLE public.properties
ADD COLUMN aadhaar_front_url TEXT,
ADD COLUMN aadhaar_back_url TEXT,
ADD COLUMN pan_card_url TEXT,
ADD COLUMN owner_photo_url TEXT,
ADD COLUMN property_photo_url TEXT,
ADD COLUMN ownership_document_url TEXT;