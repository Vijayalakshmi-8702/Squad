import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WeHelp() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#f0f7f2] to-[#e8f4eb] dark:from-slate-900 dark:to-slate-800 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80"
              alt="Beautiful living room"
              className="w-full h-[500px] object-cover"
            />
          </div>
          {/* Experience badge */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-6 -right-6 bg-primary text-white w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white dark:border-slate-800"
          >
            <span className="text-3xl font-bold font-display">15+</span>
            <span className="text-xs text-center leading-tight px-2">Years Experience</span>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-subtitle dark:text-primary-light">We Help</span>
          <h2 className="section-title dark:text-white">We Help You Make Modern Interior Design</h2>
          <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
            Our team of expert interior designers and furniture specialists is dedicated to helping 
            you create the home of your dreams. From consultation to delivery, we're with you every step of the way.
          </p>
          <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
            Whether you're furnishing a single room or your entire home, our curated collections 
            and personalized service make the process effortless and enjoyable.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mb-10 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-700">
            {[
              { num: '12,000+', label: 'Happy Customers' },
              { num: '500+', label: 'Products' },
              { num: '4.9/5', label: 'Average Rating' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary font-display">{s.num}</div>
                <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <Link to="/services" className="btn-primary text-base px-8 py-4 rounded-lg">
            Our Services
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
