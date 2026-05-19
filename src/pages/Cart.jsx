import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageBanner from '../components/PageBanner';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (cart.length === 0) return (
    <main>
      <PageBanner title="Shopping Cart" breadcrumbs={['Home', 'Cart']} />
      <section className="py-20 bg-gray-50 min-h-[50vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any products yet.</p>
          <Link to="/shop" className="btn-primary rounded-lg px-10 py-4">
            Start Shopping
          </Link>
        </motion.div>
      </section>
    </main>
  );

  const shipping = totalPrice > 5000 ? 0 : 499;
  const tax = totalPrice * 0.18; // GST 18%
  const orderTotal = totalPrice + shipping + tax;

  return (
    <main>
      <PageBanner title={`Shopping Cart (${totalItems})`} breadcrumbs={['Home', 'Cart']} />

      <section className="py-12 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 flex gap-5 items-center transition-colors"
                  >
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-400 dark:text-slate-500 capitalize mb-2">{item.category}</p>
                      <p className="text-primary font-bold text-lg">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-bold text-gray-600 dark:text-slate-400 text-sm"
                        >−</button>
                        <span className="px-4 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-bold text-gray-600 dark:text-slate-400 text-sm"
                        >+</button>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors text-xs flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link to="/shop" className="flex items-center gap-2 text-primary font-medium hover:underline text-sm pt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 sticky top-24 transition-colors">
                <h2 className="font-bold text-gray-900 dark:text-white text-xl mb-6">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'dark:text-white'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">GST (18%)</span>
                    <span className="font-semibold dark:text-white">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  {shipping === 0 && (
                    <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                      🎉 You qualify for free shipping!
                    </div>
                  )}
                  {shipping > 0 && (
                    <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg">
                      Add ₹{(5000 - totalPrice).toLocaleString('en-IN')} more for free shipping
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="dark:text-white">Total</span>
                    <span className="text-primary">₹{orderTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-5">
                  <input type="text" placeholder="Promo code" className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:bg-slate-900 dark:text-white" />
                  <button className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">Apply</button>
                </div>

                <Link to="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary py-4 rounded-xl justify-center text-base"
                  >
                    Proceed to Checkout
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.button>
                </Link>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <span>🔒</span>
                  <span>Secure & Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
