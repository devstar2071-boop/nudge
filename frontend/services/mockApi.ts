import { UserProfile, PurchaseHistoryItem, PaginatedResponse, Product } from '../types.ts';
import { getCookie, setCookie } from './cookieUtils.ts';

// --- CONFIGURATION ---
// Points to the Node.js Express server (server/index.ts)
const BACKEND_API_URL = (typeof process !== 'undefined' && process.env && process.env.BACKEND_API_URL) ? process.env.BACKEND_API_URL : '/api';
const USER_COOKIE_NAME = 'nudge_user_id';

// --- FALLBACK MOCK DATA ---
// Used if the backend API is not reachable, ensuring the prototype still works.
const FALLBACK_USER: UserProfile = {
  id: 'guest_u123',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  beautyTraits: {
    skinType: 'Dry',
    skinConcerns: ['Redness', 'Fine Lines', 'Dullness'],
    hairType: 'Wavy',
  },
  loyaltyTier: 'Rouge',
  points: 1250,
};

const MOCK_PURCHASES: PurchaseHistoryItem[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `order-${i}`,
  date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
  productName: `Hydrating Serum ${i + 1}`,
  brand: i % 2 === 0 ? 'The Ordinary' : 'Drunk Elephant',
  price: Math.floor(Math.random() * 80) + 15,
  imageUrl: `https://picsum.photos/seed/prod${i}/100/100`,
})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const FALLBACK_BQ_PRODUCT = {
  "createdAt": "2026-05-05 16:15:21 UTC",
  "account": "hongkong",
  "productType": "Product",
  "productSubType": "Product",
  "productId": "104558",
  "name": "Vinoperfect Dark Spot Brightening Set",
  "name_en": "Vinoperfect Dark Spot Brightening Set",
  "slug": "caudalie-vinoperfect-dark-spot-brightening-set",
  "productHeading": "60.00ML",
  "brand": {
    "name": "Caudalie",
    "name_en": "Caudalie",
    "name_non_en": "Caudalie",
    "hidden": false,
    "slug": "caudalie",
    "consignment": false,
    "brandId": "301"
  },
  "productImages": [],
  "variants": [
    {
      "slug": "60ml",
      "uri": "/products/caudalie-vinoperfect-dark-spot-brightening-set/v/60ml",
      "createdAt": "2026-05-05 16:15:22 UTC",
      "publishedAt": "2026-05-05 16:15:22 UTC",
      "updatedAt": "2026-05-05 17:00:40 UTC",
      "variantId": "243575",
      "name": "60ML",
      "name_en": "60ML",
      "upcs": [
        "3522933005503"
      ],
      "state": "published",
      "hasSwatch": false,
      "sap": {
        "reference": "799059"
      },
      "prices": {
        "sellingPrices": [
          { "store": "Singapore", "has_markdown": false, "currency": "SGD" },
          { "store": "Australia", "has_markdown": false, "currency": "AUD" },
          { "store": "Hong Kong", "price_after_markdown": 510, "has_markdown": false, "price": 510, "currency": "HKD" }
        ]
      },
      "iris": {
        "ean": "3522933005503"
      },
      "images": [
        {
          "index": "1",
          "isPrimary": true,
          "urls": {
            "closeup": "https://s3-ap-southeast-1.amazonaws.com/catrina-production-ap-southeast-1/images/product_images/1_Product_3522933005503-Caudalie-Vinoperfect-Dark-Spot-Brigh_aa687a9aff20d33f0cee985141a217b73bae7483_1777949319.png?o=clean-planet-aware"
          }
        }
      ],
      "reviews": {
        "unique_reviewers": "0",
        "totals": "0",
        "allReviews": []
      },
      "features": {
        "isVirtualArtist": false,
        "filters": []
      },
      "launch_statuses": [],
      "launch_configs": []
    }
  ],
  "categories": [],
  "unavailableCountries": "",
  "sample": {
    "reference": {}
  },
  "state": "published",
  "content": {
    "en": {
      "name": "Vinoperfect Dark Spot Brightening Set",
      "description": "A highly natural day and night routine that corrects the appearance of all types of dark spots (sun, acne, melasma, age) and brightens the complexion.",
      "benefits": "All the products in this routine contains Viniferine, a Caudalie patented ingredient derived from vine sap.",
      "howTo": "Use twice a day, morning and evening, on cleansed skin.",
      "ingredients": "Vinoperfect Brightening Dark Spots Serum: AQUA/WATER/EAU, BUTYLENE GLYCOL, GLYCERIN, COCOCAPRYLATE/CAPRATE, SQUALANE, PALMITOYL GRAPEVINE SHOOT EXTRACT, POLYGLYCERYL-3 DISTEARATE, BISABOLOL, GLYCERYL STEARATE, XANTHAN GUM, CAPRYLYL GLYCOL, MICROCRYSTALLINE CELLULOSE, POLYACRYLATE, CROSSPOLYMER-6, POTASSIUM SORBATE, GLYCERYL STEARATE CITRATE, CITRIC ACID, SODIUM PHYTATE, SODIUM HYDROXIDE, PARFUM (FRAGRANCE).(243/032) \n\nVinoperfect Dark Spot Niacinamide Moisturizer: AQUA/WATER/EAU, GLYCERIN, DICAPRYLYL CARBONATE, SQUALANE, OCTYLDODECYL MYRISTATE, C20-22 ALKYL PHOSPHATE, C20-22 ALCOHOLS, PALMITOYL GRAPEVINE SHOOT EXTRACT, CITRUS AURANTIUM AMARA (BITTER ORANGE) FLOWER WATER, BISABOLOL, SACCHARIDE ISOMERATE, NIACINAMIDE, CARBOMER, SILICA, CI 77891 (TITANIUM DIOXIDE), ETHYLHEXYLGLYCERIN, MICA, SODIUM HYDROXIDE, SODIUM BENZOATE, PAEONIA LACTIFLORA ROOT EXTRACT, SODIUM HYALURONATE, SODIUM PHYTATE, CITRIC ACID, TIN OXIDE, SODIUM CITRATE, TOCOPHEROL, POTASSIUM SORBATE, PARFUM (FRAGRANCE).(238/030)"
    },
    "hk": {}
  },
  "features": {
    "isFindation": false,
    "filters": []
  }
};

