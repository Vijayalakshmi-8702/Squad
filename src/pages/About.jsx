import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

const team = [
  { name: 'Amanda Clarke', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
  { name: 'Marcus Lee', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
  { name: 'Sophia Patel', role: 'Lead Interior Consultant', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80' },
  { name: 'James Watson', role: 'Operations Manager', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
];

const milestones = [
  { year: '2010', event: 'FurniShopsy founded in Noida with a small flagship showroom.' },
  { year: '2013', event: 'Expanded to 5 showrooms across North India.' },
  { year: '2016', event: 'Launched high-performance online store reaching customers nationwide.' },
  { year: '2019', event: 'Crossed 10,000 happy premium loyalty members milestone.' },
  { year: '2022', event: 'Introduced sustainable solid wood collections and bespoke custom styling.' },
  { year: '2025', event: 'Serving 50,000+ happy homes with express door-step deliveries.' },
];

export default function About() {
  return (
    <main>
      <PageBanner
        title="About FurniShopsy"
        subtitle="Our story, mission and the people behind the brand"
        breadcrumbs={['Home', 'About']}
      />

      {/* Story */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="section-subtitle dark:text-primary-light">Our Story</span>
            <h2 className="section-title dark:text-white">Crafting Beautiful Lifestyles Since 2010</h2>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
              FurniShopsy was born from a simple belief: everyone deserves premium, high-quality furniture options for their home and office. Founded in 2010, we started with a boutique showroom and a passionate team committed to bringing elegant sofas, ergonomic chairs, solid wood tables, and high-end decor to everyone.
            </p>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
              Over 15 years, we've grown into one of the most trusted online furniture brands, serving thousands of customers across India and globally. Our products are selected with a focus on certified solid wood, high-density comfort materials, and contemporary aesthetic designs.
            </p>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
              From living room setups to state-of-the-art office furniture, every item that leaves our warehouse has been carefully inspected to exceed your expectations.
            </p>
            <Link to="/shop" className="btn-primary rounded-lg px-8 py-3.5">
              Shop Our Collection
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" alt="Showroom" className="rounded-2xl shadow-lg h-56 w-full object-cover border-4 border-white dark:border-slate-800" />
              <img src="https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80" alt="Chair" className="rounded-2xl shadow-lg h-56 w-full object-cover mt-8 border-4 border-white dark:border-slate-800" />
              <img src="https://images.unsplash.com/photo-1530018607912-eff2df114f11?w=400&q=80" alt="Table" className="rounded-2xl shadow-lg h-56 w-full object-cover -mt-8 border-4 border-white dark:border-slate-800" />
              <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80" alt="Bedroom" className="rounded-2xl shadow-lg h-56 w-full object-cover border-4 border-white dark:border-slate-800" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary dark:bg-slate-800 text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '50K+', label: 'Happy Homes' },
            { num: '500+', label: 'Furniture Designs' },
            { num: '15+', label: 'Years Experience' },
            { num: '20+', label: 'Cities Served' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-4xl font-bold font-display mb-2">{s.num}</div>
              <div className="text-green-200 dark:text-primary-light text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-subtitle dark:text-primary-light">Our Journey</span>
            <h2 className="section-title dark:text-white">Milestones That Define Us</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-center gap-8 mb-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="inline-block bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                    <span className="text-primary dark:text-primary-light font-bold">{m.year}</span>
                    <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">{m.event}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-slate-800 shadow-md z-10" />
                <div className="w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-subtitle dark:text-primary-light">Our Team</span>
            <h2 className="section-title dark:text-white">Meet The People Behind FurniShopsy</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4 shadow-md border border-gray-100 dark:border-slate-700">
                  <img src={member.img} alt={member.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{member.name}</h3>
                <p className="text-primary dark:text-primary-light text-sm font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
