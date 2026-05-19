import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import TrackOrder from './pages/TrackOrder';
import CategoryLayout from './pages/CategoryLayout';
import CategoryShop from './pages/CategoryShop';
import CategoryServices from './pages/CategoryServices';
import CategoryContact from './pages/CategoryContact';
import Wishlist from './pages/Wishlist';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/shop" element={<ProtectedRoute><PageWrapper><Shop /></PageWrapper></ProtectedRoute>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
        <Route path="/blog/:id" element={<PageWrapper><BlogDetail /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/checkout" element={<ProtectedRoute><PageWrapper><Checkout /></PageWrapper></ProtectedRoute>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/wishlist" element={<ProtectedRoute><PageWrapper><Wishlist /></PageWrapper></ProtectedRoute>} />
        <Route path="/track-order" element={<PageWrapper><TrackOrder /></PageWrapper>} />
        
        {/* Dynamic Category Routes */}
        <Route path="/category/:type" element={<PageWrapper><CategoryLayout /></PageWrapper>}>
          <Route index element={<CategoryShop />} />
          <Route path="shop" element={<CategoryShop />} />
          <Route path="services" element={<CategoryServices />} />
          <Route path="contact" element={<CategoryContact />} />
        </Route>

        <Route path="*" element={
          <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 dark:bg-slate-900">
              <div className="text-8xl mb-6">🛋️</div>
              <h1 className="font-display text-5xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <p className="text-xl text-gray-500 dark:text-slate-400 mb-8">Oops! This page doesn't exist.</p>
              <Link to="/" className="btn-primary rounded-lg px-8 py-3.5">Go Home</Link>
            </div>
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <BrowserRouter>
            <CartProvider>
              <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
                <Navbar />
                <div className="flex-1">
                  <AppRoutes />
                </div>
                <Footer />
              </div>
            </CartProvider>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
