import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { blogs } from '../data/blogs';

export default function BlogSection() {
  const recent = blogs.slice(0, 3);

  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="section-subtitle dark:text-primary-light">From The Blog</span>
          <h2 className="section-title dark:text-white">Latest Articles & Tips</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Stay up to date with the latest trends in interior design, furniture care and home decor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recent.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-slate-700"
            >
              <div className="relative overflow-hidden h-52">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img src={post.authorAvatar} alt={post.author} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs text-gray-500 dark:text-slate-400">{post.author}</span>
                  <span className="text-gray-300 dark:text-slate-600">·</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{post.date}</span>
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{post.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/blog" className="btn-outline text-base px-8 py-3 rounded-lg">
            View All Articles
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
