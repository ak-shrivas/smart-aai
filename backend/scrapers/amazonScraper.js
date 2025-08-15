const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeAmazon(url) {
  if (url.includes('/gp/product/')) {
    url = url.replace('/gp/product/', '/dp/');
  }  
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    const $ = cheerio.load(data);

    // ===========
    // Title Fallbacks
    // ===========
    const title =
      $('#productTitle').text().trim() ||
      $('span#title').text().trim() ||
      $('h1.a-size-large.a-spacing-none').first().text().trim();

    // ===========
    // Image Fallbacks
    // ===========
    const image =
      $('#landingImage').attr('src') ||
      $('#imgTagWrapperId img').attr('src') ||
      $('img.a-dynamic-image').attr('src') ||
      $('img').first().attr('src');

    // ===========
    // Price Fallbacks
    // ===========

    // Combine whole + fractional for full price
    let whole = $('span.a-price-whole').first().text().replace(/[₹,\s\u00A0]/g, '') || '';
    let fraction = $('span.a-price-fraction').first().text().replace(/[^\d]/g, '') || '00';

    let priceStr = `${whole}.${fraction}`;
    let price = parseFloat(priceStr);

    // Fallback: try from a-offscreen (used in deals)
    if (!price || isNaN(price)) {
      priceStr = $('#corePrice_feature_div span.a-offscreen').first().text().replace(/[₹,\s\u00A0]/g, '');
      price = parseFloat(priceStr);
    }

    // Fallback: other legacy fields
    if (!price || isNaN(price)) {
      priceStr = $('#priceblock_dealprice').text().replace(/[₹,\s\u00A0]/g, '') ||
                 $('#priceblock_ourprice').text().replace(/[₹,\s\u00A0]/g, '');
      price = parseFloat(priceStr);
    }

    // ===========
    // Final check
    // ===========
    if (!title || !price || isNaN(price)) {
      console.error('❌ Amazon scraper failed. Partial output:', {
        title,
        priceStr,
        price,
      });
      throw new Error('Failed to extract valid product info from Amazon page');
    }

    return {
      title,
      image,
      price,
    };
  } catch (err) {
    console.error('❌ Amazon scraping error:', err.message);
    return { title: '', image: '', price: null };
  }
};
