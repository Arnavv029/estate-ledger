-- Create properties table for storing registered properties
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  owner_wallet TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  land_address TEXT NOT NULL,
  land_area TEXT NOT NULL,
  survey_number TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transfers table for storing property transfers
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES public.properties(property_id),
  seller_name TEXT NOT NULL,
  seller_wallet TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_wallet TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for properties (public read, insert allowed for anyone)
CREATE POLICY "Anyone can view properties" 
ON public.properties 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can register properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for transfers (public read, insert allowed for anyone)
CREATE POLICY "Anyone can view transfers" 
ON public.transfers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create transfers" 
ON public.transfers 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX idx_properties_owner_wallet ON public.properties(owner_wallet);
CREATE INDEX idx_properties_property_id ON public.properties(property_id);
CREATE INDEX idx_transfers_property_id ON public.transfers(property_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();