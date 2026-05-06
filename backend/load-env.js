import { config } from 'dotenv';
const result = config({ path: '.env.local', override: true });
console.log('[load-env] result:', result.parsed ? 'success' : 'failed');
console.log('[load-env] GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
