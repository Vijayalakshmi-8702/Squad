import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-slate-950 text-gray-300 dark:text-slate-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          
          {/* Brand — full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 bg-white/10 group-hover:bg-accent rounded-xl flex items-center justify-center transition-all duration-300 border border-white/20">
                <span className="text-white font-bold text-lg">🛋️</span>
              </div>
              <span className="text-white font-display font-bold text-xl tracking-tighter">Furni<span className="text-accent">Shopsy</span></span>
            </Link>
            <p className="text-sm text-gray-400 dark:text-slate-500 leading-relaxed mb-5 max-w-xs">
              Your premier destination for high-quality furniture, ergonomic office setups, and modern home decor carefully curated to elevate your living spaces.
            </p>
            <div className="flex gap-3">
              {['F', 'T', 'I', 'P'].map((s, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 bg-gray-700 dark:bg-slate-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-xs font-bold text-white">{s}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm md:text-base mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Shop', to: '/shop' },
                { label: 'About Us', to: '/about' },
                { label: 'Services', to: '/services' },
                { label: 'Blog', to: '/blog' },
                { label: 'Contact', to: '/contact' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-1.5 group">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full group-hover:bg-accent transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm md:text-base mb-4 uppercase tracking-wide">Support</h3>
            <ul className="space-y-2">
              {['FAQ', 'Shipping Policy', 'Returns & Refunds', 'Order Tracking', 'Size Guide', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-1.5 group">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full group-hover:bg-accent transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold text-sm md:text-base mb-4 uppercase tracking-wide">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to get the latest updates, deals and offers.</p>
            <form onSubmit={e => e.preventDefault()} className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Subscribe
              </motion.button>
            </form>
            {/* Contact info */}
            <div className="mt-5 space-y-2">
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-primary mt-0.5">📍</span>
                123 Furniture Hub Road, Sector 62, Noida, UP 201301
              </p>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-primary">📞</span>
                +91 120 4321 0987
              </p>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-primary">✉️</span>
                support@furnishopsy.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FurniShopsy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-accent transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
