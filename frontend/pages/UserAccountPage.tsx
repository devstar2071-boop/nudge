import React, { useState, useEffect } from 'react';
import { fetchUserAccountData } from '../services/mockApi.ts';
import { UserProfile, PurchaseHistoryItem, PaginatedResponse } from '../types.ts';
import { ChevronLeft, ChevronRight, Package, CreditCard, MapPin, Settings } from 'lucide-react';

export const UserAccountPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [purchases, setPurchases] = useState<PaginatedResponse<PurchaseHistoryItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadAccountData = async () => {
      setLoading(true);
      try {
        const data = await fetchUserAccountData(undefined, page, 5); // 5 items per page for history
        setUser(data.profile);
        setPurchases(data.purchases);
      } catch (error) {
        console.error("Failed to load account data", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [page]);

  if (loading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-6">Hi, {user?.name.split(' ')[0]}</h2>
            <nav className="space-y-4">
              <a href="#" className="flex items-center text-black font-bold">
                <Package className="h-5 w-5 mr-3" />
                Purchase History
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-black">
                <CreditCard className="h-5 w-5 mr-3" />
                Payment Methods
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-black">
                <MapPin className="h-5 w-5 mr-3" />
                Saved Addresses
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-black">
                <Settings className="h-5 w-5 mr-3" />
                Account Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          
          {/* Beauty Profile Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold uppercase tracking-wider">Beauty Profile</h3>
              <button className="text-sm text-blue-600 hover:underline">Edit</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Skin Type</p>
                <p className="font-medium">{user?.beautyTraits.skinType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Skin Concerns</p>
                <p className="font-medium">{user?.beautyTraits.skinConcerns.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hair Type</p>
                <p className="font-medium">{user?.beautyTraits.hairType}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Loyalty Status</p>
                <p className="font-bold text-red-600">{user?.loyaltyTier}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Points Balance</p>
                <p className="font-bold text-xl">{user?.points}</p>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div>
            <h3 className="text-xl font-bold mb-6">Purchase History</h3>
            
            {loading && purchases ? (
              <div className="opacity-50 pointer-events-none transition-opacity">
                {/* Keep showing old data while loading new page, just faded */}
                <PurchaseList purchases={purchases.data} />
              </div>
            ) : purchases ? (
              <PurchaseList purchases={purchases.data} />
            ) : null}

            {/* Pagination Controls */}
            {purchases && purchases.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(page - 1) * purchases.limit + 1}</span> to <span className="font-medium">{Math.min(page * purchases.limit, purchases.total)}</span> of <span className="font-medium">{purchases.total}</span> results
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(purchases.totalPages, p + 1))}
                    disabled={page === purchases.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const PurchaseList: React.FC<{ purchases: PurchaseHistoryItem[] }> = ({ purchases }) => (
  <div className="space-y-4">
    {purchases.map((item) => (
      <div key={item.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white">
        <img 
          src={item.imageUrl} 
          alt={item.productName} 
          className="w-20 h-20 object-cover rounded-md bg-gray-100"
        />
        <div className="ml-6 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-900">{item.brand}</p>
              <p className="text-sm text-gray-600 mt-1">{item.productName}</p>
            </div>
            <p className="text-sm font-bold">${item.price.toFixed(2)}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Order #{item.id.toUpperCase()}</span>
            <span>Purchased on {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
