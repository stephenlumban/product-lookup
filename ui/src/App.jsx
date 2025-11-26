import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { supabase } from "./supabaseClient";
import ProductCard from "./ProductCard";
import AddProductModal from "./AddProductModal";
import Navbar from "./components/navbar/Navbar";
import SkeletonCard from "./SkeletonCard";
import "./App.css";

const PAGE_SIZE = 24;

function App() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(null);

  // For search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [visibleSearchCount, setVisibleSearchCount] = useState(24);
  
  // Scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initial load - fetch only first 20 products and total count
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1);

        // Fetch total count
        const { count, error: countError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching products:", error);
        } else {
          const mappedData = data.map((item) => ({
            ...item,
            productName: item.product_name,
            productImageUrl: item.product_image_url,
          }));
          setProducts(mappedData);
          setHasMore(data.length === PAGE_SIZE);
          setPage(1);
        }

        if (countError) {
          console.error("Error fetching total count:", countError);
        } else {
          setTotalCount(count);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, []);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to load more products
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || query) return;

    try {
      setLoadingMore(true);
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) {
        console.error("Error fetching more products:", error);
      } else {
        const mappedData = data.map((item) => ({
          ...item,
          productName: item.product_name,
          productImageUrl: item.product_image_url,
        }));
        setProducts((prev) => [...prev, ...mappedData]);
        setHasMore(data.length === PAGE_SIZE);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, query]);

  // Search products in database with debouncing
  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      setVisibleSearchCount(24);
      return;
    }

    setSearchLoading(true);

    // Debounce search - wait 300ms after user stops typing
    const debounceTimer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .ilike("product_name", `%${query}%`)
          .order("created_at", { ascending: false })
          .limit(100); // Limit search results to 100

        if (error) {
          console.error("Error searching products:", error);
          setSearchResults([]);
        } else {
          const mappedData = data.map((item) => ({
            ...item,
            productName: item.product_name,
            productImageUrl: item.product_image_url,
          }));
          setSearchResults(mappedData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleProductAdded = (newProduct) => {
    const mappedProduct = {
      ...newProduct,
      productName: newProduct.product_name,
      productImageUrl: newProduct.product_image_url,
    };
    setProducts((prev) => [mappedProduct, ...prev]);
    setTotalCount((prev) => (prev ? prev + 1 : 1));

    // Scroll to top to show the newly added product
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Use search results when searching, otherwise use paginated products
  const results = query ? searchResults.slice(0, visibleSearchCount) : products;
  const hasMoreSearchResults = query && visibleSearchCount < searchResults.length;

  const observer = useRef();
  const lastProductElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (query && hasMoreSearchResults) {
              // Load more search results
              setVisibleSearchCount((prev) => prev + 24);
            } else if (!query) {
              // Load more products from database
              loadMoreProducts();
            }
          }
        },
        { rootMargin: "100px" }
      );
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, query, loadMoreProducts, hasMoreSearchResults]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <Navbar
        query={query}
        setQuery={setQuery}
        onAddProductClick={() => setIsModalOpen(true)}
      />

      <div className="content-wrapper">
        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : (
          <p className="product-count">
            {query
              ? `Found ${results.length}${totalCount ? ` out of ${totalCount.toLocaleString()}` : ""} products`
              : `Showing ${products.length}${totalCount ? ` out of ${totalCount.toLocaleString()}` : ""}${hasMore ? " (scroll for more)" : " products"}`}
          </p>
        )}
      </div>

      {searchLoading ? (
        <div className="product-grid">
          {[...Array(24)].map((_, i) => (
            <SkeletonCard key={`search-skeleton-${i}`} />
          ))}
        </div>
      ) : (
        <>
          <div className="product-grid">
            {results.map((product, index) => {
              if (results.length === index + 1) {
                return (
                  <div ref={lastProductElementRef} key={product.id || index}>
                    <ProductCard product={product} />
                  </div>
                );
              } else {
                return (
                  <ProductCard key={product.id || index} product={product} />
                );
              }
            })}
          </div>
          {(loadingMore || hasMoreSearchResults) && (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          )}
        </>
      )}

      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-to-top" title="Scroll to top">
          ↑
        </button>
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}

export default App;
