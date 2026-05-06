import express from 'express';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';

const app = express();
const port = process.env.PORT || 3001;

// Initialize BigQuery client
// Note: This requires the GOOGLE_APPLICATION_CREDENTIALS environment variable 
// to be set in the environment where this Node.js server runs.
const bigquery = new BigQuery();

app.use(cors());
app.use(express.json());

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
  } catch (error) {
    console.error('Error fetching products from BigQuery:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
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
      WHERE productId = @productId
      LIMIT 1
    `;
    
    const options = {
      query: query,
      params: { productId },
    };

    const [rows] = await bigquery.query(options);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product from BigQuery:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
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
        u.id, 
        u.name, 
        u.email, 
        u.loyaltyTier, 
        u.points,
        bp.skinType, 
        bp.skinConcerns, 
        bp.hairType
      FROM \`sephora-seatech26sin-207.verified_glow.users\` u
      LEFT JOIN \`sephora-seatech26sin-207.verified_glow.beauty_profiles\` bp 
        ON u.id = bp.userId
      ORDER BY RAND()
      LIMIT 1
    `;

    const [rows] = await bigquery.query(query);

    if (rows.length === 0) {
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
      id: row.id || 'u123',
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
  } catch (error) {
    console.error('Error fetching random user from BigQuery:', error);
    res.status(500).json({ error: 'Failed to fetch random user' });
  }
});

/**
 * API 4: Store Nudge Interactions (Relevance Engine)
 */
app.post('/api/interactions', async (req, res) => {
  try {
    const { userId, productId, ingredient, action } = req.body;
    console.log(`[Analytics] Tracked ${action} for ${ingredient} by user ${userId} on product ${productId}`);
    
    // In a full implementation, this would insert a row into a BigQuery analytics table:
    // const query = `INSERT INTO \`sephora-seatech26sin-207.verified_glow.interactions\` ...`
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

app.listen(port, () => {
  console.log(`Sephora Lens API Server running on port ${port}`);
});
