import { useOutletContext, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

export default function CategoryShop() {
  const { categoryType, categoryName } = useOutletContext();
  const { products, loading } = useProducts();
  const location = useLocation();
  
  // Parse query params (e.g., ?filter=women)
  const searchParams = new URLSearchParams(location.search);
  const filterQuery = searchParams.get('filter');
  
  // Filter the items for this specific category
  let categoryProducts = products.filter(p => p.category === categoryType);

  // Apply search/filter query if present
  if (filterQuery) {
    categoryProducts = categoryProducts.filter(p => p.name.toLowerCase().includes(filterQuery.toLowerCase()));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Segmenting logic for "Section by Collection"
  const renderSections = () => {
    if (categoryType === 'sofa' && !filterQuery) {
      const velvet = categoryProducts.filter(p => p.name.toLowerCase().includes('velvet'));
      const leather = categoryProducts.filter(p => p.name.toLowerCase().includes('leather'));
      const sectionals = categoryProducts.filter(p => p.name.toLowerCase().includes('sectional') || p.name.toLowerCase().includes('daybed') || p.name.toLowerCase().includes('futon'));
      const otherSofas = categoryProducts.filter(p => !velvet.includes(p) && !leather.includes(p) && !sectionals.includes(p));

      return (
        <div className="space-y-16">
          {velvet.length > 0 && <CollectionRow title="Premium Velvet Collection" icon="🛋️" products={velvet} />}
          {leather.length > 0 && <CollectionRow title="Classic Leather Series" icon="🤎" products={leather} />}
          {sectionals.length > 0 && <CollectionRow title="Sectionals & Daybeds" icon="✨" products={sectionals} />}
          {otherSofas.length > 0 && <CollectionRow title="Modern Sofas" icon="🪑" products={otherSofas} />}
        </div>
      );
    }

    if (categoryType === 'chair' && !filterQuery) {
      const lounge = categoryProducts.filter(p => p.name.toLowerCase().includes('lounge') || p.name.toLowerCase().includes('wingback'));
      const office = categoryProducts.filter(p => p.name.toLowerCase().includes('office') || p.name.toLowerCase().includes('desk'));
      const otherChairs = categoryProducts.filter(p => !lounge.includes(p) && !office.includes(p));

      return (
        <div className="space-y-16">
          {lounge.length > 0 && <CollectionRow title="Luxury Lounge Chairs" icon="🪑" products={lounge} />}
          {office.length > 0 && <CollectionRow title="Ergonomic Workspace" icon="💻" products={office} />}
          {otherChairs.length > 0 && <CollectionRow title="Accent & Leisure Chairs" icon="✨" products={otherChairs} />}
        </div>
      );
    }

    if (categoryType === 'table' && !filterQuery) {
      const dining = categoryProducts.filter(p => p.name.toLowerCase().includes('dining'));
      const coffee = categoryProducts.filter(p => p.name.toLowerCase().includes('coffee') || p.name.toLowerCase().includes('nesting') || p.name.toLowerCase().includes('side'));
      const study = categoryProducts.filter(p => p.name.toLowerCase().includes('desk') || p.name.toLowerCase().includes('study'));
      const otherTables = categoryProducts.filter(p => !dining.includes(p) && !coffee.includes(p) && !study.includes(p));

      return (
        <div className="space-y-16">
          {dining.length > 0 && <CollectionRow title="Solid Wood Dining Tables" icon="🍽️" products={dining} />}
          {coffee.length > 0 && <CollectionRow title="Coffee & Accent Tables" icon="☕" products={coffee} />}
          {study.length > 0 && <CollectionRow title="Study & Standing Desks" icon="📚" products={study} />}
          {otherTables.length > 0 && <CollectionRow title="Other Tables" icon="✨" products={otherTables} />}
        </div>
      );
    }

    if (categoryType === 'bed' && !filterQuery) {
      const platforms = categoryProducts.filter(p => p.name.toLowerCase().includes('platform') || p.name.toLowerCase().includes('queen') || p.name.toLowerCase().includes('canopy'));
      const mattresses = categoryProducts.filter(p => p.name.toLowerCase().includes('mattress'));
      const storageBeds = categoryProducts.filter(p => p.name.toLowerCase().includes('storage'));
      const otherBeds = categoryProducts.filter(p => !platforms.includes(p) && !mattresses.includes(p) && !storageBeds.includes(p));

      return (
        <div className="space-y-16">
          {platforms.length > 0 && <CollectionRow title="Premium Bed Frames" icon="🛏️" products={platforms} />}
          {mattresses.length > 0 && <CollectionRow title="Memory Foam Mattresses" icon="☁️" products={mattresses} />}
          {storageBeds.length > 0 && <CollectionRow title="Storage Beds" icon="📦" products={storageBeds} />}
          {otherBeds.length > 0 && <CollectionRow title="Bedroom Essentials" icon="✨" products={otherBeds} />}
        </div>
      );
    }

    if (categoryType === 'storage' && !filterQuery) {
      const cabinets = categoryProducts.filter(p => p.name.toLowerCase().includes('cabinet') || p.name.toLowerCase().includes('sideboard'));
      const shelves = categoryProducts.filter(p => p.name.toLowerCase().includes('shelf') || p.name.toLowerCase().includes('bookshelf'));
      const wardrobes = categoryProducts.filter(p => p.name.toLowerCase().includes('wardrobe') || p.name.toLowerCase().includes('dresser'));
      
      return (
        <div className="space-y-16">
          {cabinets.length > 0 && <CollectionRow title="Sideboards & Cabinets" icon="🚪" products={cabinets} />}
          {wardrobes.length > 0 && <CollectionRow title="Wardrobes & Dressers" icon="👗" products={wardrobes} />}
          {shelves.length > 0 && <CollectionRow title="Shelves & Bookcases" icon="📚" products={shelves} />}
        </div>
      );
    }

    // Default general layout (for all other categories or when a filter query is active)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {categoryProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % 8) * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      
      {/* Category Banner Title */}
      <div className="mb-8 md:mb-12 bg-gradient-to-r from-primary/5 to-transparent dark:from-slate-800/30 p-6 rounded-3xl border border-gray-100 dark:border-slate-850">
        <span className="text-accent font-extrabold text-[10px] uppercase tracking-widest bg-yellow-400/20 text-[#ab8100] px-2.5 py-1 rounded-md mb-2 inline-block">Department Shop</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">Shop {categoryName}</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1.5 text-xs sm:text-sm">
          Showing {categoryProducts.length} premium products in {categoryName} department.
        </p>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-slate-400">We are restocking our {categoryName} catalog shortly!</p>
        </div>
      ) : (
        renderSections()
      )}
    </div>
  );
}

// Reusable Sub-Section Collection Row Component
function CollectionRow({ title, icon, products }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wide">{title}</h3>
        <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-extrabold px-2.5 py-0.5 rounded-full ml-auto">
          {products.length} Items
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % 4) * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
