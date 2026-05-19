import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useState } from 'react';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const badgeColors = {
  Sale: 'bg-red-500',
  New: 'bg-primary',
  Popular: 'bg-accent',
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { likeProduct } = useProducts();
  const [added, setAdded] = useState(false);
  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleLike = (e) => {
    e.preventDefault();
    likeProduct(product._id || product.id);
  };

  const isLiked = product.isLikedByUser;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[product.badge] || 'bg-gray-500'}`}>
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-full text-sm">Out of Stock</span>
          </div>
        )}
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </span>
        </div>
        {/* Like button */}
        <div className="absolute top-12 right-3 flex flex-col items-center gap-1 z-10">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-110 ${
              isLiked ? 'text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            style={isLiked ? { backgroundColor: product.accentColor || '#ef4444' } : {}}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          </Link>
          <div 
            className="w-3 h-3 rounded-full shrink-0 mt-1.5" 
            style={{ backgroundColor: product.accentColor }} 
            title="Product Color"
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 capitalize mb-2">{product.category}</p>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-400 dark:text-slate-500">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 dark:text-slate-500 line-through ml-2">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : product.inStock
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export { StarRating };
