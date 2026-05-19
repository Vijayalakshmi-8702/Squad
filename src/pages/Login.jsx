import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
  const [formData, setFormData] = useState({ email: '', mobile: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP State Machine
  // steps: 'auth' (initial credentials input) | 'otp-verify' (enter code) | 'forgot' (enter email for reset) | 'forgot-otp' (enter code for reset) | 'new-password' (enter new pass)
  const [step, setStep] = useState('auth');
  const [otpCode, setOtpCode] = useState('');
  const [tempIdentifier, setTempIdentifier] = useState('');
  const [receivedOtpHint, setReceivedOtpHint] = useState(''); // Stores hint returned from API for easy local testing
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(''); // Live test preview URL for sent email

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const getIdentifier = () => {
    if (step === 'forgot' || step === 'forgot-otp' || step === 'new-password') {
      return tempIdentifier;
    }
    return loginMethod === 'email' ? formData.email : formData.mobile;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const identifier = getIdentifier();
    if (!identifier.trim()) {
      setError(`Please enter your ${loginMethod === 'email' ? 'email address' : 'mobile number'}`);
      setLoading(false);
      return;
    }

    if (!isLogin && (!formData.name.trim() || !formData.password.trim())) {
      setError('Please fill in name and password fields');
      setLoading(false);
      return;
    }

    try {
      // 1. Trigger OTP send from backend
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          purpose: isLogin ? 'login' : 'register'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send verification code');

      setTempIdentifier(identifier);
      if (data.testOtp) {
        setReceivedOtpHint(data.testOtp);
      }
      if (data.previewUrl) {
        setEmailPreviewUrl(data.previewUrl);
      } else {
        setEmailPreviewUrl('');
      }
      
      setSuccess(`Verification code sent to ${identifier}`);
      setStep('otp-verify');
    } catch (err) {
      console.warn('Backend send-otp failed, falling back to instant mock auth:', err);
      // Fallback: Skip OTP screen and login/register directly
      await performFinalAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      setLoading(false);
      return;
    }

    try {
      // Verify OTP via MERN backend
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: tempIdentifier,
          code: otpCode,
          purpose: isLogin ? 'login' : 'register'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Incorrect verification code. Please try again.');

      // Complete login or register
      await performFinalAuth();
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      setLoading(false);
    }
  };

  const performFinalAuth = async () => {
    let result;
    if (isLogin) {
      result = await login({ identifier: tempIdentifier, password: formData.password });
    } else {
      result = await register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });
    }

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Authentication session failed.');
      setStep('auth'); // revert to auth screen
    }
    setLoading(false);
  };

  // Forgot Password flow
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!tempIdentifier.trim()) {
      setError('Please enter your email or mobile number');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: tempIdentifier,
          purpose: 'reset'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP code');

      if (data.testOtp) {
        setReceivedOtpHint(data.testOtp);
      }
      if (data.previewUrl) {
        setEmailPreviewUrl(data.previewUrl);
      } else {
        setEmailPreviewUrl('');
      }
      setSuccess(`Reset OTP code sent to ${tempIdentifier}`);
      setStep('forgot-otp');
    } catch (err) {
      setError(err.message || 'Error executing forgot password service.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: tempIdentifier,
          code: otpCode,
          purpose: 'reset'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid reset code');

      setSuccess('Code verified! Choose your new password.');
      setStep('new-password');
      setOtpCode('');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.password.trim()) {
      setError('Password cannot be empty');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: tempIdentifier,
          newPassword: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password update failed');

      setSuccess('Your password has been successfully reset. Please log in.');
      setStep('auth');
      setIsLogin(true);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700"
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              {step === 'auth' ? '🔐' : step.includes('otp') ? '💬' : '🔑'}
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
              {step === 'auth' ? (isLogin ? 'Welcome Back' : 'Create Account') :
               step === 'otp-verify' ? 'Verify OTP Code' :
               step === 'forgot' ? 'Forgot Password' :
               step === 'forgot-otp' ? 'Verify Reset Code' : 'New Password'}
            </h1>
            <p className="text-xs text-gray-550 dark:text-slate-400">
              {step === 'auth' && (isLogin ? 'Sign in with your email or verified mobile number' : 'Create a FurniShopsy account to track premium woodcrafts')}
              {step === 'otp-verify' && `We sent a security code to ${tempIdentifier}`}
              {step === 'forgot' && 'Enter email/mobile to request password reset OTP'}
              {step === 'forgot-otp' && `Enter code sent to ${tempIdentifier} to reset password`}
              {step === 'new-password' && 'Choose a strong new password for your account'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs text-center font-bold"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-55/10 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-650 dark:text-emerald-450 rounded-xl text-xs text-center font-bold"
            >
              ✨ {success}
            </motion.div>
          )}

          {/* OTP Testing Hint Badge */}
          {receivedOtpHint && (step.includes('otp')) && (
            <div className="mb-4 p-3 bg-amber-55/80 dark:bg-amber-950/40 border border-amber-250 dark:border-amber-900/50 text-amber-850 dark:text-amber-300 rounded-xl text-xs text-center font-medium leading-relaxed">
              💡 <strong>Demo Mode:</strong> Your OTP is <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded font-bold text-sm tracking-widest">{receivedOtpHint}</code> (or enter <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded font-bold">123456</code> to bypass)
              {emailPreviewUrl && (
                <div className="mt-2.5 pt-2 border-t border-amber-250/30 text-[11px] font-bold text-emerald-750 dark:text-emerald-400">
                  📬 Real-time Email Sent! <a href={emailPreviewUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-850 dark:hover:text-emerald-350 ml-1">Click here to open live Ethereal Inbox ↗</a>
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'auth' && (
              <motion.div
                key="auth-panel"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {/* Login Method Toggle Tabs */}
                {isLogin && (
                  <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl mb-5">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        loginMethod === 'email' 
                          ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      📧 Email Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('mobile')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        loginMethod === 'mobile' 
                          ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      📱 Mobile Login
                    </button>
                  </div>
                )}

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  
                  {/* Full Name field (Register only) */}
                  {!isLogin && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white transition-colors"
                        placeholder="Vijay Kumar"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </motion.div>
                  )}
                  
                  {/* Email field (Register OR Email Login) */}
                  {(!isLogin || (isLogin && loginMethod === 'email')) && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white transition-colors"
                        placeholder="vijay@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  )}

                  {/* Mobile number field (Register OR Mobile Login) */}
                  {(!isLogin || (isLogin && loginMethod === 'mobile')) && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+91</span>
                        <input 
                          type="tel" 
                          required 
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white transition-colors font-mono"
                          placeholder="9876543210"
                          value={formData.mobile}
                          onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <div className="flex justify-between mb-1.5 ml-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                      {isLogin && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setTempIdentifier(loginMethod === 'email' ? formData.email : formData.mobile);
                            setStep('forgot');
                          }}
                          className="text-xs text-primary hover:underline font-bold cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <input 
                      type="password" 
                      required 
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white transition-colors font-mono"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/20 mt-4 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'otp-verify' && (
              <motion.div
                key="otp-panel"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">6-Digit Verification Code</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-4 text-xl tracking-[0.7em] text-center font-mono focus:outline-none focus:border-primary dark:text-white transition-colors"
                      placeholder="000000"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/20 mt-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('auth'); setError(''); setSuccess(''); setReceivedOtpHint(''); setEmailPreviewUrl(''); setOtpCode(''); }}
                    className="w-full text-center text-xs text-gray-550 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white font-bold py-2 mt-1 cursor-pointer"
                  >
                    ← Back to login credentials
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'forgot' && (
              <motion.div
                key="forgot-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email or Mobile Number</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white transition-colors"
                      placeholder="vijay@example.com or 9876543210"
                      value={tempIdentifier}
                      onChange={e => setTempIdentifier(e.target.value)}
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/20 mt-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Sending OTP...' : 'Send Reset Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('auth'); setError(''); setSuccess(''); setReceivedOtpHint(''); setEmailPreviewUrl(''); setOtpCode(''); }}
                    className="w-full text-center text-xs text-gray-550 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white font-bold py-2 mt-1 cursor-pointer"
                  >
                    ← Cancel and go back
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'forgot-otp' && (
              <motion.div
                key="forgot-otp-panel"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <form onSubmit={handleForgotOtpVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Reset Code</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-4 text-xl tracking-[0.7em] text-center font-mono focus:outline-none focus:border-primary dark:text-white transition-colors"
                      placeholder="000000"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/20 mt-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setError(''); setSuccess(''); setReceivedOtpHint(''); setEmailPreviewUrl(''); setOtpCode(''); }}
                    className="w-full text-center text-xs text-gray-550 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white font-bold py-2 mt-1 cursor-pointer"
                  >
                    ← Back to email request
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'new-password' && (
              <motion.div
                key="new-password-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">New Password</label>
                    <input 
                      type="password" 
                      required 
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white transition-colors font-mono"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/20 mt-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Saving Password...' : 'Save & Log In'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
