import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';

export default function Profile() {
  const { user, orders, addresses, updateAddress, removeAddress, addAddress, logout, updateProfileName } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const tabs = [
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (editingAddress) {
      updateAddress(editingAddress.id, data);
    } else {
      addAddress(data);
    }
    
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateMessage('');
    const result = await updateProfileName(newName);
    setIsUpdating(false);
    
    if (result.success) {
      setUpdateMessage('Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } else {
      setUpdateMessage(result.error || 'Failed to update profile');
    }
  };

  return (
    <main>
      <PageBanner title="User Profile" subtitle={`Welcome back, ${user?.name}`} breadcrumbs={['Home', 'Profile']} />

      <section className="py-12 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 sticky top-24">
                <div className="text-center mb-8">
                  <img src={user?.avatar} alt={user?.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/20" />
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white">{user?.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
                </div>
                
                <nav className="space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4"
                  >
                    <span>🚪</span> Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700"
                >
                  {activeTab === 'orders' && (
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Order History</h3>
                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🛒</div>
                          <p className="text-gray-500 dark:text-slate-400">You haven't placed any orders yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map(order => (
                            <div key={order.id} className="border border-gray-100 dark:border-slate-700 rounded-2xl p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order ID: #{order.id}</p>
                                  <p className="font-bold text-gray-900 dark:text-white">Placed on {order.date}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                                    {order.status || 'Delivered'}
                                  </span>
                                  {order.tracking && (
                                    <button 
                                      onClick={() => setSelectedOrder(order)}
                                      className="text-primary text-xs font-bold hover:underline"
                                    >
                                      Track Order 🚚
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-4 overflow-x-auto pb-2">
                                {order.items.map(item => (
                                  <img key={item.id} src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-slate-700" />
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700 flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{order.items.length} items</p>
                                <p className="font-bold text-primary">₹{order.total.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'addresses' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-2xl text-gray-900 dark:text-white">Saved Addresses</h3>
                        <button 
                          onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                          className="btn-primary py-2 px-4 rounded-xl text-sm"
                        >
                          + Add New
                        </button>
                      </div>

                      {showAddressForm ? (
                        <motion.form 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          onSubmit={handleSaveAddress} 
                          className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-slate-700"
                        >
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                            {editingAddress ? 'Edit Address' : 'New Address'}
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Label (e.g. Home, Office)</label>
                              <input name="type" defaultValue={editingAddress?.type} required className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Street Address</label>
                              <input name="address" defaultValue={editingAddress?.address} required className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                              <input name="city" defaultValue={editingAddress?.city} required className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">ZIP Code</label>
                              <input name="zip" defaultValue={editingAddress?.zip} required className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white" />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-6">
                            <button type="submit" className="btn-primary py-2 px-6 rounded-xl text-sm">Save Address</button>
                            <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline py-2 px-6 rounded-xl text-sm">Cancel</button>
                          </div>
                        </motion.form>
                      ) : null}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div key={addr.id} className="border border-gray-100 dark:border-slate-700 rounded-2xl p-6 relative group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{addr.type}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditAddress(addr)} className="text-gray-400 hover:text-primary transition-colors">✏️</button>
                                <button onClick={() => removeAddress(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                              </div>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium mb-1">{addr.address}</p>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Account Settings</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Display Name</label>
                            <input 
                              type="text" 
                              value={newName} 
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:bg-slate-900 dark:text-white" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input type="email" value={user?.email} disabled className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:bg-slate-900 dark:text-gray-400 opacity-70 cursor-not-allowed" />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                          </div>
                        </div>
                        
                        {updateMessage && (
                          <div className={`p-3 rounded-xl text-sm font-medium ${updateMessage.includes('successfully') ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {updateMessage}
                          </div>
                        )}
                        
                        <button 
                          onClick={handleUpdateProfile}
                          disabled={isUpdating || !newName.trim() || newName === user?.name}
                          className="btn-primary py-3 px-8 rounded-xl disabled:opacity-50"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Order Tracking - #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">×</button>
              </div>
              <div className="p-8">
                <div className="relative space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-slate-700" />
                  
                  {selectedOrder.tracking.map((stage, i) => (
                    <div key={i} className="relative flex gap-8">
                      <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm ${i <= selectedOrder.currentStage ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-400'}`}>
                        {i <= selectedOrder.currentStage ? '✓' : i + 1}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm mb-1 ${i <= selectedOrder.currentStage ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                          {stage.status}
                        </h4>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-primary font-medium">{stage.location}</p>
                          <p className="text-[10px] text-gray-400">{stage.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                  <div className="flex gap-4 items-center">
                    <div className="text-3xl">🇺🇸 ➔ 🇮🇳</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">International Shipping</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Your order is being shipped from our US hub in California to your address in India.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
