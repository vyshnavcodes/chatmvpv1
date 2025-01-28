'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const setupSchema = z.object({
  websiteUrl: z.string().url('Please enter a valid URL'),
  agentName: z.string().min(2, 'Name must be at least 2 characters'),
  agentDescription: z.string().min(10, 'Please provide a brief description'),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please select a valid color'),
});

export default function DashboardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    websiteUrl: '',
    agentName: '',
    agentDescription: '',
    brandColor: '#2563eb',
    photoUrl: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleWebsiteScrape = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.websiteUrl }),
      });

      if (!response.ok) throw new Error('Failed to scrape website');

      setStep(2);
    } catch (error) {
      console.error('Scraping error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    try {
      setLoading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('agent-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agent-photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, photoUrl: publicUrl }));
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Validate form data
      setupSchema.parse(formData);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          website_url: formData.websiteUrl,
          agent_name: formData.agentName,
          agent_description: formData.agentDescription,
          brand_colors: { primary: formData.brandColor },
          photo_url: formData.photoUrl,
          setup_completed: true,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      setPreviewMode(true);
    } catch (error) {
      console.error('Setup error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Preview Your Chatbot</h1>
          <p className="mb-8">This is how your chatbot will appear to visitors.</p>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Sample Property Page</h2>
            <p>Your chatbot is ready to assist visitors!</p>
          </div>

          {/* Chat Widget */}
          <div className="mt-8">
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= i ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {i}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-12 h-1 ${
                        step > i ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Website Setup</h2>
              <p className="text-gray-600">Enter your website URL to get started</p>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))
                }
                placeholder="https://your-website.com"
                className="w-full p-2 border rounded-lg"
              />
              <button
                onClick={handleWebsiteScrape}
                disabled={loading || !formData.websiteUrl}
                className="w-full bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Agent Profile</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, agentName: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  About You
                </label>
                <textarea
                  value={formData.agentDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agentDescription: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-2 border rounded-lg mt-1"
                />
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full bg-blue-500 text-white p-2 rounded-lg"
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Appearance</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full p-2 border rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brand Color
                </label>
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brandColor: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg mt-1"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 