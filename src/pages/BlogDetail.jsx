import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogs } from '../data/blogs';

export default function BlogDetail() {
  const { id } = useParams();
  const post = blogs.find(b => b.id === Number(id));

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <Link to="/blog" className="btn-primary rounded-lg">Back to Blog</Link>
      </div>
    </div>
  );

  const related = blogs.filter(b => b.id !== post.id).slice(0, 3);

  return (
    <main className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{post.title}</span>
        </nav>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">{post.category}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mb-8">
            <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
              <p className="text-xs text-gray-500">{post.date} · {post.readTime}</p>
            </div>
          </div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl overflow-hidden shadow-xl mb-10"
        >
          <img src={post.image} alt={post.title} className="w-full h-72 md:h-96 object-cover" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <p className="text-xl text-gray-600 leading-relaxed mb-6 font-medium">{post.excerpt}</p>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
            {post.content}
          </div>
        </motion.div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
          {['Furniture', 'Interior Design', post.category, 'Home Decor'].map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <h2 className="section-title mb-8">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map((rPost, i) => (
            <motion.article
              key={rPost.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="overflow-hidden h-48">
                <img src={rPost.image} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span className="text-xs text-primary font-semibold">{rPost.category}</span>
                <h3 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/blog/${rPost.id}`}>{rPost.title}</Link>
                </h3>
                <p className="text-xs text-gray-500">{rPost.date} · {rPost.readTime}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
  );
}
