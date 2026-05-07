import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Banner */}
      <div className="bg-black text-white text-xs text-center py-2 font-medium tracking-wide">
        FREE SHIPPING ON ALL ORDERS OVER $50. <span className="underline cursor-pointer">DETAILS</span>
      </div>

      {/* Main Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu */}
            <div className="flex items-center md:hidden">
              <button className="p-2 -ml-2 text-gray-600 hover:text-black">
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none md:justify-start">
              <Link to="/" className="text-2xl font-bold tracking-widest uppercase">
                Sephora
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black sm:text-sm transition-colors"
                  placeholder="Search for products, brands, or Sephora Lens insights..."
                />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link 
                to="/account" 
                className={`flex flex-col items-center text-xs font-medium ${location.pathname === '/account' ? 'text-black' : 'text-gray-600 hover:text-black'}`}
              >
                <User className="h-6 w-6 mb-1" />
                <span className="hidden md:block text-nowrap">Hi Beautiful</span>
              </Link>
              <button className="flex flex-col items-center text-xs font-medium text-gray-600 hover:text-black relative">
                <ShoppingBag className="h-6 w-6 mb-1" />
                <span className="hidden md:block">Basket</span>
                <span className="absolute top-0 right-0 md:right-2 -mt-1 -mr-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex space-x-8 py-3 text-sm font-medium text-gray-800">
              <li className="hover:underline cursor-pointer hover:text-black"><Link to="/products">Brands</Link></li>
              <li className="hover:underline cursor-pointer hover:text-black"><Link to="/products">Makeup</Link></li>
              <li className="hover:underline cursor-pointer hover:text-black"><Link to="/products">Skincare</Link></li>
              <li className="hover:underline cursor-pointer hover:text-black"><Link to="/products">Hair</Link></li>
              <li className="hover:underline cursor-pointer hover:text-black"><Link to="/products">Fragrance</Link></li>
              <li className="hover:underline cursor-pointer hover:text-black"><Link to="/products">Tools & Brushes</Link></li>
              <li className="text-red-600 hover:underline cursor-pointer"><Link to="/products">Sale</Link></li>
              <li className="flex items-center text-purple-600 hover:underline cursor-pointer ml-auto">
                <Link to="/products" className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Sephora Lens AI
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">About Sephora</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>About Us</li>
              <li>Careers</li>
              <li>Social Impact</li>
              <li>Affiliates</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">My Sephora</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Beauty Insider</li>
              <li>Community Profile</li>
              <li>Order Status</li>
              <li>Purchase History</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Customer Service</li>
              <li>Returns & Exchanges</li>
              <li>Delivery Information</li>
              <li>Track Order</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Sephora Lens™</h3>
            <p className="text-sm text-gray-400 mb-4">
              Experience personalized beauty translation powered by Google AI.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Gemini</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
