import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    const queryId = orderId.trim();
    if (!queryId) return;

    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      // Fetch live orders from backend
      const response = await fetch('http://localhost:5000/api/orders');
      if (response.ok) {
        const allOrders = await response.json();
        const found = allOrders.find(o => o.orderId === queryId || o.id?.toString() === queryId);
        
        if (found) {
          setOrder(found);
          setLoading(false);
          return;
        }
      }
      
      // Local fallback search
      const localOrders = JSON.parse(localStorage.getItem('fundamental_all_orders') || '[]');
      const foundLocal = localOrders.find(o => o.orderId === queryId || o.id?.toString() === queryId);
      if (foundLocal) {
        setOrder(foundLocal);
      } else {
        setError('Order not found. Please check your Order ID and try again.');
      }
    } catch (err) {
      // Local fallback on network error
      const localOrders = JSON.parse(localStorage.getItem('fundamental_all_orders') || '[]');
      const foundLocal = localOrders.find(o => o.orderId === queryId || o.id?.toString() === queryId);
      if (foundLocal) {
        setOrder(foundLocal);
      } else {
        setError('Order not found. Please check your Order ID and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <PageBanner 
        title="Track Your Order" 
        subtitle="Check the real-time status of your international shipment" 
        breadcrumbs={['Home', 'Track Order']}
      />

      <section className="py-20 bg-gray-50 dark:bg-slate-900 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-slate-700"
          >
            <div className="text-center mb-10">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Your Package</h2>
              <p className="text-gray-500 dark:text-slate-400">Enter your order ID below to see its journey from USA to your doorstep.</p>
            </div>

            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-8">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-123456)" 
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-primary dark:text-white"
              />
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary rounded-2xl px-10 py-4 font-bold text-lg disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Track Now'}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center font-medium mb-6"
                >
                  {error}
                </motion.div>
              )}

              {order && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end border-b border-gray-100 dark:border-slate-700 pb-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <h4 className="text-2xl font-bold text-primary">{order.status}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="font-bold text-gray-900 dark:text-white">{order.orderId}</p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="space-y-6 pt-4">
                    {order.tracking?.map((step, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        {/* Line */}
                        {i < order.tracking.length - 1 && (
                          <div className={`absolute left-3.5 top-8 w-0.5 h-12 ${step.completed ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`} />
                        )}
                        
                        {/* Dot */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.completed ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-400'}`}>
                          {step.completed ? '✓' : i + 1}
                        </div>

                        <div>
                          <h5 className={`font-bold ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                            {step.status}
                          </h5>
                          <div className="flex gap-3 text-sm mt-1">
                            <span className="text-primary font-medium">{step.location}</span>
                            <span className="text-gray-400">{step.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 mt-8">
                    <h5 className="font-bold text-gray-900 dark:text-white mb-2">Shipping Details</h5>
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                      {order.customer}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.zip}<br />
                      {order.shippingAddress.type} Address
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!order && !loading && !error && (
              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-dashed border-gray-200 dark:border-slate-700">
                  <div className="text-2xl mb-2">🚚</div>
                  <h6 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Live Updates</h6>
                  <p className="text-xs text-gray-500">Real-time GPS tracking from US port to India.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-dashed border-gray-200 dark:border-slate-700">
                  <div className="text-2xl mb-2">⚡</div>
                  <h6 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Fast Delivery</h6>
                  <p className="text-xs text-gray-500">7-10 business days for international shipping.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
