import React, { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import productsV1 from './savealot_combined.json';
import productsV2 from './savealot_base.json';
import ProductCard from './ProductCard';
import './App.css';

const datasets = {
  'v1': { name: 'Shop.SaveALot', data: productsV1 },
  'v2': { name: 'SaveALot 16k', data: productsV2 }
};

function App() {
  const [query, setQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('v2');
  const [visibleCount, setVisibleCount] = useState(20);

  const products = datasets[selectedDataset].data;

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['productName'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [products]);

  const results = useMemo(() => {
    if (!query) return products;
    return fuse.search(query).map(result => result.item);
  }, [query, fuse, products]);

  const visibleResults = useMemo(() => {
    return results.slice(0, visibleCount);
  }, [results, visibleCount]);

  useEffect(() => {
    setVisibleCount(20);
  }, [query, selectedDataset]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Product Lookup</h1>
        
        <div className="search-controls">
          <select 
            value={selectedDataset} 
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="dataset-selector"
          >
            {Object.entries(datasets).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <p className="product-count">Found {results.length} products</p>
      </header>
      <div className="product-grid">
        {visibleResults.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
      {visibleCount < results.length && (
        <button onClick={handleLoadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
}

export default App;
