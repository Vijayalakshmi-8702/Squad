import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CategoryServices() {
  const { categoryType, categoryName } = useOutletContext();

  const servicesMap = {
    sofa: [
      { title: 'Custom Upholstery Care', desc: 'Premium velvet and leather care, styling, and stain removal services.', icon: '🧼' },
      { title: 'Professional Assembly', desc: 'Expert in-home assembly and perfect alignment of sectional layouts.', icon: '🛠️' },
      { title: 'Cushion Re-stuffing', desc: 'Restore original plush comfort with high-density foam refills.', icon: '🛋️' }
    ],
    chair: [
      { title: 'Ergonomic Adjustment', desc: 'Personalized adjustment settings for peak lumbar and headrest comfort.', icon: '🪑' },
      { title: 'Gas Lift & Swivel Repair', desc: 'Fast replacements of pneumatic cylinders and high-durability office wheels.', icon: '🔧' },
      { title: 'Leather Conditioning', desc: 'Organic wax coating to keep your premium executive leather chair gleaming.', icon: '✨' }
    ],
    table: [
      { title: 'Hardwood Scratch Polishing', desc: 'Erase surface lines and restore the warm, rich grain of solid wood.', icon: '🪵' },
      { title: 'Custom Sizing Consultation', desc: 'Custom workspace alignment and dining room layout planning.', icon: '📐' },
      { title: 'Stability Tune-Up', desc: 'Leg leveling and high-strength bracket fastening for heavy marble tops.', icon: '⚙️' }
    ],
    bed: [
      { title: 'Zero-Noise Tightening', desc: 'Frame optimization to guarantee complete silence during movement.', icon: '🔩' },
      { title: 'Mattress Sanitization', desc: 'Deep-steam organic cleaning to eliminate microscopic dust and mites.', icon: '🛏️' },
      { title: 'Canopy Installation', desc: 'Professional mounting of steel and wood canopy overhead frames.', icon: '✨' }
    ],
    storage: [
      { title: 'Child-Safe Wall Anchoring', desc: 'Complimentary high-strength wall anchoring for tall books and cabinets.', icon: '🛡️' },
      { title: 'Silent Hinge Tuning', desc: 'Dampener installations for absolute soft-closing drawer action.', icon: '🗄️' },
      { title: 'Shelf Level Adjustment', desc: 'Custom configuration of modular shelves to fit all sizes of displays.', icon: '📐' }
    ]
  };

  const services = servicesMap[categoryType] || [
    { title: 'General Support', desc: 'Help with your purchase.', icon: '🎧' },
    { title: 'Extended Warranty', desc: 'Protect your items longer.', icon: '🛡️' },
    { title: 'Returns', desc: 'Easy 30-day return process.', icon: '📦' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Services for {categoryName}</h2>
        <p className="text-gray-500 dark:text-slate-400">We offer specialized after-sales support and premium services specifically tailored for your {categoryName.toLowerCase()} purchases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 text-center group"
          >
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">{service.desc}</p>
            <button className="text-primary font-bold hover:text-primary-dark transition-colors">Book Now →</button>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need something else?</h3>
        <p className="text-gray-600 dark:text-slate-300 mb-6 max-w-xl mx-auto">If you don't see the service you need, reach out to our dedicated {categoryName} support team.</p>
        <button className="btn-primary py-3 px-8 rounded-xl">View Full Service Catalog</button>
      </div>
    </div>
  );
}
