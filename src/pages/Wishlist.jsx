import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist } = useAuth();
  const { products, loading } = useProducts();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id?.toString()) || wishlist.includes(p._id));

  return (
    <main className="min-h-screen pt-28 pb-20 bg-gray-55 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center md:text-left mb-10">
          <span className="text-accent font-extrabold text-xs uppercase tracking-widest bg-yellow-400/20 text-[#ab8100] px-3 py-1 rounded-full mb-3 inline-block">My Collection</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">Your Saved Wishlist</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Keep track of the custom solid-wood furniture pieces you love. Add them to your cart when ready.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-4 animate-pulse h-80">
                <div className="bg-gray-200 dark:bg-slate-700 h-48 rounded-2xl mb-4" />
                <div className="bg-gray-200 dark:bg-slate-700 h-5 rounded w-3/4 mb-2" />
                <div className="bg-gray-200 dark:bg-slate-700 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 max-w-xl mx-auto p-6"
          >
            <div className="w-18 h-18 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">💖</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Wishlist is empty</h2>
            <p className="text-sm text-gray-550 dark:text-slate-400 mb-8 max-w-xs mx-auto">
              You haven't saved any luxury premium furniture pieces yet. Discover chairs, tables, storage collections, and more.
            </p>
            <Link 
              to="/category/sofa/shop" 
              className="btn-primary px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase inline-block cursor-pointer"
            >
              Browse Showroom
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map(product => (
              <motion.div 
                key={product.id || product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
