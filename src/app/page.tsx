'use client'; // Required for auth check and redirection

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LandingHeader from '@/components/LandingHeader'; // Import the new header
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component

export default function LandingPage() {
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user data is loaded and a user exists, redirect to dashboard
    if (!loadingUser && user) {
      router.push('/dashboard');
    }
  }, [user, loadingUser, router]);

  // Show loading state while checking auth
  if (loadingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        Loading...
      </div>
    );
  }

  // If user is not logged in, render the landing page content
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white relative overflow-x-hidden">
        <LandingHeader />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 flex items-center min-h-[80vh]">
           {/* Background decorative elements (optional, similar to blobs) */}
           <div aria-hidden className="absolute inset-0 -z-0 opacity-30 dark:opacity-20 overflow-hidden">
             <div className="absolute top-0 -left-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900 rounded-full filter blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-cyan-200 dark:bg-cyan-900 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  Smarter Study, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                    Better Doctors
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">

                  Australia&apos;s #1 medical education platform – built to take you from student to specialist. Access tailored Q Banks, track progress, and excel.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/register"
                    className="inline-block px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 transition duration-300"
                  >
                    Try for Free
                  </Link>
                  <Link
                    href="/login" // Or maybe a features page?
                    className="inline-block px-8 py-3 text-lg font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-gray-800 rounded-lg hover:bg-indigo-200 dark:hover:bg-gray-700 transition duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="flex justify-center">
                 <Image
                    src="/assets/logos/medlobbysuite.png" // Replace with your hero image
                    alt="Medical Education Platform Illustration"
                    width={300}
                    height={300}
                    priority // Load image faster
                    className="w-full h-auto max-w-md lg:max-w-lg rounded-lg shadow-xl"
                 />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 bg-white dark:bg-gray-800/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-8">
              Trusted by thousands of medical professionals
            </h2>
            {/* Replace with actual partner logos */}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-70">
              <span className="font-bold text-gray-400">Partner A</span>
              <span className="font-bold text-gray-400">Partner B</span>
              <span className="font-bold text-gray-400">Partner C</span>
              <span className="font-bold text-gray-400">Partner D</span>
              <span className="font-bold text-gray-400">Partner E</span>
            </div>
          </div>
        </section>

        {/* Feature Section (Example) */}
         <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold mb-12">Why Choose MedicPortal?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-lg shadow-md border border-white/20 dark:border-gray-700/30">
                        <h3 className="text-xl font-bold mb-2">Comprehensive Q Bank</h3>
                        <p className="text-gray-600 dark:text-gray-400">Access thousands of questions relevant to Australian medical exams.</p>
                    </div>
                     {/* Feature 2 */}
                    <div className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-lg shadow-md border border-white/20 dark:border-gray-700/30">
                        <h3 className="text-xl font-bold mb-2">Detailed Analytics</h3>
                        <p className="text-gray-600 dark:text-gray-400">Track your performance, identify weaknesses, and focus your study.</p>
                    </div>
                     {/* Feature 3 */}
                    <div className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-lg shadow-md border border-white/20 dark:border-gray-700/30">
                        <h3 className="text-xl font-bold mb-2">Expert Reviewed</h3>
                        <p className="text-gray-600 dark:text-gray-400">Content crafted and reviewed by experienced Australian clinicians.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer Section (Simple Example) */}
        <footer className="py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
             &copy; {new Date().getFullYear()} MedicPortal. All rights reserved. |{' '}
             <Link href="/privacy" className="hover:underline">Privacy Policy</Link> |{' '}
             <Link href="/terms" className="hover:underline">Terms of Service</Link>
           </div>
        </footer>

        {/* Add the blob styles from login/register if desired */}
        <style jsx>{`
          .animation-delay-4000 { animation-delay: 4s; }
          /* Add blob styles here if you want them */
        `}</style>
      </div>
    );
  }

  // Fallback if still loading or user status uncertain (shouldn't be reached often)
  return null;
}

