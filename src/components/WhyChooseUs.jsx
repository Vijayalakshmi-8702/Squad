import { motion } from 'framer-motion';

const features = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    description: 'We offer free shipping on all orders over ₹5,000. Your furniture delivered right to your door.',
  },
  {
    icon: '🔒',
    title: 'Secure Payment',
    description: '100% secure payment methods. We accept all major credit cards, PayPal and more.',
  },
  {
    icon: '↩️',
    title: 'Easy Returns',
    description: '30-day return policy. Not satisfied? Return it hassle-free with full refund.',
  },
  {
    icon: '⭐',
    title: 'Premium Quality',
    description: 'All our products are crafted from premium materials for durability and elegance.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle dark:text-primary-light">Why Choose Us</span>
            <h2 className="section-title dark:text-white">The Best Furniture For Your Home</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
              At Furni, we believe that great design should be accessible to everyone. Our collection 
              combines quality craftsmanship with contemporary design to create furniture that lasts a lifetime.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary/20 group-hover:bg-primary rounded-xl flex items-center justify-center text-xl transition-colors duration-300">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{feat.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-500 leading-relaxed transition-colors">{feat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right image grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-lg h-52">
                <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80" alt="Chair" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg h-36">
                <img src="https://images.unsplash.com/photo-1549497538-303791108f95?w=400&q=80" alt="Table" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-2xl overflow-hidden shadow-lg h-36">
                <img src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80" alt="Desk" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg h-52">
                <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80" alt="Bed" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
