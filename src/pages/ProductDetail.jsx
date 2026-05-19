import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { StarRating } from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const { products, loading, fetchProducts } = useProducts();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // Review Submissions
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Find product by id (checks both MongoDB string _id and static numeric id)
  const product = products.find(p => p.id?.toString() === id || p._id === id);

  const [selectedColor, setSelectedColor] = useState('');

  // Default color on load
  useEffect(() => {
    if (product) {
      setSelectedColor(product.availableColors?.[0] || product.accentColor || '');
    }
  }, [product]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-t-2 border-r-2 border-primary rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Loading showroom details...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="text-center">
        <div className="text-6xl mb-4">🛋️</div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Product Not Found</h2>
        <Link to="/shop" className="btn-primary rounded-xl mt-4 px-6 py-2.5">Back to Showroom</Link>
      </div>
    </div>
  );

  const related = products.filter(p => p.category === product.category && p._id !== product._id && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    const productWithColor = { ...product, selectedColor };
    for (let i = 0; i < qty; i++) addToCart(productWithColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!token) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }

    if (!commentInput.trim()) {
      setReviewError('Please enter a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id || product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Review submission failed');

      setReviewSuccess('Thank you! Your feedback has been posted successfully.');
      setCommentInput('');
      setRatingInput(5);
      setShowReviewForm(false);
      
      // Dynamic refresh
      fetchProducts();
    } catch (err) {
      setReviewError(err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = [product.image, product.image, product.image];

  return (
    <main className="pt-28 pb-20 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-3xl overflow-hidden shadow-xl mb-4 aspect-square border border-gray-100 dark:border-slate-700 relative bg-white dark:bg-slate-800">
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" 
                style={{ backgroundColor: selectedColor }}
              />
            </div>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-800 transition-colors ${i === activeImg ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {product.badge && (
              <span className="inline-block bg-primary text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              <p className="text-xs text-primary font-bold uppercase tracking-widest mt-2">{product.category}</p>
            </div>

            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-xs text-gray-500 dark:text-slate-400 font-bold">({product.reviews || 0} customer reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through dark:text-slate-500">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <p className="text-gray-600 dark:text-slate-350 text-sm leading-relaxed">{product.description}</p>

            {/* Colors */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Colors</h3>
              <div className="flex gap-2.5">
                {(product.availableColors || [product.accentColor || '#ab8100']).map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full border-4 transition-all transform hover:scale-110 cursor-pointer ${selectedColor === color ? 'border-primary scale-110 shadow-md' : 'border-white dark:border-slate-800 shadow-sm'}`}
                    style={{ backgroundColor: color }}
                    title={`Color choice ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Specs */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Premium Highlights</h3>
                <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {product.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                      <span className="text-primary font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 border-t dark:border-slate-800 pt-4">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${product.inStock ? 'text-emerald-600' : 'text-red-650'}`}>
                {product.inStock ? 'In Stock (Ready to Ship)' : 'Out of Stock'}
              </span>
            </div>

            {product.inStock && (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 font-bold text-gray-600 dark:text-slate-450 cursor-pointer">−</button>
                  <span className="px-4 py-2.5 font-bold text-sm text-gray-900 dark:text-white min-w-[2.5rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 font-bold text-gray-600 dark:text-slate-450 cursor-pointer">+</button>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-300 cursor-pointer ${added ? 'bg-emerald-600' : 'bg-primary hover:bg-[#213e2b] shadow-md shadow-primary/10'}`}
                >
                  {added ? '✓ Added to Cart!' : 'Add to Cart Bag'}
                </motion.button>
              </div>
            )}

          </motion.div>
        </div>

        {/* Dynamic Reviews Section */}
        <div className="mt-24 border-t border-gray-100 dark:border-slate-800 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Customer Experiences</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-extrabold text-primary">{product.rating || '0.0'}</div>
                <div>
                  <StarRating rating={product.rating || 5} />
                  <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5">Calculated from {product.reviews || 0} buyer reviews</p>
                </div>
              </div>
            </div>

            {token ? (
              <button 
                onClick={() => { setShowReviewForm(!showReviewForm); setReviewSuccess(''); setReviewError(''); }}
                className="btn-primary rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            ) : (
              <div className="text-xs font-bold text-gray-500 bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-xl border dark:border-slate-700">
                🔑 Please <Link to="/login" className="text-primary hover:underline">Log In</Link> to share your experience.
              </div>
            )}
          </div>

          {/* Interactive Review Box */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-10 max-w-xl bg-white dark:bg-slate-800 border border-gray-105 dark:border-slate-700 rounded-3xl p-6 shadow-lg"
              >
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Share Your Rating</h4>
                  
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rating Score</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(score => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setRatingInput(score)}
                          className={`w-9 h-9 rounded-xl border transition-all text-sm font-bold ${ratingInput >= score ? 'bg-yellow-450 border-yellow-450 text-white' : 'border-gray-200 text-gray-400 hover:border-yellow-400'}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Comment</label>
                    <textarea 
                      rows={4}
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      placeholder="Detail your thoughts on materials, solid-wood quality, and delivery comfort..."
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-750 rounded-xl px-4 py-3 text-xs dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {reviewError && <p className="text-xs text-red-500 font-bold">⚠️ {reviewError}</p>}

                  <button
                    disabled={submittingReview}
                    className="btn-primary py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {submittingReview ? 'Posting...' : 'Post Experience'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {reviewSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
              ✨ {reviewSuccess}
            </div>
          )}

          {/* Experiences list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {product.reviewsList && product.reviewsList.length > 0 ? (
              product.reviewsList.map((rev) => (
                <motion.div
                  key={rev.id || rev._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-gray-105 dark:border-slate-750 font-sans"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">{rev.user}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{rev.date}</p>
                    </div>
                    <StarRating rating={rev.rating} />
                  </div>
                  <p className="text-gray-650 dark:text-slate-300 text-xs italic leading-relaxed">"{rev.comment}"</p>
                </motion.div>
              ))
            ) : (
              <p className="col-span-2 text-center text-xs text-gray-500 dark:text-slate-450 italic py-6">
                No reviews yet. Be the first to share your showroom experience!
              </p>
            )}
          </div>
        </div>

        {/* Related Showcase */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center md:text-left">Complementary Showcases</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p => <ProductCard key={p.id || p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
