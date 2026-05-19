import { useState } from 'react';
import { motion } from 'framer-motion';
import PageBanner from '../components/PageBanner';

const contactInfo = [
  { icon: '📍', title: 'Address', value: '123 Furniture Hub Road, Sector 62, Noida, UP 201301' },
  { icon: '📞', title: 'Phone', value: '+91 120 4321 0987' },
  { icon: '✉️', title: 'Email', value: 'support@furnishopsy.com' },
  { icon: '⏰', title: 'Working Hours', value: 'Mon–Sat: 10am – 9pm' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <main>
      <PageBanner
        title="Contact Us"
        subtitle="We'd love to hear from you"
        breadcrumbs={['Home', 'Contact']}
      />

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info cards */}
            <div className="space-y-5">
              <div>
                <span className="section-subtitle">Get In Touch</span>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">We're Here To Help</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Have a question about our products or services? Want to book a consultation? 
                  Our team is ready to assist you.
                </p>
              </div>
              {contactInfo.map(info => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{info.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{info.title}</h3>
                    <p className="text-gray-500 text-sm">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full py-16 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-5">✅</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h3>
                  <p className="text-gray-500 max-w-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="btn-primary rounded-lg mt-8 px-8 py-3">
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project or question..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-4 rounded-xl justify-center text-base"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : 'Send Message'}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-72 bg-gray-200 relative"
          >
            <img
              src="https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=1200&q=60"
              alt="Map"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-5 shadow-xl text-center">
                <div className="text-3xl mb-2">📍</div>
                <p className="font-bold text-gray-900">FurniShopsy Flagship Showroom</p>
                <p className="text-sm text-gray-500">123 Furniture Hub Road, Sector 62, Noida</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
