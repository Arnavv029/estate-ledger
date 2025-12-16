-- Allow anyone to update properties (for ownership transfers)
CREATE POLICY "Anyone can update properties" 
ON public.properties 
FOR UPDATE 
USING (true)
WITH CHECK (true);