import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { categories } from '../data/products';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import PageBanner from '../components/PageBanner';

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function Shop() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('default');

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [products, search, activeCategory, sort]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <main>
      <PageBanner
        title="Shop Our Collection"
        subtitle="Premium furniture for every room"
        breadcrumbs={['Home', 'Shop']}
      />

      <section className="py-12 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary bg-white dark:bg-slate-800 dark:text-white shadow-sm transition-colors"
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary bg-white dark:bg-slate-800 shadow-sm text-gray-700 dark:text-slate-300 transition-colors"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar categories */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Categories</h3>
                <ul className="space-y-1">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          activeCategory === cat.id
                            ? 'bg-primary text-white font-semibold'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary-light'
                        }`}
                      >
                        {cat.name}
                        <span className={`float-right text-xs ${activeCategory === cat.id ? 'text-green-200' : 'text-gray-400 dark:text-slate-500'}`}>
                          {cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Mobile category pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 w-full">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="flex-1">
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="btn-primary mt-6 rounded-lg">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filtered.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
