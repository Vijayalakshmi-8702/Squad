import { motion } from 'framer-motion';

const brands = [
  'IKEA Style', 'Pottery Barn', 'West Elm', 'Herman Miller', 'Knoll', 'Restoration Hardware',
];

export default function Brands() {
  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-8 font-semibold">
          Trusted by leading brands
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
          {brands.map((brand, i) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-gray-300 dark:text-slate-700 hover:text-gray-500 dark:hover:text-slate-500 transition-colors duration-200 font-bold text-lg tracking-tight cursor-default"
            >
              {brand}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
