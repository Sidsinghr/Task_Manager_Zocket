// components/ChatInterface.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ChatInterfaceProps {
  initialPrompt?: string; // NEW
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Whenever initialPrompt changes, update the local prompt
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuggestions('');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/ai/suggest`,
        { prompt },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuggestions(response.data.suggestions || 'No suggestions returned.');
    } catch (err) {
      console.error(err);
      setError('Error fetching suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
      <form onSubmit={handleSubmit}>
      <textarea
            className="mx-auto block p-3 border rounded h-40 w-[600px] resize-none"
            placeholder="Enter your prompt..."
            rows={8}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Suggestions'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {suggestions && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-bold">AI Suggestions:</h3>
          <p>{suggestions}</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
