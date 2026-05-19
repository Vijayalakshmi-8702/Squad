const categoryBaseData = {
  sofa: {
    basePrice: 24999,
    items: [
      { name: 'Luxury Velvet Sofa', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', desc: 'Elegant velvet sofa crafted with premium wood frame and high-density foam cushions.' },
      { name: 'L-Shaped Sectional Sofa', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80', desc: 'Spacious modular sectional sofa, perfect for family living rooms.' },
      { name: 'Chesterfield Leather Sofa', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', desc: 'Classic Chesterfield design in premium top-grain leather.' },
      { name: 'Minimalist Daybed Sofa', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', desc: 'Sleek daybed that serves as a beautiful accent sofa and guest bed.' },
      { name: 'Modern Futon Sleeper', image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=80', desc: 'Convertible modern futon chair that transforms into a bed.' }
    ]
  },
  chair: {
    basePrice: 5999,
    items: [
      { name: 'Nordic Lounge Chair', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80', desc: 'Ergonomic lounge chair with solid ash wood base.' },
      { name: 'Ergonomic Office Chair', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', desc: 'Premium desk chair with adjustable lumbar support and mesh back.' },
      { name: 'Wingback Accent Chair', image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&q=80', desc: 'Classic wingback design in rich fabric upholstery.' },
      { name: 'Rattan Armchair', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80', desc: 'Bohemian-style natural rattan chair with white cushion.' },
      { name: 'Rocking Leisure Chair', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80', desc: 'Relaxing nursery rocking chair in modern design.' }
    ]
  },
  table: {
    basePrice: 8999,
    items: [
      { name: 'Solid Oak Dining Table', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80', desc: 'Charming rustic solid oak wood dining table.' },
      { name: 'Walnut Coffee Table', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80', desc: 'Mid-century modern coffee table with walnut finish and open storage.' },
      { name: 'Electric Standing Desk', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', desc: 'Height-adjustable standing desk with electric memory settings.' },
      { name: 'Glass Top Study Table', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', desc: 'Minimalist study desk with glass work surface and metal legs.' },
      { name: 'Nesting Side Tables', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', desc: 'Set of 3 space-saving metal and wood nesting accent tables.' }
    ]
  },
  bed: {
    basePrice: 19999,
    items: [
      { name: 'King Platform Bed', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', desc: 'Solid wood platform bed with low-profile aesthetic.' },
      { name: 'Wooden Canopy Bed', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80', desc: 'Dramatic canopy frame bed in black powder-coated steel.' },
      { name: 'Tufted Queen Bed', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', desc: 'Elegant linen-upholstered bed frame with button tufting.' },
      { name: 'Single Storage Bed', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', desc: 'Single bed featuring under-bed pullout drawers for extra storage.' },
      { name: 'Memory Foam Mattress', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80', desc: '10-inch cooling gel memory foam mattress for supportive sleep.' }
    ]
  },
  storage: {
    basePrice: 7999,
    items: [
      { name: 'Minimalist Bookshelf', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80', desc: 'Modern 5-tier open bookcase for books and display decor.' },
      { name: 'Oak Sideboard Cabinet', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80', desc: 'Sturdy wooden credenza cabinet with sliding doors.' },
      { name: 'Modern Wardrobe Closet', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', desc: 'Double door wooden wardrobe closet with hanging rail and drawers.' },
      { name: '6-Drawer Dresser Chest', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80', desc: 'Wide dresser chest in rustic oak finish.' },
      { name: 'Floating Wall Shelves', image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&q=80', desc: 'Set of 3 floating shelves in rustic pine finish.' }
    ]
  }
};

const generateMockProducts = () => {
  const generated = [];
  let idCounter = 1;

  Object.keys(categoryBaseData).forEach(category => {
    const data = categoryBaseData[category];
    
    data.items.forEach((item, index) => {
      const price = data.basePrice + Math.floor((index * 137) % (data.basePrice * 0.7));
      
      generated.push({
        _id: `mock_prod_${idCounter}`,
        id: idCounter,
        name: item.name,
        category,
        price,
        originalPrice: Math.round(price / 0.85),
        rating: parseFloat((4.2 + ((index * 3) % 8) / 10).toFixed(1)),
        reviews: 45 + ((index * 17) % 380),
        image: item.image,
        badge: index === 0 ? 'Sale' : index === 2 ? 'New' : null,
        description: item.desc,
        features: ['Premium Quality', 'Home Delivery Available', '100% Authentic', '1 Year Warranty'],
        inStock: index !== 4, // 1 out of 5 out of stock
        likesCount: 0,
        isNew: index === 2,
        isFeatured: index === 0 || index === 1,
        reviewsList: []
      });
      idCounter++;
    });
  });

  return generated;
};

export const products = generateMockProducts();

export const categories = [
  { id: "all", name: "All Products" },
  { id: "sofa", name: "Sofas & Sectionals" },
  { id: "chair", name: "Chairs & Recliners" },
  { id: "table", name: "Dining & Coffee Tables" },
  { id: "bed", name: "Beds & Mattresses" },
  { id: "storage", name: "Storage & Bookshelves" }
];
