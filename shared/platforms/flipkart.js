// --- FILE: shared/platforms/flipkart.js ---
export function parseFlipkart(document) {
  const title =
    document.querySelector('span.B_NuCI')?.textContent?.trim() ||
    document.querySelector('span.VU-ZEz')?.textContent?.trim();

  const image =
    document.querySelector('img[class*="DByuf4"]')?.src ||
    document.querySelector('img')?.src;

  let price = null;
  const priceElements = document.querySelectorAll('div, span');
  priceElements.forEach((el) => {
    const text = el.textContent.trim();
    if (text.includes('₹') && /^₹[\d,]+$/.test(text)) {
      if (!price) {
        price = text;
      }
    }
  });

  return { title, image, price };
}