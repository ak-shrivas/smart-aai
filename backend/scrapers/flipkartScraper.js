const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeFlipkart(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
      },
      timeout: 10000,
    });
    
    if (data.includes('Enter the characters you see below')) {
      throw new Error('Blocked by CAPTCHA page');
    }    
    const $ = cheerio.load(data);

    // ✅ Title
    const title =
      $('span.B_NuCI').text().trim() || // Older stable title
      $('span.VU-ZEz').text().trim();   // Newer fallback

    // ✅ Image
    const image =
      $('img[class*="DByuf4"]').attr('src') ||
      $('img[loading="eager"]').attr('src') ||
      $('img').first().attr('src');

    // ✅ Price
    let priceStr =
      $('div.Nx9bqj.CxhGGd.yKS4la').first().text().trim() || // New July 2025 price class
      $('._30jeq3._16Jk6d').first().text().trim();           // Old reliable fallback

    if (!priceStr) {
      // Generic ₹ price fallback
      const fallback = $('div, span').filter((i, el) => {
        const text = $(el).text();
        return /^₹[\d,]+$/.test(text.trim());
      }).first();
      priceStr = fallback.text().trim();
    }

    const price = parseFloat(priceStr.replace(/[₹,]/g, ''));

    if (!title || !image || !price || isNaN(price)) {
      throw new Error('❌ Missing product data (title/image/price)');
    }

    return { title, image, price };
  } catch (err) {
    console.error('❌ Flipkart scraper error:', err.message);
    throw err;
  }
};
