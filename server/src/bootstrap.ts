import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dotenvResult = dotenv.config({ path: resolve(__dirname, '../../.env') });
if (dotenvResult.error) {
  console.warn('[DOTENV] Error loading .env file:', dotenvResult.error.message);
}
