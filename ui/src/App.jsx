import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import products from './savealot_combined.json';
import ProductCard from './ProductCard';
import './App.css';

function App() {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['productName'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) return products;
    return fuse.search(query).map(result => result.item);
  }, [query, fuse]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Product Lookup</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <p className="product-count">Found {results.length} products</p>
      </header>
      <div className="product-grid">
        {results.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

export default App;
