import { useState } from 'react';
import PriceChart from './PriceChart';

export default function ProductCard({ product }) {
  const { title, image, currentPrice, history, lastUpdated } = product;

  const lastEntry = history[history.length - 1];
  const prevEntry = history[history.length - 2];
  const priceChange = prevEntry ? currentPrice - prevEntry.price : 0;

  const lowest = Math.min(...history.map((h) => h.price));
  const [showChart, setShowChart] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-5 w-full max-w-3xl mx-auto">
      <div className="flex items-start gap-4">
        <img
          src={image}
          alt={title}
          className="w-24 h-24 object-contain bg-gray-100 rounded-xl border"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h3>

          <p className="text-2xl font-bold text-blue-600">₹{currentPrice}</p>

          {priceChange !== 0 && (
            <p
              className={`text-sm mt-1 ${
                priceChange < 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {priceChange < 0 ? '🔻 Price dropped' : '🔺 Price increased'} by ₹{Math.abs(priceChange)}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-2">📉 Lowest Price: ₹{lowest}</p>
          <p className="text-xs text-gray-400">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
        </div>
      </div>

      {history.length >= 1 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-gray-600 font-medium">Price History</h4>
            <button
              onClick={() => setShowChart((prev) => !prev)}
              className="text-xs text-blue-500 hover:underline"
            >
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </button>
          </div>

          {showChart && (
            <div className="rounded-lg border bg-gray-50 p-2">
              <PriceChart history={history} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

