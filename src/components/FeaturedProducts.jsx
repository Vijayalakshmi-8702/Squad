import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function FeaturedProducts() {
  const { products, loading } = useProducts();
  const featured = products.filter(p => p.isFeatured).slice(0, 8);

  if (loading) return null;

  return (
    <section className="py-14 md:py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="section-subtitle dark:text-primary-light">Our Products</span>
          <h2 className="section-title dark:text-white">Browse Our Collection</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Explore our wide range of premium products. From furniture to fashion, we have everything you need.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:mt-12"
        >
          <Link to="/shop" className="btn-primary text-sm sm:text-base px-8 py-3.5 rounded-lg inline-flex items-center gap-2">
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
