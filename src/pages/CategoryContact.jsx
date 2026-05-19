import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CategoryContact() {
  const { categoryName } = useOutletContext();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Info */}
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Contact {categoryName} Dept.</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-md">
            Our specialized team for {categoryName} is ready to answer your questions regarding products, bulk orders, or technical support.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">📞</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Direct Line</h4>
                <p className="text-primary font-medium mt-1">+91 1800-555-0199</p>
                <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9am to 6pm</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">✉️</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Department Email</h4>
                <p className="text-primary font-medium mt-1">{categoryName.toLowerCase()}@furnishopsy.com</p>
                <p className="text-xs text-gray-500 mt-1">We aim to reply within 2 hours</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">🏢</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Showroom</h4>
                <p className="text-gray-500 dark:text-slate-400 mt-1">123 Furniture Hub Road<br />Sector 62<br />Noida, UP 201301</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-500 dark:text-slate-400">Our {categoryName} team will get back to you shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">Send us a message</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" required className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" required className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" required className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inquiry Type</label>
                <select className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors">
                  <option>Product Inquiry</option>
                  <option>Bulk Order</option>
                  <option>Technical Support</option>
                  <option>Returns & Refunds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea required rows="4" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:border-primary focus:outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-bold mt-2">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
