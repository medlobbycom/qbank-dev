// src/app/admin/qbanks/edit/[qbankId]/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface for the Qbank data we expect
interface QbankData {
  name: string;
  description: string | null;
}

// Renamed component and updated props
export default function EditQbankPage({ params }: { params: { qbankId: string } }) {
  const router = useRouter();
  const { qbankId } = params; // Use qbankId

  // Simplified form state for Qbank
  const [formData, setFormData] = useState<Partial<QbankData>>({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Added loading state for submit

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please login.');
      setLoading(false);
      // Optional: redirect to login
      // router.push('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch only the specific Qbank data
        const qbankRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qbanks/${qbankId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!qbankRes.ok) {
           if (qbankRes.status === 404) {
             throw new Error('Qbank not found.');
           }
           throw new Error('Failed to load Qbank data');
        }

        const qbankData: QbankData = await qbankRes.json();
        setFormData(qbankData); // Populate form state
} catch (error: unknown) { // <-- THIS IS THE CORRECT BLOCK
        console.error(error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load Qbank data due to an unknown error.');
        }
      } finally {
        setLoading(false);
      }
      
      
    };
    fetchInitialData();
  }, [qbankId]); // Depend on qbankId

  // Simplified input handler for name and description
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Modified submit handler for Qbank update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingSubmit(true); // Set submit loading

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qbanks/${qbankId}`, { // Changed endpoint
        method: 'PATCH', // Use PATCH
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData), // Send current form data (name, description)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
         throw new Error(errData.message || `Failed to update Qbank (${response.status})`);
      }

      setSuccess('Qbank updated successfully! Redirecting...');
      setTimeout(() => router.push('/admin/qbanks'), 1500); // Redirect to Qbanks list
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during update.');
      }
      console.error(err);
    } finally {
        setLoadingSubmit(false); // Unset submit loading
    }
  };

  if (loading) return <div className="text-center p-8 dark:text-gray-300">Loading Qbank for editing...</div>;
  // Show error if loading failed and we don't have a name to display
  if (error && !formData.name) return <div className="text-red-500 p-8 text-center">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* Updated Titles/Links */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Qbank #{qbankId}</h1>
        <Link href="/admin/qbanks" className="text-sm text-indigo-500 hover:underline">&larr; Back to List</Link>
      </div>
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Simplified Form Fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300">Qbank Name</label>
            <input
              id="name"
              name="name" // Make sure name attribute matches state key
              type="text"
              value={formData.name ?? ''}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium dark:text-gray-300">Description (Optional)</label>
            <textarea
              id="description"
              name="description" // Make sure name attribute matches state key
              value={formData.description ?? ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Removed all other question-specific fields */}

          <div className="pt-4">
            {/* Updated Submit Button */}
            <button
              type="submit"
              disabled={loadingSubmit || !formData.name} // Disable if loading or name is empty
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {loadingSubmit ? 'Updating...' : 'Update Qbank'}
            </button>
            {success && <p className="text-sm text-center text-green-500 mt-4">{success}</p>}
            {/* Show general form error, potentially overriding loading error */}
            {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}