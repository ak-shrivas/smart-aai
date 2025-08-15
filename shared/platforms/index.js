// --- FILE: shared/platforms/index.js ---
import { parseAmazon } from './amazon.js';
import { parseFlipkart } from './flipkart.js';

const PLATFORM_MAP = {
  'amazon.in': parseAmazon,
  'www.amazon.in': parseAmazon,
  'flipkart.com': parseFlipkart,
  'www.flipkart.com': parseFlipkart,
};

export function getPlatformHandler(hostname) {
  return PLATFORM_MAP[hostname] || null;
}