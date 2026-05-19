import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { blogs } from '../data/blogs';
import PageBanner from '../components/PageBanner';

const allCategories = ['All', ...new Set(blogs.map(b => b.category))];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = blogs.filter(b => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory;
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main>
      <PageBanner
        title="Our Blog"
        subtitle="Design tips, trends and inspiration for your home"
        breadcrumbs={['Home', 'Blog']}
      />

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search + filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
              <p className="text-gray-500">Try different search terms or categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {/* Featured first post */}
              {filtered.slice(0, 1).map(post => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row"
                >
                  <div className="md:w-1/2 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">{post.category}</span>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-snug">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mb-5">
                      <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm text-gray-600 font-medium">{post.author}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-400">{post.date}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-400">{post.readTime}</span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="btn-primary rounded-lg px-6 py-2.5 w-fit text-sm">
                      Read Article
                    </Link>
                  </div>
                </motion.article>
              ))}

              {/* Rest of posts */}
              {filtered.slice(1).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="overflow-hidden h-52">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">{post.category}</span>
                    <h3 className="font-display font-bold text-gray-900 text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={post.authorAvatar} alt={post.author} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-xs text-gray-500">{post.author}</span>
                      </div>
                      <span className="text-xs text-gray-400">{post.readTime}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
