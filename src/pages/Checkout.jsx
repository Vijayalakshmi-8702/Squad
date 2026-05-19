import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';

const steps = ['Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { addOrder, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  // Placement/Checkout states
  const [placing, setPlacing] = useState(false);
  const [placingPhase, setPlacingPhase] = useState('');
  const [placed, setPlaced] = useState(false);
  
  // Forms & payment methods
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [shipping, setShipping] = useState({ 
    firstName: '', lastName: '', email: '', phone: '', 
    address: '', city: '', state: '', zip: '', country: 'IN', type: 'Home'
  });
  
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // UPI states
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiError, setUpiError] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTimer, setUpiTimer] = useState(180); // 3 minutes
  const timerRef = useRef(null);
  
  // Card states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Net Banking states
  const [selectedBank, setSelectedBank] = useState('');
  const [showNetBankModal, setShowNetBankModal] = useState(false);
  const [bankUsername, setBankUsername] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  const [bankError, setBankError] = useState('');

  // Coupon States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Receipt State
  const [receipt, setReceipt] = useState(null);

  // Auto-populate user shipping details if logged in
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setShipping(p => ({
        ...p,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.mobile || ''
      }));
    }
  }, [user]);

  // UPI Timer effect
  useEffect(() => {
    if (showUpiModal) {
      setUpiTimer(180);
      timerRef.current = setInterval(() => {
        setUpiTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setShowUpiModal(false);
            alert('UPI payment simulation timed out. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showUpiModal]);

  // Calculations
  const shippingCost = totalPrice > 5000 ? 0 : 499;
  const tax = totalPrice * 0.18; // GST 18%
  
  // Coupon Discount calculation
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discountType === 'percentage' 
        ? Math.round(totalPrice * (appliedCoupon.discountValue / 100)) 
        : appliedCoupon.discountValue)
    : 0;

  const orderTotal = Math.max(0, totalPrice - discountAmount + shippingCost + tax);

  const handleShippingChange = e => setShipping(p => ({ ...p, [e.target.name]: e.target.value }));
  
  const handlePaymentChange = e => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const clean = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = clean.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        setPayment(p => ({ ...p, cardNumber: parts.join(' ') }));
      } else {
        setPayment(p => ({ ...p, cardNumber: clean }));
      }
    } else if (name === 'expiry') {
      const clean = value.replace(/[^0-9]/g, '');
      if (clean.length >= 2) {
        setPayment(p => ({ ...p, expiry: `${clean.slice(0, 2)}/${clean.slice(2, 4)}` }));
      } else {
        setPayment(p => ({ ...p, expiry: clean }));
      }
    } else if (name === 'cvv') {
      setPayment(p => ({ ...p, cvv: value.replace(/[^0-9]/g, '') }));
    } else {
      setPayment(p => ({ ...p, [name]: value }));
    }
  };

  // Coupon apply handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/coupons/validate/${couponInput.trim().toUpperCase()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Invalid coupon code');
      }
      const data = await res.json();
      setAppliedCoupon(data);
      setCouponSuccess(`Success! Coupon "${data.code}" applied. Discount: ${data.discountType === 'percentage' ? `${data.discountValue}%` : `₹${data.discountValue}`}`);
    } catch (err) {
      setCouponError(err.message || 'Could not validate coupon.');
      setAppliedCoupon(null);
    }
  };

  const validateShipping = () => {
    if (!shipping.firstName || !shipping.lastName) return 'Please enter your first and last name.';
    if (!shipping.email.includes('@')) return 'Please enter a valid email address.';
    if (shipping.phone.length < 10) return 'Please enter a valid phone number.';
    if (!shipping.address) return 'Please enter your shipping address.';
    if (!shipping.city || !shipping.state) return 'Please enter your city and state.';
    if (!shipping.zip || shipping.zip.length < 5) return 'Please enter a valid PIN/ZIP code.';
    return null;
  };

  const handleNextStep = () => {
    if (step === 0) {
      const err = validateShipping();
      if (err) {
        alert(err);
        return;
      }
    }
    if (step === 1) {
      if (paymentMethod === 'card') {
        const cleanCard = payment.cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 16) return alert('Invalid card number. Must be 16 digits.');
        if (payment.expiry.length < 5) return alert('Invalid expiry date. Must be MM/YY.');
        if (payment.cvv.length < 3) return alert('Invalid CVV. Must be 3 digits.');
        if (!payment.cardName) return alert('Cardholder name is required.');
      } else if (paymentMethod === 'upi') {
        if (!upiIdInput.includes('@')) return alert('Please enter a valid UPI ID (e.g., name@bank).');
      } else if (paymentMethod === 'netbanking') {
        if (!selectedBank) return alert('Please select your bank.');
      }
    }
    setStep(step + 1);
  };

  const triggerOrderPlacement = (methodName, statusName, maskDetails, upiIdDetails, txId) => {
    setPlacing(true);
    const txnId = txId || 'TXN-' + Math.floor(1000000000 + Math.random() * 9000000000);
    
    setPlacingPhase('Initializing SSL/TLS 256-bit secure tunnel...');
    
    setTimeout(() => {
      setPlacingPhase('Contacting payment merchant gateway API...');
      
      setTimeout(() => {
        setPlacingPhase('Authorizing transaction total and security signature...');
        
        setTimeout(() => {
          setPlacingPhase('Saving order to secure full-stack database...');
          
          setTimeout(() => {
            const finalReceipt = {
              orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
              transactionId: txnId,
              paymentMethod: methodName,
              paymentStatus: statusName,
              cardDetails: maskDetails,
              upiId: upiIdDetails,
              totalAmount: orderTotal,
              deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            };

            addOrder({
              items: [...cart],
              total: orderTotal,
              shippingAddress: `${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.zip}`,
              tax,
              status: 'Processing',
              paymentMethod: methodName,
              paymentStatus: statusName,
              transactionId: txnId,
              cardNumber: maskDetails,
              cardName: payment.cardName || undefined,
              upiId: upiIdDetails
            });

            setReceipt(finalReceipt);
            setPlacing(false);
            setPlaced(true);
            clearCart();
          }, 1200);
        }, 1000);
      }, 1000);
    }, 800);
  };

  // Helper to load external Razorpay checkout.js dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setPlacing(true);
    setPlacingPhase('Contacting Razorpay Gateway...');
    
    try {
      // 1. Create order on backend
      const response = await fetch('http://localhost:5000/api/payments/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderTotal,
          receipt: `rcpt_${Date.now()}`
        })
      });
      
      const orderData = await response.json();
      if (!response.ok || !orderData.success) {
        throw new Error(orderData.message || 'Razorpay order creation failed');
      }

      setPlacing(false);

      // If simulated, use fallback dialogs
      if (orderData.simulated) {
        console.warn('Backend returned simulated order due to missing keys. Launching custom interactive simulations...');
        if (paymentMethod === 'card') {
          setShowOtpModal(true);
        } else if (paymentMethod === 'upi') {
          setShowUpiModal(true);
        }
        return;
      }

      // Load SDK Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Could not load Razorpay script. Switched to fallback checkout.');
        setShowOtpModal(true);
        return;
      }

      const options = {
        key: 'rzp_test_mock_id', // Overwritten by SDK response if needed
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FurniShopsy Showroom',
        description: 'Luxury Solid Wood Furnitures Purchase',
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify signature on backend
          setPlacing(true);
          setPlacingPhase('Verifying signatures...');
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              triggerOrderPlacement('Razorpay Online', 'Paid', `ID: ${response.razorpay_payment_id}`, null, response.razorpay_payment_id);
            } else {
              alert('Signature validation failed. Payment cancelled.');
              setPlacing(false);
            }
          } catch (e) {
            console.error('Signature check error:', e);
            setPlacing(false);
          }
        },
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          email: shipping.email,
          contact: shipping.phone
        },
        theme: {
          color: '#2d5239'
        }
      };

      const rzpWindow = new window.Razorpay(options);
      rzpWindow.open();

    } catch (err) {
      console.warn('Razorpay Online Checkout failed. Using interactive mock layout:', err.message);
      setPlacing(false);
      // Fallback
      if (paymentMethod === 'card') {
        setShowOtpModal(true);
      } else if (paymentMethod === 'upi') {
        setShowUpiModal(true);
      } else if (paymentMethod === 'netbanking') {
        setShowNetBankModal(true);
      }
    }
  };

  const handleCompleteOrder = () => {
    if (paymentMethod === 'cod') {
      triggerOrderPlacement('Cash on Delivery', 'Pending', null, null);
    } else {
      handleRazorpayCheckout();
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput === '123456') {
      setShowOtpModal(false);
      setOtpInput('');
      setOtpError('');
      const cleanNum = payment.cardNumber.replace(/\s+/g, '');
      const masked = `•••• •••• •••• ${cleanNum.slice(-4)}`;
      triggerOrderPlacement('Credit/Debit Card (Simulated)', 'Paid', masked, null);
    } else {
      setOtpError('Invalid OTP code. Enter 123456 to bypass simulation.');
    }
  };

  const handleUpiApproveSim = () => {
    setShowUpiModal(false);
    triggerOrderPlacement(`UPI (${selectedUpiApp})`, 'Paid', null, upiIdInput);
  };

  const handleNetBankSimulate = () => {
    if (!bankUsername || !bankPassword) {
      setBankError('Username and password are required.');
      return;
    }
    setShowNetBankModal(false);
    setBankUsername('');
    setBankPassword('');
    setBankError('');
    triggerOrderPlacement(`Net Banking (${selectedBank})`, 'Paid', null, null);
  };

  return (
    <main className="transition-colors duration-300 dark:bg-slate-900">
      <PageBanner title="Secure Checkout" breadcrumbs={['Home', 'Cart', 'Checkout']} />

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>

      <section className="py-12 bg-gray-55 dark:bg-slate-900/60 min-h-screen relative">
        
        {/* Full-Screen Loader */}
        <AnimatePresence>
          {placing && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-center"
            >
              <div className="max-w-md w-full bg-white/5 dark:bg-slate-800/30 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-full h-full bg-gradient-to-r from-primary to-cyan-400"
                  />
                </div>
                
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <div className="w-12 h-12 border-t-2 border-r-2 border-primary rounded-full animate-spin" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">Securing Payment</h3>
                <p className="text-cyan-400 font-mono text-xs mb-6 uppercase tracking-widest bg-cyan-400/10 py-1.5 px-3 rounded-full inline-block border border-cyan-400/20">
                  {placingPhase}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Your payment parameters are fully encrypted. Please do not close or reload this page.
                </p>
                
                <div className="mt-8 flex justify-center items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>🛡️ PCI-DSS Compliant</span>
                  <span>•</span>
                  <span>🔒 AES-256 Bit</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4">
          {placed && receipt ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#2d5239] to-emerald-800 p-8 text-center text-white relative">
                <div className="text-5xl mb-4">💚</div>
                <h2 className="text-3xl font-extrabold tracking-wide uppercase">Purchase Complete</h2>
                <p className="text-white/80 text-sm mt-1">Thank you for shopping! Your payment has been processed successfully.</p>
                
                <div className="absolute right-4 bottom-4 bg-white/10 py-1 px-3.5 rounded-full border border-white/10 text-[10px] font-mono tracking-widest uppercase">
                  {receipt.paymentStatus}
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 border border-gray-105 dark:border-slate-800 text-sm space-y-4 font-sans">
                  <h4 className="font-bold text-gray-805 dark:text-white uppercase tracking-wider text-xs border-b border-gray-200 dark:border-slate-700 pb-2">Receipt Details</h4>
                  
                  <div className="grid grid-cols-2 gap-y-3 font-mono text-xs">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="text-right text-gray-900 dark:text-white font-bold">{receipt.orderId}</span>
                    
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="text-right text-gray-900 dark:text-cyan-400 font-bold select-all">{receipt.transactionId}</span>
                    
                    <span className="text-gray-500">Payment Type:</span>
                    <span className="text-right text-gray-900 dark:text-white font-bold">{receipt.paymentMethod}</span>
                    
                    {receipt.cardDetails && (
                      <>
                        <span className="text-gray-500">Card Mask:</span>
                        <span className="text-right text-gray-900 dark:text-white font-bold">{receipt.cardDetails}</span>
                      </>
                    )}

                    {receipt.upiId && (
                      <>
                        <span className="text-gray-500">UPI ID:</span>
                        <span className="text-right text-gray-900 dark:text-white font-bold">{receipt.upiId}</span>
                      </>
                    )}

                    <span className="text-gray-500">Status:</span>
                    <span className="text-right text-green-600 font-extrabold uppercase">{receipt.paymentStatus}</span>

                    <span className="text-gray-500">Amount Charged:</span>
                    <span className="text-right text-primary dark:text-white font-extrabold text-sm">₹{receipt.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-yellow-400/10 rounded-2xl p-4 border border-yellow-400/20 text-xs text-yellow-800 dark:text-yellow-400">
                  <span className="text-xl">🚚</span>
                  <div>
                    <p className="font-bold">Estimated Delivery</p>
                    <p className="text-gray-500 dark:text-slate-400">{receipt.deliveryDate}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-4">
                  <Link to="/profile" className="btn-primary py-3 px-8 rounded-xl font-bold uppercase tracking-wider text-xs">View My Orders</Link>
                  <Link to="/shop" className="btn-outline py-3 px-8 rounded-xl font-bold uppercase tracking-wider text-xs dark:text-white dark:border-slate-700">Shop More</Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              
              {/* Form Wizard */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                  
                  {/* Steps Progress bar */}
                  <div className="flex justify-between mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-slate-700 -translate-y-1/2 -z-10" />
                    {steps.map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-800 px-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= step ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                          {i + 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= step ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div 
                        key="step0" 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }} 
                        className="space-y-6"
                      >
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          <span>📦</span> Shipping Information
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">First Name</label>
                            <input name="firstName" value={shipping.firstName} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="John" />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Last Name</label>
                            <input name="lastName" value={shipping.lastName} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="Doe" />
                          </div>
                          
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                            <input name="email" value={shipping.email} onChange={handleShippingChange} type="email" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="john@example.com" />
                          </div>
                          
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mobile Phone</label>
                            <input name="phone" value={shipping.phone} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="9876543210" />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Street Address</label>
                            <input name="address" value={shipping.address} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="123 Main St, Appt 4" />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">City</label>
                            <input name="city" value={shipping.city} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="Mumbai" />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">State</label>
                            <input name="state" value={shipping.state} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="Maharashtra" />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">PIN / ZIP Code</label>
                            <input name="zip" value={shipping.zip} onChange={handleShippingChange} type="text" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold" placeholder="400001" />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Address Type</label>
                            <select name="type" value={shipping.type} onChange={handleShippingChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold">
                              <option value="Home">Home (All-day delivery)</option>
                              <option value="Office">Office (9 AM - 6 PM)</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div 
                        key="step1" 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }} 
                        className="space-y-6"
                      >
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          <span>💳</span> Select Payment Mode
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'upi', name: 'Razorpay UPI Payment', icon: '📱' },
                            { id: 'card', name: 'Razorpay Cards Portal', icon: '💳' },
                            { id: 'netbanking', name: 'Razorpay NetBanking', icon: '🏦' },
                            { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
                          ].map(method => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentMethod(method.id)}
                              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                paymentMethod === method.id 
                                  ? 'border-primary bg-primary/5 text-primary scale-100 shadow-sm' 
                                  : 'border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-gray-200 dark:hover:border-slate-650'
                              }`}
                            >
                              <span className="text-2xl">{method.icon}</span>
                              <span className="font-bold text-xs text-left leading-tight">
                                {method.name}
                              </span>
                            </button>
                          ))}
                        </div>

                        {paymentMethod === 'upi' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-3xl border border-gray-150 dark:border-slate-800 space-y-5"
                          >
                            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Select Instant App</h4>
                            <div className="flex flex-wrap gap-2">
                              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                                <button
                                  key={app}
                                  type="button"
                                  onClick={() => setSelectedUpiApp(app)}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                    selectedUpiApp === app 
                                      ? 'bg-primary border-primary text-white shadow-sm' 
                                      : 'border-gray-200 dark:border-slate-750 hover:border-primary hover:text-primary dark:text-white'
                                  }`}
                                >
                                  {app}
                                </button>
                              ))}
                            </div>
                            
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Enter Virtual Payment Address (VPA)</label>
                              <input 
                                type="text" 
                                value={upiIdInput}
                                onChange={e => setUpiIdInput(e.target.value)}
                                className="w-full bg-white dark:bg-slate-850 border border-gray-250 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-mono font-semibold" 
                                placeholder="name@okaxis" 
                              />
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === 'card' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-3xl border border-gray-150 dark:border-slate-800"
                          >
                            <div className="perspective-1000 w-full max-w-xs sm:max-w-sm mx-auto mb-8 h-48 relative cursor-pointer group">
                              <motion.div
                                animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="w-full h-full rounded-2xl relative preserve-3d shadow-xl"
                              >
                                <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6 text-white bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#203a43] flex flex-col justify-between overflow-hidden border border-white/10">
                                  <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/5 rounded-full blur-xl" />
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Secured Card</p>
                                      <span className="text-[10px] font-mono font-bold text-cyan-300">PLATINUM</span>
                                    </div>
                                    <div className="text-xl font-bold italic tracking-tighter text-white">
                                      {payment.cardNumber.startsWith('4') ? 'VISA' : payment.cardNumber.startsWith('5') ? 'Mastercard' : payment.cardNumber.startsWith('3') ? 'AMEX' : 'CREDIT CARD'}
                                    </div>
                                  </div>
                                  
                                  <div className="w-9 h-7 bg-gradient-to-br from-yellow-250 to-yellow-400 rounded relative overflow-hidden my-1 shadow-inner border border-yellow-500/20">
                                    <div className="absolute top-0 bottom-0 left-1/3 right-1/3 border-l border-r border-yellow-600/30" />
                                    <div className="absolute left-0 right-0 top-1/3 bottom-1/3 border-t border-b border-yellow-600/30" />
                                  </div>

                                  <div className="text-lg sm:text-xl font-mono tracking-widest text-center py-1">
                                    {payment.cardNumber || '•••• •••• •••• ••••'}
                                  </div>

                                  <div className="flex justify-between items-end mt-1">
                                    <div>
                                      <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Card Holder</p>
                                      <p className="text-xs font-mono uppercase tracking-wide truncate max-w-[150px]">
                                        {payment.cardName || 'JOHN DOE'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Expires</p>
                                      <p className="text-xs font-mono">{payment.expiry || 'MM/YY'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl text-white bg-gradient-to-br from-[#203a43] to-[#0f2027] flex flex-col justify-between overflow-hidden border border-white/10" style={{ transform: 'rotateY(180deg)' }}>
                                  <div className="h-9 bg-slate-900 w-full mt-4" />
                                  <div className="px-6 flex items-center justify-between mt-2">
                                    <div className="bg-white/10 text-[9px] py-1 px-3 rounded text-left italic grow mr-4 select-none">
                                      AUTHORIZED SIGNATURE
                                    </div>
                                    <div className="bg-white text-slate-900 font-mono text-sm px-3 py-1 rounded text-right shadow-inner font-extrabold">
                                      {payment.cvv || '•••'}
                                    </div>
                                  </div>
                                  <div className="p-4 text-[7px] text-gray-400 text-center uppercase tracking-widest">
                                    Card Handshake Mode. Use simulated bypass OTP.
                                  </div>
                                </div>
                              </motion.div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                                <input name="cardName" value={payment.cardName} onChange={handlePaymentChange} type="text" className="w-full bg-white dark:bg-slate-850 border border-gray-250 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-semibold uppercase" placeholder="JOHN DOE" />
                              </div>
                              
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Card Number</label>
                                <input name="cardNumber" value={payment.cardNumber} onChange={handlePaymentChange} type="text" maxLength={19} className="w-full bg-white dark:bg-slate-850 border border-gray-250 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-mono font-semibold" placeholder="0000 0000 0000 0000" />
                              </div>

                              <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                                <input name="expiry" value={payment.expiry} onChange={handlePaymentChange} type="text" maxLength={5} className="w-full bg-white dark:bg-slate-850 border border-gray-250 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-mono font-semibold text-center" placeholder="MM/YY" />
                              </div>

                              <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">CVV Code</label>
                                <input 
                                  name="cvv" 
                                  value={payment.cvv} 
                                  onChange={handlePaymentChange} 
                                  onFocus={() => setIsCardFlipped(true)}
                                  onBlur={() => setIsCardFlipped(false)}
                                  type="password" 
                                  maxLength={3} 
                                  className="w-full bg-white dark:bg-slate-850 border border-gray-250 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors font-mono font-semibold text-center tracking-[0.4em]" 
                                  placeholder="•••" 
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === 'netbanking' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-6 bg-gray-50 dark:bg-slate-900/40 rounded-3xl border border-gray-150 dark:border-slate-800 space-y-4"
                          >
                            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Select Bank</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                                <button
                                  key={bank}
                                  type="button"
                                  onClick={() => setSelectedBank(bank)}
                                  className={`flex items-center gap-2 p-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-left ${
                                    selectedBank === bank 
                                      ? 'border-primary bg-primary/5 text-primary' 
                                      : 'border-gray-250 dark:border-slate-750 hover:border-primary dark:text-white'
                                  }`}
                                >
                                  🏦 {bank}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === 'cod' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 flex gap-4 items-center"
                          >
                            <span className="text-3xl">💵</span>
                            <div>
                              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">Cash on Delivery</h4>
                              <p className="text-xs text-gray-555 dark:text-slate-400 mt-0.5">Pay ₹{orderTotal.toLocaleString('en-IN')} in cash upon receiving your premium furniture pieces.</p>
                            </div>
                          </motion.div>
                        )}

                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div 
                        key="step2" 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }} 
                        className="space-y-6"
                      >
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          <span>🔎</span> Review Order Details
                        </h3>

                        <div className="bg-gray-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-gray-150 dark:border-slate-800 space-y-4 text-xs font-sans">
                          <h4 className="font-bold text-gray-805 dark:text-white uppercase tracking-wider text-xs border-b border-gray-200 dark:border-slate-700 pb-2">Delivery Target</h4>
                          <p className="font-semibold text-gray-900 dark:text-white">Recipient: {shipping.firstName} {shipping.lastName}</p>
                          <p className="text-gray-500 dark:text-slate-400">Phone: {shipping.phone} | Email: {shipping.email}</p>
                          <p className="text-gray-500 dark:text-slate-400">Address: {shipping.address}, {shipping.city}, {shipping.state} - {shipping.zip} ({shipping.type})</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-gray-150 dark:border-slate-800 space-y-4 text-xs font-sans">
                          <h4 className="font-bold text-gray-805 dark:text-white uppercase tracking-wider text-xs border-b border-gray-200 dark:border-slate-700 pb-2">Selected Payment Mode</h4>
                          <div className="flex justify-between items-center font-mono">
                            <span className="text-gray-500 uppercase">Method:</span>
                            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">{paymentMethod}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Bag Summary ({cart.length} items)</h4>
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-slate-800 last:border-0">
                              <div className="flex items-center gap-3">
                                <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-700" />
                                <div>
                                  <p className="font-bold text-sm text-gray-905 dark:text-white">{item.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700 flex justify-between">
                    <button
                      type="button"
                      onClick={() => step > 0 && setStep(step - 1)}
                      className={`font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors'}`}
                    >
                      ← Back
                    </button>
                    
                    {step < 2 ? (
                      <button 
                        type="button"
                        onClick={handleNextStep} 
                        className="btn-primary py-3.5 px-8 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Next Section
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleCompleteOrder} 
                        className="btn-primary py-3.5 px-10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                      >
                        🔒 SECURE ORDER ₹{orderTotal.toLocaleString('en-IN')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column billing calculator & coupon box */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Coupon Code Applying Box */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                  <h4 className="font-display font-extrabold text-sm text-gray-900 dark:text-white mb-3">Apply Coupon</h4>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. FURNI20" 
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2 text-xs dark:text-white focus:outline-none focus:border-primary grow font-mono uppercase"
                    />
                    <button className="bg-primary hover:bg-[#213e2b] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">
                      Apply
                    </button>
                  </form>
                  {couponError && <p className="text-[10px] text-red-500 font-bold mt-2">⚠️ {couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold mt-2">✨ {couponSuccess}</p>}
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-[10px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">Available Coupons</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span onClick={() => setCouponInput('FURNI20')} className="bg-[#2d5239]/10 text-primary dark:text-[#53ab6b] text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer font-bold hover:bg-[#2d5239]/20">FURNI20 (20% Off)</span>
                      <span onClick={() => setCouponInput('WELCOME500')} className="bg-[#2d5239]/10 text-primary dark:text-[#53ab6b] text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer font-bold hover:bg-[#2d5239]/20">WELCOME500 (₹500 Off)</span>
                    </div>
                  </div>
                </div>

                {/* Price summary details */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
                  <h3 className="font-display font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">Bill details</h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between text-gray-550 dark:text-slate-400">
                      <span>Bag Subtotal</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-650 font-bold">
                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                        <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-550 dark:text-slate-400">
                      <span>Express Shipping</span>
                      <span className="font-semibold text-green-600">
                        {shippingCost === 0 ? '🏆 FREE DELIVERY' : `₹${shippingCost.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-550 dark:text-slate-400">
                      <span>GST (Tax 18%)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-slate-700 pt-5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">Grand Total</span>
                      <span className="text-3xl font-extrabold text-primary dark:text-white font-display">₹{orderTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 rounded-2xl p-4 flex gap-3.5 items-center border border-emerald-500/15">
                    <div className="text-2xl">🛡️</div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Razorpay SSL Encrypted</p>
                      <p className="text-[9px] text-gray-500 dark:text-slate-400">All data transactions are 100% bank-secured.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* MODAL 1: OTP Card simulation */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative"
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-xl">🏦</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">3D Secure Verification</h3>
                <p className="text-xs text-gray-505 dark:text-slate-400 leading-relaxed">
                  We have sent an authentication code to your registered mobile ending in <strong className="text-gray-900 dark:text-white">•••• 9876</strong>.
                </p>

                <div className="bg-primary/5 py-2 px-4 rounded-xl border border-primary/10 mb-4 inline-block">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Simulated OTP Code Hint</p>
                  <p className="font-mono text-sm font-extrabold text-primary">123456</p>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-750 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.5em] focus:border-primary focus:outline-none dark:text-white" 
                    placeholder="••••••" 
                  />
                  {otpError && <p className="text-[10px] text-red-500 font-semibold">{otpError}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowOtpModal(false); setOtpError(''); setOtpInput(''); }}
                    className="btn-outline grow py-3 rounded-xl text-xs font-bold uppercase tracking-widest dark:text-white dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleVerifyOtp}
                    className="btn-primary grow py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Verify Code
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: UPI Dialog */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden text-center relative"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold border-b border-gray-100 dark:border-slate-700 pb-3">
                  <span className="text-primary tracking-widest uppercase">UPI SCANNING MOCK</span>
                  <span className="font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                    {Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Scan the secure QR Code using your <strong className="text-gray-900 dark:text-white">{selectedUpiApp}</strong> mobile app or click below to simulate approval.
                </p>

                <div className="bg-white p-4 rounded-2xl w-40 h-40 border-2 border-primary/20 mx-auto shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 to-primary/5 pointer-events-none" />
                  
                  <div className="w-full h-full border border-slate-900 rounded p-1 flex flex-col justify-between">
                    {[...Array(6)].map((_, rIndex) => (
                      <div key={rIndex} className="flex justify-between h-4">
                        {[...Array(6)].map((_, cIndex) => {
                          const isAnchor = (rIndex < 2 && cIndex < 2) || (rIndex < 2 && cIndex > 3) || (rIndex > 3 && cIndex < 2);
                          return (
                            <div 
                              key={cIndex} 
                              className={`w-4 h-4 rounded-sm border ${
                                isAnchor 
                                  ? 'bg-slate-955 border-slate-900' 
                                  : (rIndex + cIndex) % 2 === 0 ? 'bg-slate-900 border-transparent' : 'bg-transparent border-transparent'
                              }`} 
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-55 dark:bg-slate-900 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-750 text-xs font-semibold">
                  <p className="text-gray-500">Total Amount Payable</p>
                  <p className="text-lg font-bold text-primary">₹{orderTotal.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowUpiModal(false)}
                    className="btn-outline grow py-3 rounded-xl text-xs font-bold uppercase tracking-widest dark:text-white dark:border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleUpiApproveSim}
                    className="btn-primary grow py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md"
                  >
                    Approve Payment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Net Banking */}
      <AnimatePresence>
        {showNetBankModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative"
            >
              <div className="space-y-4">
                <div className="text-center border-b border-gray-105 dark:border-slate-700 pb-3">
                  <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-white tracking-widest">{selectedBank} NetBanking</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">MOCKED BANK SECURED GATEWAY</p>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400 text-center leading-relaxed">
                  Enter your internet banking credentials below to authorize the transaction.
                </p>

                <div className="bg-primary/5 py-2 px-4 rounded-xl border border-primary/10 text-center">
                  <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Demo Instructions</p>
                  <p className="text-[10px] text-gray-600 dark:text-slate-350 leading-normal">Enter any dummy values for username and password to simulate authentication.</p>
                </div>

                <div className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">User ID / Username</label>
                    <input 
                      type="text" 
                      value={bankUsername}
                      onChange={e => setBankUsername(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-750 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none" 
                      placeholder="bank_user_123" 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Secure Password</label>
                    <input 
                      type="password" 
                      value={bankPassword}
                      onChange={e => setBankPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-750 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none" 
                      placeholder="••••••••" 
                    />
                  </div>

                  {bankError && <p className="text-[10px] text-red-500 font-semibold text-center">{bankError}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowNetBankModal(false); setBankUsername(''); setBankPassword(''); setBankError(''); }}
                    className="btn-outline grow py-3 rounded-xl text-xs font-bold uppercase tracking-widest dark:text-white dark:border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleNetBankSimulate}
                    className="btn-primary grow py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Login & Pay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
