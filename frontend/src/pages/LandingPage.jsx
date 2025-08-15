import ProductCard from '../components/ProductCard';

export default function LandingPage({ url, setUrl, handleTrack, loading, product }) {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-700">SmartAai Price Tracker</h1>
        <a href="https://chrome.google.com/webstore/your-extension" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
          📦 Install Extension
        </a>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center mt-20 px-4">
        <h2 className="text-4xl font-bold mb-4 leading-tight">Track Prices. Save Smarter.</h2>
        <p className="text-gray-600 mb-6 max-w-xl">
          Enter any <strong>Amazon</strong> or <strong>Flipkart</strong> product URL to get live price tracking, AI-based buying advice, and price history.
        </p>

        <div className="flex gap-2 w-full max-w-xl mb-4">
          <input
            type="text"
            placeholder="Paste product URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-2 rounded border border-gray-300 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={handleTrack}
            disabled={!url || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Track'}
          </button>
        </div>

        {/* Examples */}
        <div className="text-sm text-gray-500 mb-6">
          Try: 
          <button
            className="ml-2 text-blue-500 underline"
            onClick={() => setUrl("https://www.amazon.in/dp/B09FFK1WZH")}
          >
            Amazon Fan
          </button>
          | 
          <button
            className="ml-2 text-blue-500 underline"
            onClick={() => setUrl("https://www.flipkart.com/p/itm7b7fb99577ceb?pid=SMWGRRVARVMFNAFF")}
          >
            Flipkart Smartwatch
          </button>
        </div>

        {/* Product Output */}
        {product && (
          <div className="mt-10 w-full max-w-2xl">
            <h3 className="text-2xl font-semibold mb-4">🔍 Product Insight</h3>
            <ProductCard product={product} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-sm text-gray-500 text-center mt-20 py-6 border-t">
        Built with ❤️ by <a className="underline" href="https://github.com/your-profile">You</a> · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
