// src/app/(user)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import MainHeader from '@/components/MainHeader';
import MainSidebar from '@/components/MainSidebar';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const SIDEBAR_STATE_KEY = 'sidebarOpen'; // Key for localStorage

export default function UserLayout({ children }: { children: React.ReactNode }) {



  // Initialize state to null. We'll set it in the first useEffect.
  const [isSidebarOpen, setSidebarOpen] = useState<boolean | null>(null);


  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const router = useRouter(); // <-- Initialize useRouter

  // Get user data and logout from context

  // --- FIX: Moved useAuth call *before* the useEffect that needs 'user' and 'loadingUser' ---
  const { user, loadingUser, logout } = useAuth();

  // This hook loads the sidebar state from localStorage or sets a default.
  useEffect(() => {

    const storedValue = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (storedValue !== null) {
      // If a value is saved, use it.
      setSidebarOpen(JSON.parse(storedValue));
    } else {
      // No value saved: set default based on screen size
      setSidebarOpen(window.innerWidth >= 1024); // Open on desktop, closed on mobile


    }
  }, []); // The empty array [] means this runs only once on mount



  // This hook saves the state to localStorage AND handles the scroll lock.
  useEffect(() => {

    // 1. Save state to localStorage
    if (isSidebarOpen !== null) {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarOpen));
    }

    // 2. Handle body scroll lock (Fixes double scrollbar)
    if (isSidebarOpen && window.innerWidth < 1024) { // Only on mobile
      // Add class to body to prevent scrolling
      document.body.classList.add('overflow-hidden');
    } else {
      // Remove class from body to allow scrolling
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup function in case the component unmounts
    return () => document.body.classList.remove('overflow-hidden');
  }, [isSidebarOpen]); // This runs every time isSidebarOpen changes


  // --- ADDED BACK: Auth Check and Redirect ---
  useEffect(() => {
    console.log("(UserLayout) Redirect Check Effect: loadingUser =", loadingUser, " | user =", !!user); // Log state entering effect
    // If loading is finished AND there is no user, redirect to login
    if (!loadingUser && !user) {
      console.log("(UserLayout) Redirecting to /login"); // Log redirect action
      router.push('/login');
    }
    // If user exists, do nothing (allow access)
  }, [user, loadingUser, router]); // Re-run when auth state changes


  // --- DEBUG LOG ---
  console.log("(UserLayout) Rendering: loadingUser =", loadingUser, " | user =", !!user); // Log state during render
  // ---


  // Show a global loader while auth is checking

  if (loadingUser || isSidebarOpen === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        Loading portal...
      </div>
    );
  }
  
  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 lg:flex">
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
        ></div>
      )}

      <MainSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />



      {/* Remove min-h-screen to prevent double scrollbar */}
      <div className="flex-1 flex flex-col">



        <MainHeader
          toggleSidebar={toggleSidebar}
          userName={user?.name || 'Guest'}
          userRole={user?.role || 'Guest Role'}
          onLogout={logout} // Use logout from context
        />
        {/* Remove overflow-y-auto. Let the BODY be the only scrollbar. */}
        <main className="flex-1 p-4 md:p-8">

          {children}
        </main>
      </div>
    </div>
  );
}