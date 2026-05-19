import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || '';
  });

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Fetch initial profile-related metadata from MERN backend if token exists
  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setOrders([]);
      setAddresses([]);
      setWishlist([]);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      // 1. Fetch addresses
      const addrRes = await fetch('http://localhost:5000/api/user/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData);
      }

      // 2. Fetch orders
      const orderRes = await fetch('http://localhost:5000/api/orders');
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        // Filter orders for this customer (email check)
        const myOrders = orderData.filter(o => o.customer === user?.name || o.customerEmail === user?.email);
        setOrders(myOrders);
      }

      // 3. Fetch wishlist
      const wishRes = await fetch('http://localhost:5000/api/user/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wishRes.ok) {
        const wishData = await wishRes.json();
        setWishlist(wishData);
      }
    } catch (err) {
      console.warn('Backend sync failed, using localStorage fallbacks:', err);
      // Load fallback data from localStorage
      setAddresses(JSON.parse(localStorage.getItem('addresses') || '[]'));
      setOrders(JSON.parse(localStorage.getItem('orders') || '[]'));
      setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync state helpers
  const saveAddressesToBackend = async (newAddresses) => {
    setAddresses(newAddresses);
    localStorage.setItem('addresses', JSON.stringify(newAddresses));
    if (token) {
      try {
        await fetch('http://localhost:5000/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ addresses: newAddresses })
        });
      } catch (err) {
        console.warn('Address sync error:', err);
      }
    }
  };

  const login = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Login failed');
      }
      const data = await response.json();
      setUser(data);
      setToken(data.token);
      return { success: true };
    } catch (error) {
      console.warn('MERN login failed, trying local storage user fallback:', error);
      
      const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const foundUser = storedUsers.find(u => 
        (u.email === userData.identifier || u.mobile === userData.identifier) && 
        u.password === userData.password
      );
      
      if (foundUser) {
        const userToSet = { ...foundUser };
        delete userToSet.password;
        setUser(userToSet);
        setToken('mock-jwt-token-1234');
        return { success: true };
      } else {
        return { success: false, error: error.message || 'Invalid credentials' };
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Registration failed');
      }
      const data = await response.json();
      setUser(data);
      setToken(data.token);
      return { success: true };
    } catch (error) {
      console.warn('MERN registration failed, falling back to local simulation:', error);
      
      const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      if (storedUsers.some(u => u.email === userData.email || (userData.mobile && u.mobile === userData.mobile))) {
        return { success: false, error: 'An account with this email/mobile already exists.' };
      }
      
      const newUser = {
        id: 'mock-id-' + Date.now(),
        name: userData.name || 'New User',
        email: userData.email,
        mobile: userData.mobile || '',
        password: userData.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${(userData.name || 'NewUser').replace(/\s+/g, '')}`
      };
      
      localStorage.setItem('mockUsers', JSON.stringify([...storedUsers, newUser]));
      const userToSet = { ...newUser };
      delete userToSet.password;
      setUser(userToSet);
      setToken('mock-jwt-token-1234');
      
      return { success: true };
    }
  };

  const updateProfileName = async (newName) => {
    try {
      if (!token) return { success: false, error: 'User not logged in' };
      
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  const addOrder = async (order) => {
    const trackingStages = [
      { status: 'Order Placed', date: new Date().toLocaleDateString(), completed: true, location: 'Local Store' },
      { status: 'Processing', date: 'Processing', completed: false, location: 'Warehouse Hub' },
      { status: 'Shipped from USA', date: 'Pending', completed: false, location: 'Origin Facility' },
      { status: 'Arrived in Destination Country', date: 'Pending', completed: false, location: 'Customs Office' },
      { status: 'Out for Delivery', date: 'Pending', completed: false, location: 'Local Hub' },
      { status: 'Delivered', date: 'Pending', completed: false, location: 'Shipping Address' },
    ];

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = { 
      ...order, 
      id: Date.now(), 
      orderId,
      date: new Date().toLocaleDateString(),
      tracking: trackingStages,
      currentStage: 0,
      customer: user?.name || 'Guest',
      customerEmail: user?.email || 'guest@furnishopsy.com'
    };

    setOrders(prev => [newOrder, ...prev]);
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([newOrder, ...localOrders]));

    // Sync to backend database
    try {
      await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (error) {
      console.warn('Backend order sync failed, falling back to local simulation', error);
    }
  };

  const addAddress = (newAddress) => {
    const updated = [...addresses, { ...newAddress, id: Date.now().toString() }];
    saveAddressesToBackend(updated);
  };

  const updateAddress = (id, updatedAddress) => {
    const updated = addresses.map(addr => addr.id === id || addr._id === id ? { ...addr, ...updatedAddress } : addr);
    saveAddressesToBackend(updated);
  };

  const removeAddress = (id) => {
    const updated = addresses.filter(addr => addr.id !== id && addr._id !== id);
    saveAddressesToBackend(updated);
  };

  const toggleWishlist = async (productId) => {
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));

    if (token) {
      try {
        await fetch('http://localhost:5000/api/user/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ wishlist: updated })
        });
      } catch (err) {
        console.warn('Wishlist sync error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, register, logout, updateProfileName,
      orders, addOrder, 
      addresses, addAddress, updateAddress, removeAddress,
      wishlist, toggleWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
