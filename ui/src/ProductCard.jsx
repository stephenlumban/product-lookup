import React, { useState } from 'react';

function ProductCard({ product }) {
  const [copiedType, setCopiedType] = useState(null);
  const [loadingBg, setLoadingBg] = useState(false);
  const [removedBgLink, setRemovedBgLink] = useState(product.removedBgLink || null);

  const handleRemoveBg = async () => {
    if (loadingBg) return;
    setLoadingBg(true);

    try {
      const removeBgApiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
      const filestackApiKey = import.meta.env.VITE_FILESTACK_API_KEY;

      if (!removeBgApiKey || !filestackApiKey) {
        alert('Please set VITE_REMOVE_BG_API_KEY and VITE_FILESTACK_API_KEY in .env');
        setLoadingBg(false);
        return;
      }

      // 1. Remove BG
      const formData = new FormData();
      formData.append('image_url', product.productImageUrl);
      formData.append('size', 'auto');

      const removeBgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': removeBgApiKey,
        },
        body: formData,
      });

      if (!removeBgRes.ok) {
        throw new Error('Failed to remove background');
      }

      const blob = await removeBgRes.blob();

      // 2. Upload to Filestack
      const filestackRes = await fetch(`https://www.filestackapi.com/api/store/S3?key=${filestackApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
        },
        body: blob,
      });

      if (!filestackRes.ok) {
        throw new Error('Failed to upload to Filestack');
      }

      const filestackData = await filestackRes.json();
      setRemovedBgLink(filestackData.url);
      
      // Update the product object in memory so it persists if we navigate away and back (if parent state is preserved)
      product.removedBgLink = filestackData.url;

    } catch (error) {
      console.error(error);
      alert('Error processing image: ' + error.message);
    } finally {
      setLoadingBg(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
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
      <div className="button-group">
        <button onClick={() => copyToClipboard(product.productImageUrl, 'original')} className="copy-button">
          {copiedType === 'original' ? 'Copied!' : 'Copy Original'}
        </button>
        
        {!removedBgLink ? (
          <button onClick={handleRemoveBg} className="bg-remove-button" disabled={loadingBg}>
            {loadingBg ? 'Processing...' : 'Remove BG'}
          </button>
        ) : (
          <button onClick={() => copyToClipboard(removedBgLink, 'bg-removed')} className="copy-button bg-removed">
            {copiedType === 'bg-removed' ? 'Copied!' : 'Copy No-BG Link'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
