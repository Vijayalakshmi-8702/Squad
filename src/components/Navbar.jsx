import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';

const mainLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'All Products' },
  { to: '/track-order', label: 'Track Order' },
  { to: '/admin', label: 'Admin Panel' }
];

const categoryLinks = [
  { to: '/category/sofa/shop', label: 'Sofas', icon: '🛋️' },
  { to: '/category/chair/shop', label: 'Chairs', icon: '🪑' },
  { to: '/category/table/shop', label: 'Tables', icon: '🪵' },
  { to: '/category/bed/shop', label: 'Beds', icon: '🛏️' },
  { to: '/category/storage/shop', label: 'Storage', icon: '🗄️' },
];

const mobileIcons = {
  Home:          '🏠',
  'All Products': '🛍️',
  'Track Order':  '📦',
  'Admin Panel': '👑',
  Sofas:         '🛋️',
  Chairs:        '🪑',
  Tables:        '🪵',
  Beds:          '🛏️',
  Storage:       '🗄️',
};

const megaMenus = {
  Sofas: [
    { title: "Luxury Velvet Sofas", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", link: "/category/sofa/shop" },
    { title: "L-Shaped Sectionals", img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=80", link: "/category/sofa/shop" },
    { title: "Leather Chesterfield", img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80", link: "/category/sofa/shop" }
  ],
  Chairs: [
    { title: "Nordic Lounge Chairs", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80", link: "/category/chair/shop" },
    { title: "Ergonomic Office Chairs", img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80", link: "/category/chair/shop" },
    { title: "Rattan Armchairs", img: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80", link: "/category/chair/shop" }
  ],
  Tables: [
    { title: "Solid Oak Dining Tables", img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80", link: "/category/table/shop" },
    { title: "Walnut Coffee Tables", img: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&q=80", link: "/category/table/shop" },
    { title: "Electric Standing Desks", img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80", link: "/category/table/shop" }
  ],
  Beds: [
    { title: "King Platform Beds", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80", link: "/category/bed/shop" },
    { title: "Wooden Canopy Beds", img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=80", link: "/category/bed/shop" }
  ]
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const { totalItems } = useCart();
  const { user, logout, wishlist } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { products } = useProducts();
  const location = useLocation();
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsMoreOpen(false);
  }, [location]);

  // Check scroll positions to show/hide category navigation chevrons
  const checkScrollArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollArrows();
    window.addEventListener('resize', checkScrollArrows);
    return () => window.removeEventListener('resize', checkScrollArrows);
  }, []);

  const handleScrollClick = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollArrows, 350);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#2d5239] dark:bg-slate-900 shadow-xl' : 'bg-[#3b6b4b] dark:bg-slate-800'}`}>
      
      {/* Top bar info info banner */}
      <div className="bg-[#213e2b] dark:bg-slate-950 text-white text-xs py-1.5 hidden md:block transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Free delivery on orders above ₹5,000 | 24/7 Delivery Services: +91 98765 43210</span>
          <div className="flex gap-4">
            <span className="text-green-300 font-semibold cursor-pointer hover:underline">Download App</span>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-accent transition-colors">Support Center</a>
          </div>
        </div>
      </div>

      {/* Main Nav (Tier 1) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-white/10 dark:bg-slate-700/50 group-hover:bg-accent rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:rotate-12 border border-white/20">
              <span className="text-white font-bold text-lg">🛋️</span>
            </div>
            <span className="text-white font-display font-bold text-2xl tracking-tighter">Furni<span className="text-accent">Shopsy</span></span>
          </Link>

          {/* Primary Main Menu Links */}
          <div className="hidden md:flex items-center gap-6">
            {mainLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all duration-200 py-1.5 px-3 rounded-lg ${
                    isActive
                      ? 'text-accent bg-white/10 dark:bg-slate-700'
                      : 'text-white hover:text-accent hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="text-white hover:text-accent transition-all p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95"
              title="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Wishlist Liked count */}
            <Link to="/wishlist" className="relative text-white hover:text-accent p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all hidden sm:block" title="Liked Products">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {wishlist && wishlist.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-white hover:text-accent p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-lg"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {/* Profile / Account details */}
            {user ? (
              <div className="hidden md:flex items-center gap-3 border-l border-white/20 pl-3 ml-1">
                <Link to="/profile" className="flex items-center gap-2 group bg-white/10 hover:bg-white/20 pl-2 pr-3 py-1 rounded-xl transition-all">
                  <img src={user.avatar} alt="" className="w-7 h-7 rounded-full border border-white/20 object-cover" />
                  <span className="text-white text-xs font-semibold max-w-[80px] truncate group-hover:text-accent transition-colors">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="text-white/70 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-wider">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block bg-accent hover:bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 ml-1">
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white hover:text-accent transition-colors p-2 rounded-xl bg-white/10"
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Bar (Tier 2) with Horizontal Scroll & Chevron Overlays */}
      <div className="border-t border-white/10 bg-[#2d5239]/90 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-md transition-colors relative py-2 px-1 hidden md:block">
        <div className="max-w-7xl mx-auto px-10 relative flex items-center">
          
          {/* Left scroll chevron */}
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleScrollClick('left')}
                className="absolute left-1 z-20 w-8 h-8 rounded-full bg-accent dark:bg-slate-700 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-yellow-500 active:scale-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Left transparent gradient overlay */}
          <div className="absolute left-9 top-0 bottom-0 w-8 bg-gradient-to-r from-[#2d5239] dark:from-slate-900 to-transparent pointer-events-none z-10" />

          {/* Horizontally scrolling list of categories */}
          <div
            ref={scrollRef}
            onScroll={checkScrollArrows}
            className="flex items-center gap-3 overflow-x-auto scrollbar-hide w-full py-1"
          >
            {categoryLinks.map(link => {
              const hasMegaMenu = megaMenus[link.label];
              return (
                <div key={link.to} className="relative flex-shrink-0 group/item">
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-accent text-white shadow-md'
                          : 'bg-white/10 dark:bg-slate-800 text-white hover:bg-white/20'
                      }`
                    }
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    {hasMegaMenu && (
                      <svg className="w-3 h-3 text-white/70 transition-transform duration-300 group-hover/item:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </NavLink>

                  {/* Mega Menu Dropdown */}
                  {hasMegaMenu && (
                    <div className="absolute top-full left-0 mt-2 w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 p-4 z-50">
                      <div className="grid grid-cols-3 gap-3">
                        {megaMenus[link.label].map((item, idx) => (
                          <Link key={idx} to={item.link} className="group/sub relative overflow-hidden rounded-xl aspect-[4/3] block border dark:border-slate-700">
                            <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/sub:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                              <span className="text-[10px] text-white font-bold tracking-tight">{item.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-700 text-center">
                        <Link to={link.to} className="text-primary font-bold text-xs hover:text-accent transition-colors flex items-center justify-center gap-1">
                          Browse all {link.label} items →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right transparent gradient overlay */}
          <div className="absolute right-9 top-0 bottom-0 w-8 bg-gradient-to-l from-[#2d5239] dark:from-slate-900 to-transparent pointer-events-none z-10" />

          {/* Right scroll chevron */}
          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleScrollClick('right')}
                className="absolute right-1 z-20 w-8 h-8 rounded-full bg-accent dark:bg-slate-700 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-yellow-500 active:scale-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* More Dropdown Button (...) */}
          <div className="relative pl-3 ml-2 border-l border-white/20">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`p-1.5 rounded-full text-white bg-white/10 hover:bg-white/20 transition-all font-bold text-xs ${isMoreOpen ? 'bg-accent text-white' : ''}`}
              title="More Categories"
            >
              ⚙️
            </button>
            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xl p-2 z-50"
                >
                  <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider p-2">Delivery Channels</p>
                  <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />
                  {categoryLinks.slice(3).map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-300 rounded-lg transition-colors"
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Side Menu overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#2d5239] dark:bg-slate-900 border-t border-green-700 dark:border-slate-800 overflow-hidden transition-colors"
          >
            <div className="px-4 py-4 flex flex-col gap-1.5 max-h-[85vh] overflow-y-auto">

              {/* User profile strip */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-white/10 rounded-xl">
                  <img src={user.avatar} alt="" className="w-9 h-9 rounded-full border border-white/30" />
                  <div>
                    <p className="text-white text-sm font-bold">{user.name}</p>
                    <p className="text-green-300 text-xs">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Core Links */}
              <p className="text-[10px] font-extrabold uppercase text-green-300 tracking-widest px-3 mb-1">Explore Menu</p>
              {mainLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'bg-white/20 text-accent' : 'text-white hover:bg-white/10'
                    }`
                  }
                >
                  <span className="text-base w-6 text-center">{mobileIcons[link.label]}</span>
                  {link.label}
                </NavLink>
              ))}

              {/* Category Links */}
              <div className="my-2 border-t border-green-700/50" />
              <p className="text-[10px] font-extrabold uppercase text-green-300 tracking-widest px-3 mb-1">Shopping Departments</p>
              {categoryLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'bg-white/20 text-accent' : 'text-white hover:bg-white/10'
                    }`
                  }
                >
                  <span className="text-base w-6 text-center">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}

              {/* Drawer Foot Actions */}
              <div className="my-2 border-t border-green-700/50" />
              <div className="flex gap-2 pt-2">
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  Cart ({totalItems})
                </Link>
                {user ? (
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex-1 bg-red-500/80 hover:bg-red-500 text-white py-3 rounded-xl text-xs font-bold transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-accent hover:bg-yellow-500 text-white py-3 rounded-xl text-xs font-bold transition-colors text-center shadow-md"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
