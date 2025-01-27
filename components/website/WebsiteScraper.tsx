'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const urlSchema = z.string().url('Please enter a valid URL');

export default function WebsiteScraper() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate URL
      const validUrl = urlSchema.parse(url);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: validUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }

      const data = await response.json();
      toast.success('Website content scraped successfully!');
      
      // Clear the input
      setUrl('');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Add Your Website
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Enter your website URL to train your chatbot with your content.
          </p>
        </div>
        <form onSubmit={handleScrape} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="url" className="sr-only">
              Website URL
            </label>
            <input
              type="url"
              name="url"
              id="url"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {loading ? 'Scraping...' : 'Scrape Website'}
          </button>
        </form>
      </div>
    </div>
  );
} 