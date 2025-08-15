module.exports = function identifyPlatform(url) {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('flipkart')) return 'flipkart';
    return 'unknown';
  }
  