import { useState } from 'react';
import Hero from '../components/Hero';
import Brands from '../components/Brands';
import FeaturedProducts from '../components/FeaturedProducts';
import WhyChooseUs from '../components/WhyChooseUs';
import WeHelp from '../components/WeHelp';
import Testimonials from '../components/Testimonials';
import BlogSection from '../components/BlogSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

// Interactive Custom Categories Hub
function CategoriesHub() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('sofa');

  if (loading) return null;

  // Filter products by dynamic groups
  const getFilteredProducts = () => {
    if (activeTab === 'sofa') {
      return products.filter(p => p.category === 'sofa').slice(0, 4);
    } else if (activeTab === 'chair') {
      return products.filter(p => p.category === 'chair').slice(0, 4);
    } else if (activeTab === 'table') {
      return products.filter(p => p.category === 'table').slice(0, 4);
    }
    return [];
  };

  const currentProducts = getFilteredProducts();

  const tabDetails = {
    sofa: { title: "Luxury Sofas & Sectionals", desc: "Sink into premium comfort with our high-density foam sofas and luxurious velvet sectionals.", badge: "Living Room Best Sellers" },
    chair: { title: "Chairs & Recliners", desc: "Discover ergonomic office chairs, nordic lounge chairs, and cozy wingbacks designed for comfort.", badge: "Top Rated Comfort" },
    table: { title: "Dining & Coffee Tables", desc: "Solid oak dining tables, walnut coffee tables, and adjustable height desks for your dining and workspace.", badge: "Handcrafted Wood" }
  };

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl">
            <span className="text-accent font-extrabold text-xs uppercase tracking-widest bg-yellow-400/20 text-[#ab8100] px-3 py-1 rounded-full mb-3 inline-block">Interactive Hub</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">Shop by Departments</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Browse FurniShopsy's finest selections. Toggle easily between plush velvet sofas, ergonomic and lounge chairs, and sturdy solid wood tables!
            </p>
          </div>
          
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            {[
              { id: 'sofa', label: '🛋️ Sofas', color: 'from-pink-500 to-rose-600' },
              { id: 'chair', label: '🪑 Chairs', color: 'from-purple-500 to-green-600' },
              { id: 'table', label: '🪵 Tables', color: 'from-amber-500 to-orange-600' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all uppercase cursor-pointer active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 dark:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Intro banner */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/5 to-primary-light/5 dark:from-slate-800/40 dark:to-slate-800/10 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <span className="bg-accent text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block">
              {tabDetails[activeTab].badge}
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{tabDetails[activeTab].title}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{tabDetails[activeTab].desc}</p>
          </div>
          <Link 
            to={`/category/${activeTab}/shop`}
            className="btn-primary text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 flex items-center gap-1.5 group whitespace-nowrap"
          >
            Explore Full Department
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + "_grid"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {currentProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

// Newsletter CTA section
function NewsletterCTA() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-r from-[#2d5239] to-[#3b6b4b] dark:from-slate-800 dark:to-slate-900 text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-accent font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3 block">Special Offer</span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Get 20% Off Your First Order</h2>
          <p className="text-green-200 dark:text-slate-400 mb-7 text-sm sm:text-base md:text-lg px-2">
            Subscribe to our newsletter and receive exclusive deals, delivery codes, and early access to new collections.
          </p>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-green-300 focus:outline-none focus:border-white transition-colors text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-accent hover:bg-yellow-500 text-white font-bold px-7 py-3.5 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Subscribe Now
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
      <CategoriesHub />
      <FeaturedProducts />
      <WhyChooseUs />
      <WeHelp />
      <Testimonials />
      <BlogSection />
      <NewsletterCTA />
    </main>
  );
}
