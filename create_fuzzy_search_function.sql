-- Enable the pg_trgm extension for trigram similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Set the similarity threshold (0.0 to 1.0, lower = more lenient matching)
-- Default is 0.3, you can adjust this based on your needs
-- SET pg_trgm.similarity_threshold = 0.3;

-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS search_product_fuzzy(TEXT);

-- Create the fuzzy search function using similarity
CREATE OR REPLACE FUNCTION search_product_fuzzy(search_term TEXT)
RETURNS TABLE (
  id UUID,
  product_name TEXT,
  product_image_url TEXT,
  category_id UUID,
  created_at TIMESTAMPTZ,
  sim REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.product_name,
    p.product_image_url,
    p.category_id,
    p.created_at,
    similarity(p.product_name, search_term) AS sim
  FROM products p
  WHERE p.product_name % search_term
  ORDER BY sim DESC;
END;
$$ LANGUAGE plpgsql;

-- Test the function (optional - uncomment to test)
-- SELECT * FROM search_product_fuzzy('coca-colacoke');
