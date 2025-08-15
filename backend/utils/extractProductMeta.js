// utils/extractProductMeta.js
module.exports = function extractProductMeta(url, platform) {
  try {
    const u = new URL(url);

    if (platform === 'amazon') {
      const match = u.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]+)/);
      if (match) {
        const productId = match[2];
        return {
          productId,
          canonicalUrl: `https://${u.hostname}/dp/${productId}`
        };
      }
    }

    if (platform === 'flipkart') {
      const productId = u.searchParams.get('pid');
      if (productId) {
        const slug = u.pathname.split('/p/')[0];
        return {
          productId,
          canonicalUrl: `https://${u.hostname}${slug}/p/${productId}?pid=${productId}`
        };
      }
    }

    return null;
  } catch (err) {
    return null;
  }
};
