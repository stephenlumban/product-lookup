import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './AddProductModal.css';

function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [productName, setProductName] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('category_label');
      
      if (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load categories');
    }
  };

  const handleFilestackPicker = () => {
    const filestackApiKey = import.meta.env.VITE_FILESTACK_API_KEY;
    
    if (!filestackApiKey) {
      setError('Filestack API key not configured');
      return;
    }

    const client = window.filestack.init(filestackApiKey);
    
    client.picker({
      accept: 'image/*',
      maxFiles: 1,
      onUploadDone: (result) => {
        if (result.filesUploaded && result.filesUploaded.length > 0) {
          setProductImageUrl(result.filesUploaded[0].url);
          setError(null);
        }
      },
    }).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      setError('Product name is required');
      return;
    }
    
    if (!productImageUrl) {
      setError('Product image is required');
      return;
    }
    
    if (!selectedCategory) {
      setError('Category is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            product_name: productName,
            product_image_url: productImageUrl,
            category_id: selectedCategory
          }
        ])
        .select();

      if (error) {
        console.error('Error adding product:', error);
        setError('Failed to add product');
      } else {
        // Reset form
        setProductName('');
        setProductImageUrl('');
        setSelectedCategory('');
        
        // Notify parent component
        if (onProductAdded) {
          onProductAdded(data[0]);
        }
        
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Product Image *</label>
            <button
              type="button"
              onClick={handleFilestackPicker}
              className="filestack-button"
              disabled={loading}
            >
              {productImageUrl ? 'Change Image' : 'Upload Image'}
            </button>
            {productImageUrl && (
              <div className="image-preview">
                <img src={productImageUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
