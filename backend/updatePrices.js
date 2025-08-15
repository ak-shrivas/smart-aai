require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const scrapeAmazon = require('./scrapers/amazonScraper');
const scrapeFlipkart = require('./scrapers/flipkartScraper');
const identifyPlatform = require('./utils/identifyPlatform');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function updateAllPrices() {
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update`);

    for (const product of products) {
      try {
        if (!product.url || !product.url.startsWith('http')) {
          console.log(`⚠️ Skipping invalid URL: ${product.url}`);
          skipped++;
          continue;
        }

        const platform = identifyPlatform(product.url);
        let data;

        // Platform-specific scraping
        if (platform === 'amazon') {
          data = await scrapeAmazon(product.url);
        } else if (platform === 'flipkart') {
          data = await scrapeFlipkart(product.url);
        } else {
          console.log(`❌ Unsupported platform: ${product.url}`);
          failed++;
          continue;
        }

        // Validate price
        if (!data.price || isNaN(data.price)) {
          console.log(`⚠️ Invalid price for: ${product.url}`);
          failed++;
          continue;
        }

        const now = new Date();
        const last = product.history[product.history.length - 1];

        if (last && last.price === data.price) {
          // ✅ Update lastSeen if price same
          const today = now.toDateString();
          const lastSeenDate = last.lastSeen?.toDateString();
          if (today !== lastSeenDate) {
            last.lastSeen = now;
            product.lastUpdated = now;
            await product.save();
            console.log(`⏩ Price same. Updated lastSeen for ${product.title} (₹${data.price})`);
          } else {
            console.log(`⏩ Price same and already updated today: ${product.title}`);
          }
          skipped++;
          continue;
        }

        // ✅ New price: Push new history entry
        product.history.push({
          price: data.price,
          firstSeen: now,
          lastSeen: now
        });

        product.currentPrice = data.price;
        product.lastUpdated = now;
        await product.save();

        console.log(`✅ Price changed for ${product.title} → ₹${data.price}`);
        updated++;

        await delay(1000); // Rate-limit scraping
      } catch (err) {
        console.error(`❌ Error updating ${product.url}: ${err.message}`);
        failed++;
        continue;
      }
    }

    await mongoose.disconnect();
    console.log('🚪 Disconnected from MongoDB');

    console.log('\n📊 Update Summary');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏩ Skipped (no change or already logged today): ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
  } catch (err) {
    console.error('❌ Global error during update:', err);
  }
}

updateAllPrices();
