import React, { useState } from 'react';

function ProductCard({ product }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(product.productImageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="product-card">
      <img 
        src={product.productImageUrl} 
        alt={product.productName} 
        className="product-image"
        loading="lazy"
      />
      <h3 className="product-name">{product.productName}</h3>
      <button onClick={copyLink} className="copy-button">
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

export default ProductCard;
