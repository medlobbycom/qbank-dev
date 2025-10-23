'use client';

import { useState, FormEvent, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import LandingHeader from '@/components/LandingHeader'; // <-- Import the header
import Image from 'next/image'; // Import the Image component

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Initialize router
  const { user } = useAuth(); // Get user state

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(`Successfully registered ${data.name || name}! Redirecting to login...`);
      // --- ADDED REDIRECT ---
      // Optionally redirect to login after a short delay, or directly to dashboard
      // For now, let's redirect to login after showing the success message
      setTimeout(() => {
         router.push('/login'); // Redirect to login page after success
      }, 2000); // 2 second delay

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected registration error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-900 relative overflow-hidden">
      {/* Liquid blobs */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <svg className="blob blob-1" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="rg1" x1="0" x2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <g transform="translate(300,300)">
            <path fill="url(#rg1)" d="M120,-160C156,-121,179,-76,193,-25C207,26,213,82,189,120C165,158,111,178,59,188C7,199,-44,200,-86,179C-128,158,-161,116,-178,69C-195,22,-197,-29,-170,-73C-143,-118,-86,-156,-30,-175C26,-195,53,-199,120,-160Z" />
          </g>
        </svg>
        <svg className="blob blob-2" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="rg2" x1="0" x2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <g transform="translate(300,300)">
            <path fill="url(#rg2)" d="M100,-130C130,-90,150,-50,160,-5C170,40,170,85,145,115C121,145,73,160,28,172C-17,185,-58,195,-96,176C-135,158,-172,111,-187,60C-202,9,-195,-47,-167,-89C-139,-131,-87,-159,-35,-184C18,-210,36,-224,100,-130Z" />
          </g>
        </svg>
      </div>

      <LandingHeader /> {/* <-- Add the header here */}

      {/* --- TWO COLUMN LAYOUT --- */}
       <main className="relative z-10 w-full max-w-6xl mx-auto p-4 lg:p-8 grid lg:grid-cols-3 gap-8 items-center">

        {/* --- LEFT COLUMN (INFO) --- */}
        <div className="lg:col-span-1 text-center lg:text-left">
           <Link href="/" className="inline-block mb-6">
             {/* Use the same dual-logo setup */}
             <img
              src="/assets/logos/logo-color.png"
              alt="MedicPortal Home"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src="/assets/logos/logo-final.png"
              alt="MedicPortal Home"
              className="h-10 w-auto hidden dark:block"
            />
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Start Your Journey with MedicPortal
          </h1>


          {/* --- IMAGE ADDED HERE --- 
          <div className="my-8 flex justify-center">
            <Image
              src="/assets/logos/medlobbysuite.png" // Replace with your desired image path
              alt="Welcome to medlobby suite"
              width={300}
              height={300}
              className="w-auto h-auto max-w-[300px]"
            />
          </div>
*/}


          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join thousands of medical professionals preparing for exams. Create your account to access tailored question banks and detailed analytics.
          </p>
        </div>

         {/* --- RIGHT COLUMN (FORM) --- */}
        <div className="lg:col-span-2 w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="glass-card relative overflow-hidden rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Fill in your details below to register.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 placeholder-gray-500 border border-white/30 dark:border-gray-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 placeholder-gray-500 border border-white/30 dark:border-gray-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 placeholder-gray-500 border border-white/30 dark:border-gray-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 shadow hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            {message && <p className="mt-4 text-center text-sm text-green-500">{message}</p>}
            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div>
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-cyan-600 hover:underline">
                  Sign In
                </Link>
              </div>
              {/* Removed the forgot password link from register page */}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        :global(.blob) {
          position: absolute;
          width: 70vmax;
          height: 70vmax;
          filter: blur(64px) saturate(120%);
          transform-origin: center;
          opacity: 0.85;
          mix-blend-mode: screen;
        }
        :global(.blob-1) {
          left: -20%;
          top: -20%;
          animation: float-1 13s ease-in-out infinite;
        }
        :global(.blob-2) {
          right: -18%;
          bottom: -8%;
          animation: float-2 15s ease-in-out infinite;
        }

        @keyframes float-1 {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-7%) rotate(6deg) scale(1.05); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes float-2 {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(6%) rotate(-6deg) scale(0.98); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }

        .glass-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.20) 100%);
          backdrop-filter: blur(18px) saturate(120%) contrast(1.02);
          -webkit-backdrop-filter: blur(18px) saturate(120%) contrast(1.02);
        }

        .glass-card::before {
          content: "";
          position: absolute;
          left: -40%;
          top: -40%;
          width: 200%;
          height: 200%;
          pointer-events: none;
          background: linear-gradient(120deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0));
          transform: rotate(-12deg);
          mix-blend-mode: overlay;
          animation: sheen 6s linear infinite;
          opacity: 0.95;
        }

        @keyframes sheen {
          0% { transform: translateX(-10%) rotate(-12deg); opacity: 0.8; }
          50% { transform: translateX(10%) rotate(-12deg); opacity: 0.95; }
          100% { transform: translateX(-10%) rotate(-12deg); opacity: 0.8; }
        }

        @media (max-width: 1023px) { /* Changed from 640px to lg breakpoint */
          :global(.blob) { display: none; } /* Hide blobs on mobile/tablet */
          main { /* Center content on smaller screens */
            grid-template-columns: 1fr;
            max-width: 28rem; /* Like max-w-md */
          }
          .lg\\:col-span-1, .lg\\:col-span-2 { /* Remove column spans on smaller screens */
             grid-column: auto / auto;
          }
          .lg\\:text-left { text-align: center; } /* Center text */
          .lg\\:justify-self-end { justify-self: auto; } /* Remove right alignment */
        }
        @media (max-width: 640px) {
          .glass-card { padding: 1rem; }
        }

        @media (prefers-color-scheme: dark) {
          .glass-card {
            background: linear-gradient(180deg, rgba(10,11,12,0.44) 0%, rgba(20,20,25,0.22) 100%);
            border-color: rgba(255,255,255,0.04);
          }
          :global(.blob) { filter: blur(64px) saturate(120%) contrast(0.9); }
        }
      `}</style>

    </div>
    </>
  );
}
