import { motion } from 'framer-motion';

export default function PageBanner({ title, subtitle, breadcrumbs = [] }) {
  return (
    <section className="bg-gradient-to-br from-[#2d5239] to-[#3b6b4b] dark:from-slate-900 dark:to-slate-800 pt-36 pb-20 text-white relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-64 h-64 border border-white rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 border border-white rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-bold mb-3"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-green-200 dark:text-slate-300 text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        {breadcrumbs.length > 0 && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm text-green-300 dark:text-slate-400 mt-3"
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-green-500 dark:text-slate-600">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-white dark:text-white' : 'hover:text-white dark:hover:text-slate-200 cursor-pointer'}>
                  {crumb}
                </span>
              </span>
            ))}
          </motion.nav>
        )}
      </div>
    </section>
  );
}
