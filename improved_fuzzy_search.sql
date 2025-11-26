-- Enable the pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing function to recreate it
DROP FUNCTION IF EXISTS search_product_fuzzy(TEXT);

-- Create improved fuzzy search function that works with short queries too
CREATE OR REPLACE FUNCTION search_product_fuzzy(query_text TEXT)
RETURNS SETOF products AS $$
BEGIN
  -- For short queries (1-2 characters), use ILIKE
  -- For longer queries (3+ characters), use similarity search
  IF LENGTH(query_text) <= 2 THEN
    RETURN QUERY
    SELECT *
    FROM products
    WHERE product_name ILIKE '%' || query_text || '%'
    ORDER BY product_name;
  ELSE
    -- Use similarity search for longer queries
    RETURN QUERY
    SELECT *
    FROM products
    WHERE product_name % query_text
       OR product_name ILIKE '%' || query_text || '%'
    ORDER BY similarity(product_name, query_text) DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Test queries (optional - uncomment to test)
-- SELECT * FROM search_product_fuzzy('c');           -- Single letter
-- SELECT * FROM search_product_fuzzy('co');          -- Two letters
-- SELECT * FROM search_product_fuzzy('coca');        -- Normal search
-- SELECT * FROM search_product_fuzzy('coca-colacoke'); -- Fuzzy search
