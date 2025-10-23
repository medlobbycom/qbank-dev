// src/app/admin/users/edit/[userId]/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  name: string;
  email: string;

 role: 'STUDENT' | 'TUTOR' | 'MODERATOR' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function EditUserPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { userId } = params;

  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!res.ok) throw new Error('Failed to load user data');

        const userData = await res.json();
        setFormData(userData as Partial<UserData>);
      } catch (error) {
        console.error(error);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update user');
      }
      setSuccess('User updated successfully! Redirecting...');
      setTimeout(() => router.push('/admin/users'), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) { setError(err.message); }
      else { setError('Unknown error'); }
      console.error(err);
    }
  };

  if (loading) return <div>Loading user for editing...</div>;
  if (error && !formData.name) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit User #{userId}</h1>
        <Link href="/admin/users" className="text-sm text-indigo-500 hover:underline">&larr; Back to List</Link>
      </div>
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name ?? ''}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email ?? ''}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Role */}
          <div>
              <label className="block text-sm font-medium dark:text-gray-300">Role</label>
              <select 
                name="role"
                value={formData.role ?? 'STUDENT'}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="STUDENT">STUDENT</option>
                <option value="TUTOR">TUTOR</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
          </div>
          
 {/* Status */}
 <div>
 <label className="block text-sm font-medium dark:text-gray-300">Account Status</label>
 <select 
 name="status"
 value={formData.status ?? 'PENDING'}
 onChange={handleInputChange}
 className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
 <option value="PENDING">PENDING</option>
 <option value="APPROVED">APPROVED</option>
 <option value="REJECTED">REJECTED</option>
 </select>
 </div>





          <div className="text-sm dark:text-gray-400">
            Note: Password cannot be changed from this form.
          </div>

          <div className="pt-4">
            <button type="submit" 
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Update User
            </button>
            
            {success && <p className="text-sm text-center text-green-500 mt-4">{success}</p>}
            {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}