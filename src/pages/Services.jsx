import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

const services = [
  {
    icon: '🎨',
    title: 'Interior Design Consultation',
    description: 'Our expert designers will help you plan and visualize your perfect space, from concept to completion. Free consultation available.',
    price: 'Free',
    features: ['Color scheme planning', 'Furniture layout', '3D visualization', 'Material selection'],
  },
  {
    icon: '🚚',
    title: 'White Glove Delivery',
    description: 'Premium delivery service where our team delivers, assembles and places your furniture exactly where you want it.',
    price: '₹7,999',
    features: ['Professional delivery team', 'In-home assembly', 'Debris removal', 'Scheduled time slots'],
  },
  {
    icon: '🔧',
    title: 'Assembly Service',
    description: 'Don\'t want to struggle with flat-packs? Our professional assembly team will put together your furniture quickly and correctly.',
    price: 'From ₹3,999',
    features: ['All furniture types', 'Same-day available', 'Fully insured team', 'Quality guaranteed'],
  },
  {
    icon: '♻️',
    title: 'Furniture Disposal',
    description: 'Upgrading your old furniture? We\'ll responsibly dispose of your old pieces, recycling or donating wherever possible.',
    price: 'From ₹2,499',
    features: ['Eco-friendly disposal', 'Donation to charities', 'Recycling programs', 'Same-day removal'],
  },
  {
    icon: '🛡️',
    title: 'Extended Warranty',
    description: 'Protect your investment with our comprehensive 5-year extended warranty covering defects, structural issues and more.',
    price: 'From ₹1,499/year',
    features: ['5-year coverage', 'Structural defects', 'Free repairs', '24/7 support'],
  },
  {
    icon: '📐',
    title: 'Custom Furniture',
    description: 'Can\'t find exactly what you\'re looking for? We offer bespoke furniture design tailored to your exact specifications.',
    price: 'From ₹49,999',
    features: ['Custom dimensions', 'Material choice', 'Color matching', '8-10 week lead time'],
  },
];

export default function Services() {
  return (
    <main>
      <PageBanner
        title="Our Services"
        subtitle="Everything you need to create your dream home"
        breadcrumbs={['Home', 'Services']}
      />

      <section className="py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="section-subtitle dark:text-primary-light">What We Offer</span>
            <h2 className="section-title dark:text-white">Full Service Furniture Experience</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
              From design consultation to white-glove delivery, we offer everything you need to bring your furniture vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/40"
              >
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl">{service.title}</h3>
                  <span className="text-primary font-bold text-sm bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full whitespace-nowrap ml-3">{service.price}</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-5">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to Transform Your Home?</h2>
          <p className="text-green-200 text-lg mb-8">Book a free consultation with our expert designers today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
              Book Consultation
            </Link>
            <Link to="/shop" className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
