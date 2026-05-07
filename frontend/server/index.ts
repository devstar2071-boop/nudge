import express from 'express';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';

const app = express();
const port = process.env.BQ_API_PORT || 3001;

// Initialize BigQuery client
// Note: This requires the GOOGLE_APPLICATION_CREDENTIALS environment variable 
// to be set in the environment where this Node.js server runs.
const bigquery = new BigQuery({ projectId: 'sephora-seatech26sin-207' });

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[BigQuery API] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

/**
 * API 1: List and show products (Paginated)
 * Fetches from sephora-seatech26sin-207.verified_glow.products
 */
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT *
      FROM \`sephora-seatech26sin-207.verified_glow.products\`
      LIMIT @limit OFFSET @offset
    `;
    
    const options = {
      query: query,
      params: { limit, offset },
    };

    const [rows] = await bigquery.query(options);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM \`sephora-seatech26sin-207.verified_glow.products\``;
    const [countRows] = await bigquery.query(countQuery);
    const total = countRows[0].total || 100;

    res.json({
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error(`[BigQuery API Error] Failed to fetch products:`, {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

/**
 * API 2: Fetch a single product by ID
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const query = `
      SELECT *
      FROM \`sephora-seatech26sin-207.verified_glow.products\`
      WHERE productId = CAST(@productId AS INT64)
      LIMIT 1
    `;
    
    const options = {
      query: query,
      params: { productId },
    };

    const [rows] = await bigquery.query(options);
    
    if (rows.length === 0) {
      console.warn(`[BigQuery API] Product not found: ${productId}`);
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error(`[BigQuery API Error] Failed to fetch product ${req.params.id}:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

/**
 * API 3: Fetch a random user with their beauty profile
 * Joins sephora-seatech26sin-207.verified_glow.users and beauty_profiles
 */
app.get('/api/users/random', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.int64_field_0 as id, 
        'Test User' as name, 
        'user@example.com' as email, 
        'Gold' as loyaltyTier, 
        100 as points,
        JSON_VALUE(bp.skincare_routine, '$.skin_type') as skinType, 
        JSON_VALUE(bp.skincare_routine, '$.skin_concerns') as skinConcerns, 
        JSON_VALUE(bp.haircare_routine, '$.hair_type') as hairType
      FROM \`sephora-seatech26sin-207.verified_glow.users\` u
      LEFT JOIN \`sephora-seatech26sin-207.verified_glow.beauty_profiles\` bp 
        ON u.int64_field_0 = bp.user_id
      ORDER BY RAND()
      LIMIT 1
    `;

    const [rows] = await bigquery.query(query);

    if (rows.length === 0) {
      console.warn(`[BigQuery API] No users found in database`);
      return res.status(404).json({ error: 'No users found' });
    }

    const row = rows[0];
    
    // Parse skinConcerns if it's stored as a stringified JSON or comma-separated string
    let parsedSkinConcerns: string[] = [];
    if (typeof row.skinConcerns === 'string') {
      try {
        parsedSkinConcerns = JSON.parse(row.skinConcerns);
      } catch (e) {
        parsedSkinConcerns = row.skinConcerns.split(',').map((s: string) => s.trim());
      }
    } else if (Array.isArray(row.skinConcerns)) {
      parsedSkinConcerns = row.skinConcerns;
    }

    // Format to match the frontend UserProfile interface
    const userProfile = {
      id: String(row.id || 'u123'),
      name: row.name || 'Jane Doe',
      email: row.email || 'jane.doe@example.com',
      beautyTraits: {
        skinType: row.skinType || 'Dry',
        skinConcerns: parsedSkinConcerns.length > 0 ? parsedSkinConcerns : ['Redness', 'Dullness'],
        hairType: row.hairType || 'Wavy',
      },
      loyaltyTier: row.loyaltyTier || 'Rouge',
      points: row.points || 1250,
    };

    res.json(userProfile);
  } catch (error: any) {
    console.error(`[BigQuery API Error] Failed to fetch random user:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch random user', details: error.message });
  }
});

/**
 * API 3.5: Fetch a user by ID
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const query = `
      SELECT 
        u.int64_field_0 as id, 
        'Test User' as name, 
        'user@example.com' as email, 
        'Gold' as loyaltyTier, 
        100 as points,
        JSON_VALUE(bp.skincare_routine, '$.skin_type') as skinType, 
        JSON_VALUE(bp.skincare_routine, '$.skin_concerns') as skinConcerns, 
        JSON_VALUE(bp.haircare_routine, '$.hair_type') as hairType
      FROM \`sephora-seatech26sin-207.verified_glow.users\` u
      LEFT JOIN \`sephora-seatech26sin-207.verified_glow.beauty_profiles\` bp 
        ON u.int64_field_0 = bp.user_id
      WHERE u.int64_field_0 = CAST(@userId AS INT64)
      LIMIT 1
    `;

    const options = {
      query: query,
      params: { userId },
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      console.warn(`[BigQuery API] User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const row = rows[0];
    
    // Parse skinConcerns
    let parsedSkinConcerns: string[] = [];
    if (typeof row.skinConcerns === 'string') {
      try {
        parsedSkinConcerns = JSON.parse(row.skinConcerns);
      } catch (e) {
        parsedSkinConcerns = row.skinConcerns.split(',').map((s: string) => s.trim());
      }
    } else if (Array.isArray(row.skinConcerns)) {
      parsedSkinConcerns = row.skinConcerns;
    }

    const userProfile = {
      id: String(row.id),
      name: row.name || 'Jane Doe',
      email: row.email || 'jane.doe@example.com',
      beautyTraits: {
        skinType: row.skinType || 'Dry',
        skinConcerns: parsedSkinConcerns.length > 0 ? parsedSkinConcerns : ['Redness', 'Dullness'],
        hairType: row.hairType || 'Wavy',
      },
      loyaltyTier: row.loyaltyTier || 'Rouge',
      points: row.points || 1250,
    };

    res.json(userProfile);
  } catch (error: any) {
    console.error(`[BigQuery API Error] Failed to fetch user ${req.params.id}:`, {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

/**
 * API 4: Store Nudge Interactions (Relevance Engine)
 */
app.post('/api/interactions', async (req, res) => {
  try {
    const { userId, productId, ingredient, action } = req.body;
    console.log(`[Analytics] Logging ${action} for ${ingredient} to BigQuery...`);
    
    const datasetId = 'verified_glow';
    const tableId = 'interactions';
    
    const rows = [{
      userId: String(userId),
      productId: String(productId),
      ingredient: String(ingredient),
      action: String(action),
      timestamp: bigquery.timestamp(new Date())
    }];

    await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert(rows);

    console.log(`[Analytics] Successfully stored interaction in BigQuery`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[BigQuery API Error] Failed to track interaction:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ error: 'Failed to track interaction', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Sephora Lens API Server running on port ${port}`);
});