// --- DATA TRANSFORMERS ---

const stripHtml = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags and replace common entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

const parseIngredients = (rawIngredients: string): string[] => {
  if (!rawIngredients) return [];
  // Strip HTML before parsing
  const cleanIngredients = stripHtml(rawIngredients);
  const lines = cleanIngredients.split('\n');
  const ingredientsSet = new Set<string>();

  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    const content = colonIdx > -1 ? line.substring(colonIdx + 1) : line;
    
    const items = content.split(',');
    items.forEach(item => {
      let cleaned = item.trim();
      cleaned = cleaned.replace(/\.$/, '');
      cleaned = cleaned.replace(/\(\d+\/\d+\)$/, '').trim();
      
      if (cleaned) {
        ingredientsSet.add(cleaned);
      }
    });
  });

  return Array.from(ingredientsSet);
};

const transformBQToProduct = (bqData: any, index: number): Product => {
  const firstVariant = bqData.variants?.[0] || {};
  
  let price = 60;
  const pricedItem = firstVariant.prices?.sellingPrices?.find((p: any) => p.price !== undefined && p.price !== null);
  if (pricedItem) {
    price = Number(pricedItem.price);
  }

  const imageUrl = firstVariant.images?.find((img: any) => img.isPrimary)?.urls?.closeup 
    || firstVariant.images?.[0]?.urls?.closeup 
    || `https://picsum.photos/seed/item${index}/400/500`;

  const rawDescription = bqData.content?.en?.description || '';

  return {
    id: bqData.productId,
    brand: bqData.brand?.name_en || 'Unknown Brand',
    name: bqData.name_en,
    description: stripHtml(rawDescription),
    price: price,
    imageUrl: imageUrl,
    rating: 4.8,
    reviewsCount: parseInt(firstVariant.reviews?.totals || '124', 10) || 124,
    ingredients: parseIngredients(bqData.content?.en?.ingredients || ''),
    categories: bqData.categories?.map((cat: any) => ({
      id: cat.category_id,
      name: cat.labels?.en || 'Unknown Category',
      slug: cat.slug || ''
    })) || [],
    variants: bqData.variants?.map((v: any) => {
      let vPrice = price;
      const vPricedItem = v.prices?.sellingPrices?.find((p: any) => p.price !== undefined && p.price !== null);
      if (vPricedItem) vPrice = Number(vPricedItem.price);
      
      return {
        id: v.variantId,
        name: v.name_en,
        sku: v.sap?.reference || v.variantId,
        price: vPrice,
        inStock: v.state === 'published'
      };
    }) || []
  };
};

