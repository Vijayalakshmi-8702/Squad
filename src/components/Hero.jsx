import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#f9f6f1] to-[#e8f0ea] dark:from-slate-900 dark:to-slate-800 min-h-screen flex items-center overflow-hidden pt-16 transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-10 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-48 md:w-64 h-48 md:h-64 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 w-full">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center lg:text-left"
        >
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase"
          >
            ✨ Premium Furniture Collection 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-5"
          >
            Furnish Your <span className="text-primary">Dream</span> Home
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0"
          >
            Explore handcrafted sofas, solid wood dining tables, ergonomic office chairs, and modern lighting designed to elevate your lifestyle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3"
          >
            <Link to="/shop" className="btn-primary text-sm sm:text-base px-7 py-3.5 rounded-lg shadow-lg shadow-primary/30 justify-center">
              Shop Collections
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/about" className="btn-outline text-sm sm:text-base px-7 py-3.5 rounded-lg justify-center">
              Our Craftsmanship
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center lg:justify-start gap-6 sm:gap-10 mt-10"
          >
            {[
              { num: '15K+', label: 'Happy Homes' },
              { num: '500+', label: 'Original Designs' },
              { num: '100%', label: 'Solid Wood Certified' },
            ].map(stat => (
              <div key={stat.label} className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary font-display">{stat.num}</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right image — hidden on very small, shown from md up */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="absolute -top-6 -right-6 w-52 lg:w-72 h-52 lg:h-72 bg-primary/10 rounded-full -z-10" />
          <div className="absolute -bottom-6 -left-6 w-36 lg:w-48 h-36 lg:h-48 bg-accent/10 rounded-full -z-10" />

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
              alt="Premium Living Room Velvet Sofa"
              className="w-full h-[380px] lg:h-[520px] object-cover"
            />
            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-5 left-5 bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-xl border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-xl">🛋️</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Luxury Velvet Sofa</p>
                  <p className="text-primary font-semibold text-xs sm:text-sm">₹24,999</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
