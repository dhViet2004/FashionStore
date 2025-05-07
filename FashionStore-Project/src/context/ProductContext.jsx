import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({
    categories: new Set(),
    featured: [],
    lastFetch: null
  });

  const fetchProducts = useCallback(async () => {
    try {
      // Kiểm tra cache và thời gian cache (5 phút)
      const now = Date.now();
      if (cache.lastFetch && now - cache.lastFetch < 5 * 60 * 1000) {
        return;
      }

      const response = await axios.get('http://localhost:3001/products');
      const data = response.data;
      
      // Cập nhật products và cache
      setProducts(data);
      setCache(prev => ({
        ...prev,
        categories: new Set(data.map(p => p.category)),
        featured: data.filter(p => p.featured).slice(0, 8),
        lastFetch: now
      }));
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  }, [cache.lastFetch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductById = useCallback((id) => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductsByCategory = useCallback((category) => {
    return products.filter(product => product.category === category);
  }, [products]);

  const getFeaturedProducts = useCallback((limit = 8) => {
    if (cache.featured.length > 0) {
      return cache.featured.slice(0, limit);
    }
    return products.slice(0, limit);
  }, [products, cache.featured]);

  const getCategories = useCallback(() => {
    return Array.from(cache.categories);
  }, [cache.categories]);

  const refreshProducts = useCallback(() => {
    setCache(prev => ({ ...prev, lastFetch: null }));
    fetchProducts();
  }, [fetchProducts]);

  const value = {
    products,
    loading,
    error,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    getCategories,
    refreshProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext; 