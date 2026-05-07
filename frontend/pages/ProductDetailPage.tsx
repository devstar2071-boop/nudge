import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById, fetchUserAccountData } from '../services/mockApi.ts';
import { generateSephoraLensNudges } from '../services/geminiService.ts';
import { Product, UserProfile, LensNudge } from '../types.ts';
import { SephoraLensOverlay } from '../components/SephoraLensOverlay.tsx';
import { Star, Heart, Sparkles, Info } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [nudges, setNudges] = useState<LensNudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [lensLoading, setLensLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch product and mock user concurrently
        const [prodData, userData] = await Promise.all([
          fetchProductById(id || 'prod-0'),
          fetchUserAccountData(undefined, 1, 1) // Just need profile, will use cookie if available
        ]);
        
        if (prodData) {
          setProduct(prodData);
          setSelectedVariant(prodData.variants[0]?.id || '');
        }
        if (userData) {
          setUser(userData.profile);
        }
      } catch (error) {
        console.error("Error loading PDP data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  // Trigger Sephora Lens AI when product and user are loaded
  useEffect(() => {
    const fetchLensInsights = async () => {
      if (product && user) {
        setLensLoading(true);
        try {
          const generatedNudges = await generateSephoraLensNudges(user, product);
          setNudges(generatedNudges);
        } catch (error) {
          console.error("Failed to generate lens nudges", error);
        } finally {
          setLensLoading(false);
        }
      }
    };

    fetchLensInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, user?.id]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Loading Product...</p>
        </div>
      </div>
    );
  }

  const activeVariant = product.variants.find(v => v.id === selectedVariant) || product.variants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dynamic Breadcrumbs */}
      {product.categories && product.categories.length > 0 ? (
        <nav className="text-xs text-gray-500 mb-8 flex flex-wrap items-center space-x-2">
          {product.categories[0].slug.split('/').map((part, idx, arr) => (
            <React.Fragment key={idx}>
              <span className="capitalize">{part.replace(/-/g, ' ')}</span>
              {idx < arr.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </nav>
      ) : (
        <nav className="text-xs text-gray-500 mb-8 flex space-x-2">
          <span className="text-black font-medium">{product.name}</span>
        </nav>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 hover:underline cursor-pointer">
            {product.brand}
          </h1>
          <h2 className="text-2xl text-gray-800 mt-1">{product.name}</h2>
          
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-black fill-current' : 'text-gray-300 fill-current'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">{product.reviewsCount} reviews</span>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-4">
            ${activeVariant?.price ? activeVariant.price.toFixed(2) : (product.price ? product.price.toFixed(2) : '0.00')}
          </p>

          <p 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className={`text-sm text-gray-600 mt-4 leading-relaxed cursor-pointer hover:text-gray-900 transition-colors ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}
            title={!isDescriptionExpanded ? "Click to see more" : "Click to see less"}
          >
            {product.description}
          </p>

          {/* Variants */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Size</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`px-4 py-2 border text-sm rounded-sm transition-colors ${
                    selectedVariant === variant.id 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-4">
            <button className="flex-1 bg-red-600 text-white py-3 px-8 rounded-full font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
              Add to Basket
            </button>
            <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              <Heart className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Sephora Lens Banner */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-purple-600 p-1.5 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-purple-200 animate-bounce" style={{ animationDuration: '3s' }}>
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-purple-900 flex items-center uppercase tracking-tight">
                  Sephora Lens™ Active
                  {lensLoading && <span className="ml-2 text-[10px] font-normal text-purple-600 animate-pulse">Analyzing...</span>}
                </h3>
                <p className={`text-[10px] text-purple-800 mt-0.5 ${lensLoading ? 'animate-pulse' : ''}`}>
                  Relevant to your <strong>{user?.beautyTraits.skinType}</strong> skin.
                </p>
              </div>
            </div>

            {!lensLoading && nudges.length > 0 && (
              <div className="mt-2 relative">
                {/* Increased virtual space to pt-80 -mt-80 (320px) to prevent popover clipping */}
                <div className="flex flex-nowrap overflow-x-auto pt-80 -mt-80 pb-4 gap-3 scrollbar-hide -mx-1 px-1 items-end">
                  {nudges.map((nudge, idx) => (
                    <div 
                      key={idx} 
                      className="flex-shrink-0 w-[65%] sm:w-[45%] bg-white border border-purple-200 rounded-xl px-3 py-2 shadow-sm hover:border-purple-400 transition-colors text-center text-[10px]"
                    >
                      <SephoraLensOverlay 
                        ingredient={nudge.ingredient} 
                        nudge={nudge}
                        productId={product.id}
                        userId={user?.id || 'unknown'}
                        displayText={nudge.framingQuestion}
                        popoverPosition={idx === 0 ? 'left' : (idx === nudges.length - 1 ? 'right' : 'center')}
                      />
                    </div>
                  ))}
                </div>
                {/* Visual fade effect for scrolling indication */}
                <div className="absolute right-0 bottom-4 w-12 h-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none"></div>
              </div>
            )}
          </div>

          {/* Ingredients Section with Lens Integration */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wider">
              Ingredients
              <Info className="h-4 w-4 text-gray-400 ml-2" />
            </h3>
            
            <div className="text-xs text-gray-600 leading-relaxed">
              {product.ingredients.map((ingredient, index) => {
                // Check if this ingredient has a nudge
                const nudge = nudges.find(n => 
                  n.ingredient.toLowerCase() === ingredient.toLowerCase() ||
                  ingredient.toLowerCase().includes(n.ingredient.toLowerCase())
                );

                return (
                  <React.Fragment key={index}>
                    <SephoraLensOverlay 
                      ingredient={ingredient} 
                      nudge={nudge}
                      productId={product.id}
                      userId={user?.id || 'unknown'}
                    />
                    {index < product.ingredients.length - 1 ? ', ' : '.'}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
