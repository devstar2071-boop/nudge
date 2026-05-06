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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch product and mock user concurrently
        const [prodData, userData] = await Promise.all([
          fetchProductById(id || 'prod-0'),
          fetchUserAccountData('u123', 1, 1) // Just need profile
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
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 mb-8 flex space-x-2">
        <span>Skincare</span>
        <span>/</span>
        <span>Moisturizers</span>
        <span>/</span>
        <span className="text-black font-medium">{product.name}</span>
      </nav>

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
          
          <div className="flex items-center mt-4">
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

          <p className="text-2xl font-bold text-gray-900 mt-6">
            ${activeVariant?.price ? activeVariant.price.toFixed(2) : (product.price ? product.price.toFixed(2) : '0.00')}
          </p>

          <p className="text-sm text-gray-600 mt-6 leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Size</h3>
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
          <div className="mt-8 flex space-x-4">
            <button className="flex-1 bg-red-600 text-white py-3 px-8 rounded-full font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
              Add to Basket
            </button>
            <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              <Heart className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Sephora Lens Banner */}
          <div className="mt-12 bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 p-2 rounded-full flex-shrink-0 mt-1">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-purple-900 flex items-center">
                  Sephora Lens™ Active
                  {lensLoading && <span className="ml-2 text-xs font-normal text-purple-600 animate-pulse">Analyzing profile...</span>}
                </h3>
                <p className="text-xs text-purple-800 mt-1">
                  We've highlighted ingredients below that are specifically relevant to your <strong>{user?.beautyTraits.skinType}</strong> skin profile. Hover over them to learn why.
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients Section with Lens Integration */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              Ingredients
              <Info className="h-4 w-4 text-gray-400 ml-2" />
            </h3>
            
            <div className="text-sm text-gray-600 leading-loose">
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
