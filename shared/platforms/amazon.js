// --- FILE: shared/platforms/amazon.js ---
export function parseAmazon(document) {
  const title = document.querySelector('#productTitle')?.textContent?.trim();
  const price =
    document.querySelector('#corePrice_feature_div .a-offscreen')?.textContent?.trim() ||
    document.querySelector('#priceblock_ourprice')?.textContent?.trim() ||
    document.querySelector('#priceblock_dealprice')?.textContent?.trim();

  const image =
    document.querySelector('#landingImage')?.src ||
    document.querySelector('#imgTagWrapperId img')?.src;

  return { title, image, price };
}