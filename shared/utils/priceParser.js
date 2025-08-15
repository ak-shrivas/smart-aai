// --- FILE: shared/utils/priceParser.js ---
export function parsePriceString(str) {
    return parseFloat(str.replace(/[₹,]/g, '').trim());
  }