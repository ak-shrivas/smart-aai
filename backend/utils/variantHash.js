const crypto = require('crypto');

module.exports = function generateVariantHash({ title, image, canonicalUrl }) {
    const raw = `${title}-${image}-${canonicalUrl}`;
    return crypto.createHash('sha1').update(raw).digest('hex');
  }