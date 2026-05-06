import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/mockApi.ts';
import { Product, PaginatedResponse } from '../types.ts';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export const ProductListingPage: React.FC = () => {
  const [productsData, setProductsData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(page, 20);
        setProductsData(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Skincare</h1>
          <p className="mt-2 text-sm text-gray-500">
            {productsData ? `${productsData.total} Results` : 'Loading...'}
          </p>
        </div>
        <div className="hidden sm:block">
          <select className="border-gray-300 rounded-md text-sm focus:ring-black focus:border-black py-2 pl-3 pr-10 border">
            <option>Top Rated</option>
            <option>Price High to Low</option>
            <option>Price Low to High</option>
            <option>New Arrivals</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/5] rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {productsData?.data.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group flex flex-col">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-gray-100 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                  {/* Quick Add Button Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-full bg-white text-black border border-black py-2 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
                      Quick Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-sm font-bold text-gray-900">{product.brand}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.name}</p>
                  <div className="mt-auto pt-2 flex items-center">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-black fill-current" />
                      <Star className="h-3 w-3 text-black fill-current" />
                      <Star className="h-3 w-3 text-black fill-current" />
                      <Star className="h-3 w-3 text-black fill-current" />
                      <Star className="h-3 w-3 text-gray-300 fill-current" />
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.reviewsCount})</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-full disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium">
                Page {page} of {productsData.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                disabled={page === productsData.totalPages}
                className="p-2 border border-gray-300 rounded-full disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