// --- API SERVICES ---

/**
 * API 1: Fetch Random User Profile and Paginated Purchase History
 */
export const fetchUserAccountData = async (
  userId?: string, 
  page: number = 1, 
  limit: number = 10
): Promise<{ profile: UserProfile; purchases: PaginatedResponse<PurchaseHistoryItem> }> => {
  
  let profileId = userId || getCookie(USER_COOKIE_NAME);
  let profile = FALLBACK_USER;

  try {
    if (profileId) {
      // Try to fetch specific user if ID is available
      const response = await fetch(`${BACKEND_API_URL}/users/${profileId}`);
      if (response.ok) {
        profile = await response.json();
      } else {
        // If specific user not found, fetch a random one
        const response = await fetch(`${BACKEND_API_URL}/users/random`);
        if (response.ok) {
          profile = await response.json();
          setCookie(USER_COOKIE_NAME, profile.id);
        }
      }
    } else {
      // Fetch a random user from the BigQuery backend
      const response = await fetch(`${BACKEND_API_URL}/users/random`);
      if (response.ok) {
        profile = await response.json();
        setCookie(USER_COOKIE_NAME, profile.id);
      } else {
        console.warn("Backend API returned error for user. Using fallback.");
      }
    }
  } catch (error) {
    console.warn("Backend API not reachable for user. Using fallback.", error);
  }

  // Mocking purchase history as it wasn't specified in the BQ tables
  return new Promise((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPurchases = MOCK_PURCHASES.slice(startIndex, endIndex);
      
      resolve({
        profile,
        purchases: {
          data: paginatedPurchases,
          total: MOCK_PURCHASES.length,
          page,
          limit,
          totalPages: Math.ceil(MOCK_PURCHASES.length / limit)
        }
      });
    }, 400);
  });
};

/**
 * Fetch a user profile by ID
 */
export const fetchUserById = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/users/${userId}`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('User not found');
  } catch (error) {
    console.warn(`Failed to fetch user ${userId}, using fallback`, error);
    return FALLBACK_USER;
  }
};

/**
 * API 2: Fetch Paginated Products from BigQuery Backend (PLP)
 */
export const fetchProducts = async (
  page: number = 1, 
  limit: number = 20
): Promise<PaginatedResponse<Product>> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/products?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Backend API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    const transformedProducts = data.data.map((row: any, index: number) => transformBQToProduct(row, index));
    
    return {
      data: transformedProducts,
      total: data.total,
      page,
      limit,
      totalPages: Math.ceil(data.total / limit)
    };
  } catch (error) {
    console.warn("Backend API not reachable. Using BigQuery sample data as fallback.", error);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const fallbackData = Array.from({ length: limit }).map((_, i) => 
          transformBQToProduct(FALLBACK_BQ_PRODUCT, i + (page - 1) * limit)
        );
        resolve({
          data: fallbackData,
          total: 100,
          page,
          limit,
          totalPages: Math.ceil(100 / limit)
        });
      }, 800);
    });
  }
};

/**
 * Fetch a single product by ID from BigQuery Backend (PDP)
 */
export const fetchProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`Backend API returned status: ${response.status}`);
    }
    
    const rawBqProduct = await response.json();
    return transformBQToProduct(rawBqProduct, 0);
  } catch (error) {
    console.warn(`Failed to fetch product ${id} from backend. Using fallback.`, error);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(transformBQToProduct(FALLBACK_BQ_PRODUCT, 0));
      }, 400);
    });
  }
};

/**
 * API 4: Store Nudge Interactions (Relevance Engine)
 */
export const trackNudgeInteraction = async (
  userId: string,
  productId: string,
  ingredient: string,
  action: 'view' | 'helpful' | 'not_helpful'
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, productId, ingredient, action }),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to track interaction');
  } catch (error) {
    console.warn("Backend API not reachable for tracking. Logging locally.", error);
    console.log(`[Analytics Fallback] Tracked ${action} for ${ingredient} by user ${userId} on product ${productId}`);
    return { success: true };
  }
};
