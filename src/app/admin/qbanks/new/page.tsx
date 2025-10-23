// src/app/admin/qbanks/new/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function NewQbankPage() { // Renamed component
  const router = useRouter();

  // Updated form state for Qbank
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for submit

  // Updated submit handler for Qbank
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // Set loading

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE}/qbanks`, { // Changed endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }), // Send name and description
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to create Qbank (${response.status})`);
      }

      setSuccess('Qbank created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/qbanks'), 1200); // Redirect to Qbanks list
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false); // Unset loading
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Updated Titles/Links */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add New Qbank</h1>
          <p className="text-sm text-gray-500">Create a new Master Category for questions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/admin/qbanks" className="text-sm text-indigo-500 hover:underline">&larr; Back to List</Link>
        </div>
      </div>

      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Updated Form Fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300">Qbank Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium dark:text-gray-300">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            {/* Updated Button */}
            <button
              type="submit"
              disabled={loading || !name} // Disable if loading or name is empty
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Qbank'}
            </button>
            {success && <p className="text-sm text-center text-green-500 mt-4">{success}</p>}
            {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
          </div>
        </form>
      </div>
      {/* Removed Question Import/Export Modal */}
    </div>
  );
}