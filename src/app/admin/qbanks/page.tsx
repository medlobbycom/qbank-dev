// src/app/admin/qbanks/page.tsx
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Changed interface to Qbank
interface Qbank {
  id: number;
  name: string;
  description: string | null;
}

// Renamed component
export default function AdminQbanksPage() {
  const [qbanks, setQbanks] = useState<Qbank[]>([]); // Renamed state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Renamed fetch function
    const fetchQbanks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');

        // Updated fetch endpoint, removed pagination
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qbanks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch Qbanks.');

        const data: Qbank[] = await response.json();
        setQbanks(data); // Set qbanks state

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQbanks();
  }, []); // Removed pagination dependencies

  // Updated handleDelete function
  const handleDelete = async (qbankId: number) => {
    if (!window.confirm('Are you sure you want to delete this Qbank? Questions linked to it will prevent deletion.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qbanks/${qbankId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Try to get a specific error message from the backend
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to delete Qbank (${response.status})`);
      }

      // If delete was successful (status 204), remove from state
      if (response.status === 204) {
        setQbanks(prevQbanks => prevQbanks.filter(q => q.id !== qbankId));
      } else {
        // Handle unexpected success status codes if necessary
        const data = await response.json().catch(() => null);
        console.warn('Delete request returned unexpected status:', response.status, data);
        setQbanks(prevQbanks => prevQbanks.filter(q => q.id !== qbankId)); // Still remove optimistically
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        alert(`Error: ${err.message}`); // Show specific error from backend
      } else {
        setError('An unknown error occurred.');
        alert('An unknown error occurred.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Qbank Management {/* Changed Title */}
        </h1>
        <Link href="/admin/qbanks/new" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"> {/* Changed Link */}
          + Add New Qbank {/* Changed Button Text */}
        </Link>
      </div>

      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
        {loading && <p className="text-center dark:text-gray-300">Loading Qbanks...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && qbanks.length === 0 && (
          <p className="text-center dark:text-gray-400">No Qbanks found. Add one!</p>
        )}

        {qbanks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left dark:text-gray-300">
              <thead className="border-b border-gray-300/50 dark:border-gray-700/50">
                <tr>
                  {/* Updated Headers */}
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-50' : ''}> {/* Dim table while loading */}
                {qbanks.map((qbank) => ( // Map over qbanks
                  <tr key={qbank.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/20">
                    {/* Updated Data Cells */}
                    <td className="p-4">{qbank.id}</td>
                    <td className="p-4 font-medium">{qbank.name}</td>
                    <td className="p-4 max-w-md truncate">{qbank.description || '-'}</td>
                    <td className="p-4 flex gap-4 items-center">
                      {/* Updated Links/Buttons */}
                      <Link
                        href={`/admin/qbanks/edit/${qbank.id}`} // Changed link
                        className="font-medium text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(qbank.id)} // Changed handler
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Removed Pagination and Modal */}
      </div>
    </div>
  );
}