const Product = require('../models/Product');
const identifyPlatform = require('../utils/identifyPlatform');
const extractProductMeta = require('../utils/extractProductMeta');
const scrapeAmazon = require('../scrapers/amazonScraper');
const scrapeFlipkart = require('../scrapers/flipkartScraper');
const generateVariantHash = require('../utils/variantHash');

exports.fetchProductInfo = async (req, res) => {
  try {
    const { url } = req.body;
    const platform = identifyPlatform(url);
    const meta = extractProductMeta(url, platform);
    // console.log('[fetch-info] URL received:', req.body.url);

    if (!meta) return res.status(400).json({ message: '❌ Invalid product URL' });

    const { productId, canonicalUrl } = meta;
    if (!productId) return res.status(400).json({ message: '❌ Could not extract product ID' });

    let product;

    // Check existing by scraping first to generate accurate variantHash
    let scraped;
    if (platform === 'amazon') {
      scraped = await scrapeAmazon(canonicalUrl);
    } else if (platform === 'flipkart') {
      scraped = await scrapeFlipkart(canonicalUrl);
    } else {
      return res.status(400).json({ message: '❌ Unsupported platform' });
    }

    if (!scraped?.price || isNaN(scraped.price)) {
      return res.status(400).json({ message: '❌ Failed to scrape valid price' });
    }

    const variantHash = generateVariantHash({
      title: scraped.title,
      image: scraped.image,
      canonicalUrl
    });

    product = await Product.findOne({ productId, platform, variantHash });

    const now = new Date();

    if (!product) {
      product = await Product.create({
        productId,
        variantHash,
        canonicalUrl,
        platform,
        title: scraped.title,
        image: scraped.image,
        currentPrice: scraped.price,
        history: [{ price: scraped.price, firstSeen: now, lastSeen: now }],
        lastUpdated: now
      });
    }

    const lowest = Math.min(...product.history.map(h => h.price));

    // 🔗 Call AI insight
    let aiTip = '🧠 Smart insight unavailable.';
    try {
      const aiRes = await fetch('http://localhost:5000/api/track/ai-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          platform: product.platform,
          currentPrice: product.currentPrice,
          history: product.history
        })
      });

      const aiData = await aiRes.json();
      aiTip = aiData?.tip || aiTip;
    } catch (err) {
      console.warn('⚠️ AI tip fetch failed:', err.message);
    }

    res.json({
      title: product.title,
      image: product.image,
      currentPrice: product.currentPrice,
      history: product.history,
      platform: product.platform,
      lastUpdated: product.lastUpdated,
      tip: product.currentPrice > lowest
        ? 'Wait — prices were lower earlier!'
        : 'Now is a good time to buy!',
      aiTip
    });
  } catch (err) {
    console.error('❌ fetchProductInfo error:', err);
    res.status(500).json({ message: 'Server error fetching product info' });
  }
};


exports.trackProduct = async (req, res) => {
  const { url } = req.body;
  const platform = identifyPlatform(url);
  const meta = extractProductMeta(url, platform);
  if (!meta) return res.status(400).json({ message: 'Invalid product URL' });

  const { productId, canonicalUrl } = meta;

  if (!productId) return res.status(400).json({ message: 'Could not extract product ID' });

  let data;
  try {
    if (platform === 'amazon') {
      data = await scrapeAmazon(url);
    } else if (platform === 'flipkart') {
      data = await scrapeFlipkart(url);
    } else {
      return res.status(400).json({ message: 'Unsupported platform' });
    }

    if (!data.price || isNaN(data.price)) {
      return res.status(400).json({ message: 'Invalid price extracted. Please try again.' });
    }

    const now = new Date();
    const variantHash = generateVariantHash({
      title: data.title,
      image: data.image,
      canonicalUrl
    });
    const existing = await Product.findOne({ productId, platform, variantHash });

    if (existing) {
      const lastHistory = existing.history[existing.history.length - 1];
      if (lastHistory.price !== data.price) {
        existing.history.push({ price: data.price, firstSeen: now, lastSeen: now });
      } else {
        lastHistory.lastSeen = now;
      }

      existing.currentPrice = data.price;
      existing.lastUpdated = now;
      existing.title = data.title;
      existing.image = data.image;
      existing.canonicalUrl = canonicalUrl;

      await existing.save();
      return res.json(existing);
    }

    const product = await Product.create({
      productId,
      canonicalUrl,
      platform,
      title: data.title,
      image: data.image,
      currentPrice: data.price,
      history: [{ price: data.price, firstSeen: now, lastSeen: now }],
      lastUpdated: now
    });

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Scraping failed' });
  }
};