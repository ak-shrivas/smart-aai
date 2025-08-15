exports.fetchAiTips = async (req, res) => {
    const root = req.body;
  
    // Handle both: full `data` object or just `history`
    const history = Array.isArray(root.history) 
      ? root.history 
      : Array.isArray(root.history?.history)
        ? root.history.history
        : [];
  
    const title = root.title || root.history?.title || 'This Product';
    const platform = root.platform || root.history?.platform || 'Unknown Platform';
    const currentPrice = root.currentPrice || root.history?.currentPrice || null;
  
    console.log('🪵 Final parsed data →', { title, platform, currentPrice, history });
  
    if (!history.length) {
      return res.json({ tip: '📊 Not enough data to analyze.' });
    }
  
    const formatted = history.map(h =>
      `- ₹${h.price} on ${new Date(h.date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })}`
    ).join('\n');
  
    const prompt = `
  You are a smart shopping assistant.
  
  Product: ${title}
  Platform: ${platform}
  Current Price: ₹${currentPrice || 'N/A'}
  
  Here is the price history:
  ${formatted}
  
  Give a short, 1-line buying tip. Avoid saying invalid date. Be helpful.
  `;
  
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: 'You are a helpful shopping assistant.' },
            { role: 'user', content: prompt.trim() }
          ],
          temperature: 0.7
        })
      });
  
      const data = await groqRes.json();
      const tip = data?.choices?.[0]?.message?.content?.trim();
      if (!tip) throw new Error('No tip received');
      res.json({ tip });
  
    } catch (err) {
      console.error('❌ Groq API error:', err.message);
      res.status(500).json({ error: 'Groq API failed' });
    }
  };
  