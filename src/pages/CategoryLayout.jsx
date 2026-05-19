import { Outlet, NavLink, useParams } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

export default function CategoryLayout() {
  const { type } = useParams();
  
  // Capitalize first letter
  const categoryName = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Category';

  const subLinks = [
    { to: `/category/${type}/shop`, label: 'Shop' },
    { to: `/category/${type}/services`, label: 'Services' },
    { to: `/category/${type}/contact`, label: 'Contact' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PageBanner 
        title={`${categoryName} Department`} 
        subtitle={`Explore products, services, and support for ${categoryName}`} 
        breadcrumbs={['Home', 'Categories', categoryName]} 
      />
      
      {/* Sub Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {subLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                    isActive 
                      ? 'border-primary text-primary dark:text-primary-light' 
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Render the specific sub-page (Shop, Services, or Contact) */}
      <div className="py-12">
        <Outlet context={{ categoryType: type, categoryName }} />
      </div>
    </main>
  );
}
