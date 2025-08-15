const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true }, // e.g. B09VQXNBKP (Amazon), M... (Flipkart)
  variantHash: { type: String, required: true },
  canonicalUrl: { type: String, required: true },
  platform: { type: String, required: true }, // 'amazon', 'flipkart'
  tags: [String],
  title: String,
  image: String,
  currentPrice: Number,
  history: [{
    price: Number,
    firstSeen: Date,
    lastSeen: Date
  }],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: null }
});

ProductSchema.index({ productId: 1, platform: 1 }, { unique: true }); // Prevent duplicates
ProductSchema.index({ productId: 1, platform: 1, variantHash: 1 }, { unique: true });

module.exports = mongoose.model('Product', ProductSchema);
