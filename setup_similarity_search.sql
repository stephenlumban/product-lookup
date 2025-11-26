-- Step 1: Enable the pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create the similarity search function
CREATE OR REPLACE FUNCTION search_product_fuzzy(search_term TEXT)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE product_name % search_term
  ORDER BY similarity(product_name, search_term) DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Test the function (optional)
-- SELECT * FROM search_product_fuzzy('coca-colacoke');
