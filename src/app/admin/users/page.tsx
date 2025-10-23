// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
   id: number;
   name: string;
   email: string;
  role: 'STUDENT' | 'TUTOR' | 'MODERATOR' | 'ADMIN';
status: 'PENDING' | 'APPROVED' | 'REJECTED';

}

export default function AdminUsersPage() {
   const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
  const fetchUsers = async () => {
     try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');

        // Fetch users instead of questions
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {

       headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch users.');

    const data: User[] = await response.json();
    setUsers(data);
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
  fetchUsers();
   }, []);

   const handleDelete = async (userId: number) => {
  if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
     return;
  }
  try {
     const token = localStorage.getItem('token');
      // Delete user instead of question
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
     });

     if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to delete user');
     }
      // Update users state
     setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  } catch (err: unknown) {
     if (err instanceof Error) {
    setError(err.message);
    alert(`Error: ${err.message}`);
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
       User Management
    </h1>
        {/* Link to create new user */}
    <Link href="/admin/users/new" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
       + Add New User
    </Link>
     </div>

     <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
    {loading && <p className="text-center dark:text-gray-300">Loading users...</p>}
    {error && <p className="text-center text-red-500">{error}</p>}
     
    {!loading && !error && (
       <div className="overflow-x-auto">
      <table className="w-full text-left dark:text-gray-300">
         <thead className="border-b border-gray-300/50 dark:border-gray-700/50">
        <tr>
                  {/* Updated table headers */}
           <th className="p-4">ID</th>
           <th className="p-4">Name</th>
           <th className="p-4">Email</th>
           <th className="p-4">Role</th>
           <th className="p-4">Status</th>
           <th className="p-4">Actions</th>
        </tr>
         </thead>
         <tbody>
        {users.map((user) => (
           <tr key={user.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/20">
          <td className="p-4">{user.id}</td>
          <td className="p-4">{user.name}</td>
          <td className="p-4">{user.email}</td>
          <td className="p-4">
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === 'ADMIN' ? 'bg-indigo-200 text-indigo-800' :
            'bg-gray-200 text-gray-800' // Default style for STUDENT or other roles
             }`}>
            {user.role}
             </span>
          </td>

                            <td className="p-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                              user.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                              user.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                              'bg-gray-200 text-gray-800'
                              }`}>
                              {user.status || 'N/A'}
                           </span>
                           </td>



          <td className="p-4 flex gap-4 items-center">
             <Link  
                          href={`/admin/users/edit/${user.id}`}  
            className="font-medium text-blue-500 hover:underline"
             >
            Edit
             </Link>
             <button  
            onClick={() => handleDelete(user.id)}
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
     </div>
  </div>
   );
}