import { useState } from 'react';
import axios from 'axios';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/track/fetch-info', { url });
      setProduct(res.data);
    } catch (err) {
      alert('❌ Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingPage
      url={url}
      setUrl={setUrl}
      handleTrack={handleTrack}
      loading={loading}
      product={product}
    />
  );
}
