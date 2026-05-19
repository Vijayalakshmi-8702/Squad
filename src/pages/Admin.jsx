import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders', 'products', 'coupons', 'users'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'sofa',
    price: '',
    originalPrice: '',
    image: '',
    badge: '',
    description: '',
    stock: 20
  });
  const [productSuccess, setProductSuccess] = useState('');
  const [productError, setProductError] = useState('');

  // Add Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');

  const adminToken = localStorage.getItem('token') || localStorage.getItem('admin_token');

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = () => {
    fetchOrders();
    fetchProducts();
    fetchCoupons();
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        const backendUsers = await response.json();
        setRegisteredUsers(backendUsers);
      } else {
        const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        setRegisteredUsers(storedUsers);
      }
    } catch (err) {
      console.warn('Error loading backend users, loading local mockUsers:', err);
      const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      setRegisteredUsers(storedUsers);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        loadLocalStorageOrders();
      }
    } catch (err) {
      console.warn('Network issue loading backend orders, falling back to localStorage');
      loadLocalStorageOrders();
    }
  };

  const loadLocalStorageOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('fundamental_all_orders') || '[]');
    setOrders(allOrders);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        // Mock coupon fallback
        setCoupons([
          { _id: '1', code: 'FURNI20', discountType: 'percentage', discountValue: 20, isActive: true, expiryDate: '2026-12-31' },
          { _id: '2', code: 'WELCOME500', discountType: 'fixed', discountValue: 500, isActive: true, expiryDate: '2026-12-31' }
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch coupons, loaded static defaults');
      setCoupons([
        { _id: '1', code: 'FURNI20', discountType: 'percentage', discountValue: 20, isActive: true, expiryDate: '2026-12-31' },
        { _id: '2', code: 'WELCOME500', discountType: 'fixed', discountValue: 500, isActive: true, expiryDate: '2026-12-31' }
      ]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hit real auth/login endpoint first
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      if (response.ok && (data.role === 'admin' || data.email === 'admin@furnishopsy.com')) {
        setIsLoggedIn(true);
        localStorage.setItem('admin_session', 'active');
        localStorage.setItem('admin_token', data.token || 'mock-admin-token');
        localStorage.setItem('token', data.token || 'mock-admin-token');
        localStorage.setItem('user', JSON.stringify(data));
        
        // Timeout wait to allow token setting
        setTimeout(() => {
          fetchDashboardData();
        }, 100);
      } else if (!response.ok) {
        // Fallback for offline mode or mock login bypass
        if (credentials.email === 'admin@furnishopsy.com' && credentials.password === 'vijay123') {
          setIsLoggedIn(true);
          localStorage.setItem('admin_session', 'active');
          localStorage.setItem('admin_token', 'mock-admin-token');
          fetchDashboardData();
        } else {
          setError(data.message || 'Invalid credentials or access role denied.');
        }
      } else {
        setError('Access denied: You do not possess administrator rights.');
      }
    } catch (err) {
      // Local network bypass fallback
      if (credentials.email === 'admin@furnishopsy.com' && credentials.password === 'vijay123') {
        setIsLoggedIn(true);
        localStorage.setItem('admin_session', 'active');
        localStorage.setItem('admin_token', 'mock-admin-token');
        fetchDashboardData();
      } else {
        setError('Server network error. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  // Toggle Stock level (In stock vs out of stock)
  const toggleStockStatus = async (productId, currentStockStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          inStock: !currentStockStatus
        })
      });
      if (response.ok) {
        fetchProducts();
      } else {
        // Local state toggle update if offline
        setProducts(prev => prev.map(p => {
          if (p._id === productId || p.id === productId) {
            return { ...p, inStock: !currentStockStatus };
          }
          return p;
        }));
      }
    } catch (err) {
      console.warn('Offline mode: updated stock locally');
      setProducts(prev => prev.map(p => {
        if (p._id === productId || p.id === productId) {
          return { ...p, inStock: !currentStockStatus };
        }
        return p;
      }));
    }
  };

  // Update order stage & status
  const handleUpdateStatus = async (orderId, newStatus) => {
    const stageMap = {
      'Processing': 1,
      'Shipped': 2,
      'Out for Delivery': 4,
      'Delivered': 5
    };
    const stageIndex = stageMap[newStatus] || 0;
    
    const todayStr = new Date().toLocaleDateString('en-IN');
    const updatedTracking = [
      { status: 'Order Placed', date: todayStr, completed: true, location: 'FurniShopsy Warehouse Hub' },
      { status: 'Processing', date: stageIndex >= 1 ? todayStr : 'Processing', completed: stageIndex >= 1, location: 'Quality Inspection Facility' },
      { status: 'Shipped', date: stageIndex >= 2 ? todayStr : 'Pending', completed: stageIndex >= 2, location: 'Logistics Center' },
      { status: 'Out for Delivery', date: stageIndex >= 4 ? todayStr : 'Pending', completed: stageIndex >= 4, location: 'Local Delivery Station' },
      { status: 'Delivered', date: stageIndex >= 5 ? todayStr : 'Pending', completed: stageIndex >= 5, location: 'Customer Doorstep' }
    ];

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          currentStage: stageIndex,
          tracking: updatedTracking
        })
      });

      if (response.ok) {
        fetchOrders();
      } else {
        // Fallback for LocalStorage orders
        const localOrders = JSON.parse(localStorage.getItem('fundamental_all_orders') || '[]');
        const updatedLocal = localOrders.map(o => {
          if (o.orderId === orderId || o.id === orderId) {
            o.status = newStatus;
            o.currentStage = stageIndex;
            o.tracking = updatedTracking;
          }
          return o;
        });
        localStorage.setItem('fundamental_all_orders', JSON.stringify(updatedLocal));
        loadLocalStorageOrders();
      }
    } catch (err) {
      const localOrders = JSON.parse(localStorage.getItem('fundamental_all_orders') || '[]');
      const updatedLocal = localOrders.map(o => {
        if (o.orderId === orderId || o.id === orderId) {
          o.status = newStatus;
          o.currentStage = stageIndex;
          o.tracking = updatedTracking;
        }
        return o;
      });
      localStorage.setItem('fundamental_all_orders', JSON.stringify(updatedLocal));
      loadLocalStorageOrders();
    }
  };

  // Add Product to MERN database
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductSuccess('');
    setProductError('');

    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      setProductError('Please fill out Title, Price and Image URL fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : Math.round(parseFloat(newProduct.price) / 0.8),
          image: newProduct.image,
          badge: newProduct.badge || null,
          inStock: true,
          description: newProduct.description || `${newProduct.name} luxury furniture crafted for premium comfort.`
        })
      });

      if (response.ok) {
        setProductSuccess('Product registered successfully to catalog!');
        setNewProduct({
          name: '',
          category: 'sofa',
          price: '',
          originalPrice: '',
          image: '',
          badge: '',
          description: '',
          stock: 20
        });
        fetchProducts();
      } else {
        setProductError('Server authorization denied or failed to save.');
      }
    } catch (err) {
      setProductError('Could not connect to database. Switched to offline catalogue mode.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this piece from the catalog?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to remove the product.');
      }
    } catch (err) {
      alert('Connection issue: Make sure backend is running.');
    }
  };

  // Create Promo Coupon
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setCouponSuccess('');
    setCouponError('');

    if (!newCoupon.code || !newCoupon.discountValue) {
      setCouponError('Please enter coupon code and discount value.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          code: newCoupon.code.toUpperCase(),
          discountType: newCoupon.discountType,
          discountValue: parseFloat(newCoupon.discountValue),
          expiryDate: newCoupon.expiryDate,
          isActive: true
        })
      });

      if (response.ok) {
        setCouponSuccess('Promo coupon code registered successfully!');
        setNewCoupon({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        fetchCoupons();
      } else {
        setCouponError('Failed to create coupon code. Check permission role.');
      }
    } catch (err) {
      setCouponError('Offline mode coupon creation error.');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 transition-colors">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#2d5239]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">👑</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FurniShopsy Admin</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Secure entry for managers and coordinators</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Admin Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary transition-colors focus:outline-none"
                placeholder="admin@furnishopsy.com"
                value={credentials.email}
                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Secure Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary transition-colors focus:outline-none font-mono"
                placeholder="••••••••"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold ml-1">⚠️ {error}</p>}
            <button 
              disabled={loading} 
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 mt-4 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Enter Manager Dashboard'}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-44 md:pt-36 pb-20 bg-gray-55 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">FurniShopsy Dashboard</h1>
            <p className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">Luxury Showroom Management Console</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDashboardData} 
              className="btn-outline px-5 py-2.5 rounded-xl text-xs font-bold dark:text-white dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              🔄 Refresh Dashboard
            </button>
            <button onClick={handleLogout} className="bg-red-650 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer uppercase tracking-wider">
              Logout
            </button>
          </div>
        </div>

        {/* Analytics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Showroom Bookings', value: orders.length, icon: '🛋️', color: 'bg-emerald-500/10 text-emerald-600' },
            { label: 'Gross Revenue', value: `₹${orders.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-[#ab8100]/10 text-[#ab8100]' },
            { label: 'Active Shipments', value: orders.filter(o => o.status !== 'Delivered').length, icon: '🚚', color: 'bg-amber-500/10 text-amber-600' },
            { label: 'VIP Accounts', value: registeredUsers.length, icon: '👥', color: 'bg-green-500/10 text-green-600' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-[9px] font-bold bg-[#2d5239]/10 text-primary dark:text-primary-light px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
              </div>
              <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-display">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 dark:border-slate-800 mb-8 pb-px">
          {[
            { id: 'orders', label: '📦 Shipments', count: orders.length },
            { id: 'products', label: '🗂️ Catalog', count: products.length },
            { id: 'coupons', label: '🎫 Promo Coupons', count: coupons.length },
            { id: 'users', label: '👥 User Accounts', count: registeredUsers.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label} <span className="text-[10px] bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Orders and Shipments */}
        {activeSubTab === 'orders' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Orders & Dispatch</h2>
              <p className="text-[10px] text-gray-450 mt-0.5 font-semibold">Change status dropdown selections to automatically send live tracking coordinates to client profiles.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bill Total</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Stages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700 text-xs">
                  {orders.map((order) => (
                    <tr key={order.orderId || order.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-primary dark:text-cyan-400 select-all">#{order.orderId || order.id.toString().slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-white block">{order.customer}</span>
                        <span className="text-[10px] text-gray-450 block truncate max-w-[150px]">{order.shippingAddress || 'No target address'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{order.date || 'Today'}</td>
                      <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-white uppercase tracking-wider text-[10px]">{order.paymentMethod || 'Razorpay Online'}</span>
                          <span className="text-[9px] text-gray-400 font-mono select-all truncate max-w-[100px]">{order.transactionId || 'No txn'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold uppercase rounded px-2 py-0.5 border ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status || 'Processing'}
                          onChange={(e) => handleUpdateStatus(order.orderId || order.id, e.target.value)}
                          className="text-[10px] font-bold uppercase rounded-xl px-2 py-1.5 border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white cursor-pointer"
                        >
                          <option value="Processing">⏳ Processing</option>
                          <option value="Shipped">✈️ Shipped</option>
                          <option value="Out for Delivery">🚚 Out for Delivery</option>
                          <option value="Delivered">✅ Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-20 text-gray-400 italic text-xs">No customer orders placed yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Product Catalog */}
        {activeSubTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Catalog & Inventory</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Toggle stock status switches to instantly mark items as available or sold-out.</p>
              </div>

              <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-10">
                      <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image</th>
                      <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Furniture Item</th>
                      <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                      <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Control</th>
                      <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700 text-xs">
                    {products.map(product => (
                      <tr key={product._id || product.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-2.5">
                          <img src={product.image} alt="" className="w-9 h-9 rounded-lg object-cover border dark:border-slate-700" />
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="font-bold text-gray-900 dark:text-white block truncate max-w-[130px]" title={product.name}>{product.name}</span>
                          <span className="text-[9px] bg-[#2d5239]/10 text-primary dark:text-[#53ab6b] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5">{product.category}</span>
                        </td>
                        <td className="px-5 py-2.5 font-bold text-primary dark:text-white">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-2.5">
                          <button
                            onClick={() => toggleStockStatus(product._id || product.id, product.inStock)}
                            className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                              product.inStock 
                                ? 'bg-green-500/10 text-green-700 border border-green-500/20 hover:bg-green-500 hover:text-white' 
                                : 'bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            {product.inStock ? '🟢 In Stock' : '🔴 Sold Out'}
                          </button>
                        </td>
                        <td className="px-5 py-2.5">
                          <button 
                            onClick={() => handleDeleteProduct(product._id || product.id)}
                            className="bg-red-500/10 text-red-600 hover:bg-red-650 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Creation Form */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
              <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Publish Showroom Piece</h2>
              <p className="text-[10px] text-gray-400 mb-5">Create a luxury item entry in database catalog</p>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solid Oak Lounge Chair"
                    className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Category</label>
                    <select
                      className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none cursor-pointer"
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      <option value="sofa">🛋️ Sofa Section</option>
                      <option value="chair">🪑 Luxury Chair</option>
                      <option value="table">🪵 Wooden Table</option>
                      <option value="bed">🛏️ Designer Bed</option>
                      <option value="storage">🗄️ Storage Cabinet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Badge Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Sale, 20% Off"
                      className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none"
                      value={newProduct.badge}
                      onChange={e => setNewProduct({ ...newProduct, badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Retail Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="Price"
                      className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">M.R.P Price (₹)</label>
                    <input
                      type="number"
                      placeholder="MRP Strikeoff"
                      className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none"
                      value={newProduct.originalPrice}
                      onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Image URL Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none"
                    value={newProduct.image}
                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Description Details</label>
                  <textarea
                    placeholder="Describe craftsmanship, wood type, and dimensions..."
                    rows="3"
                    className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none resize-none"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                {productSuccess && <p className="text-green-600 font-bold text-[10px] bg-green-50 dark:bg-green-950/20 p-2.5 rounded-lg">✨ {productSuccess}</p>}
                {productError && <p className="text-red-500 font-bold text-[10px] bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg">⚠️ {productError}</p>}

                <button 
                  type="submit" 
                  className="w-full btn-primary py-3 rounded-xl font-bold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  🚀 Publish Item
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Promo Coupon Codes Management */}
        {activeSubTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Showroom Promo Coupons</h2>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Verify active discount codes applied at cart checkout screens.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coupon Code</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount Worth</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expires On</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700 text-xs">
                    {coupons.map(coupon => (
                      <tr key={coupon._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono font-extrabold text-[#2d5239] dark:text-[#53ab6b] uppercase text-xs select-all bg-[#2d5239]/10 px-2 py-0.5 rounded border border-[#2d5239]/10">{coupon.code}</span>
                        </td>
                        <td className="px-5 py-3 font-semibold uppercase text-[10px] text-gray-600 dark:text-slate-400">
                          {coupon.discountType}
                        </td>
                        <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                        </td>
                        <td className="px-5 py-3 text-gray-550">
                          {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${coupon.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {coupon.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Coupon form */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
              <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Register Promo Code</h2>
              <p className="text-[10px] text-gray-400 mb-5">Create a discount code for promotions campaigns</p>

              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FURNI30"
                    className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none uppercase font-mono"
                    value={newCoupon.code}
                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Discount Type</label>
                    <select
                      className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none cursor-pointer"
                      value={newCoupon.discountType}
                      onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Worth Value</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 20 or 500"
                      className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none"
                      value={newCoupon.discountValue}
                      onChange={e => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-gray-55 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:border-primary focus:outline-none cursor-pointer"
                    value={newCoupon.expiryDate}
                    onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  />
                </div>

                {couponSuccess && <p className="text-green-650 font-bold text-[10px] bg-green-50 dark:bg-green-950/20 p-2.5 rounded-lg">✨ {couponSuccess}</p>}
                {couponError && <p className="text-red-500 font-bold text-[10px] bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg">⚠️ {couponError}</p>}

                <button 
                  type="submit" 
                  className="w-full btn-primary py-3 rounded-xl font-bold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  🚀 Save Coupon
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Registered Users Account Manager */}
        {activeSubTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider font-sans">VIP Customer Accounts</h2>
              <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Direct access list of all registered member logins, password credentials, and join date metadata.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name & Avatar</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Contact</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Password (Bypass Hint)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                  {registeredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                        No customer accounts found in the database.
                      </td>
                    </tr>
                  ) : (
                    registeredUsers.map(usr => (
                      <tr key={usr._id || usr.email} className="hover:bg-gray-55 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={usr.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${usr.name}`} alt={usr.name} className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 object-cover" />
                            <span className="font-bold text-gray-905 dark:text-white">{usr.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-600 dark:text-slate-305">{usr.email}</td>
                        <td className="px-6 py-4 font-semibold text-gray-600 dark:text-slate-305">{usr.mobile || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-55 dark:bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-gray-550 dark:text-slate-350 select-all border border-gray-200 dark:border-slate-800">
                            {usr.password || 'vijay123 / guest123'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-[5px] text-[8px] font-extrabold uppercase tracking-widest ${usr.role === 'admin' ? 'bg-[#ab8100]/10 text-[#ab8100]' : 'bg-gray-100 text-gray-500'}`}>
                            {usr.role || 'user'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
