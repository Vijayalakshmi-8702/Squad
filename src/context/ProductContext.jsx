import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      // Fallback to static data if backend is not available
      const staticData = await import('../data/products');
      setProducts(staticData.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const likeProduct = async (id) => {
    // Optimistic update for local/static data
    setProducts(prev => prev.map(p => {
      if (p._id === id || p.id === id) {
        const isCurrentlyLiked = p.isLikedByUser; // We can track this locally
        return { 
          ...p, 
          isLikedByUser: !isCurrentlyLiked,
          likesCount: (p.likesCount || 0) + (isCurrentlyLiked ? -1 : 1) 
        };
      }
      return p;
    }));

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, ...updatedProduct } : p));
      }
    } catch (err) {
      console.error('Backend like failed, using local state');
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, likeProduct, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
