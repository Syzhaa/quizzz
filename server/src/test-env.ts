import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('__dirname:', __dirname);
console.log('resolved path:', resolve(__dirname, '../../.env'));
const result = dotenv.config({ path: resolve(__dirname, '../../.env') });
console.log('dotenv result:', result.parsed ? 'success' : result.error);
