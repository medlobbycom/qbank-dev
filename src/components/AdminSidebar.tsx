'use client';

// No longer need useState since the popup is removed
import { usePathname } from 'next/navigation';
import {
  Home,         // Icon for Admin Home
  FileQuestion, // Icon for Admin Questions
  Users,        // Icon for Admin Users (Example)
  BookOpen,     // Icon for Study Material
  LayoutGrid,
  FileText,     // Icon for Mock Tests
  Settings, // <-- ADD THIS
  BookOpenCheck,
  // Add other admin icons you need here
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';


interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  // const [isPopupOpen, setPopupOpen] = useState(false); // No longer needed

  // --- Style definitions are identical to MainSidebar ---
  const navLinkBase =
    'flex items-center gap-3 p-3 rounded-lg font-medium whitespace-nowrap transition-colors duration-150';
  const activeStyle =
    'bg-gray-200/50 dark:bg-gray-700/50 text-gray-900 dark:text-white';
  const inactiveStyle =
    'text-gray-700 dark:text-gray-300 hover:bg-gray-200/30 dark:hover:bg-gray-700/30';

  // New handler: Only close the sidebar if we're on a mobile screen
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) { // 1024px is the 'lg' breakpoint
      onClose();
    }
  };


  return (
    <>
      <aside
        className={`



          bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg
          h-full fixed top-0 left-0 z-40



          flex flex-col

          overflow-hidden
          transition-all duration-300 ease-in-out
          lg:sticky lg:h-screen ${/* Desktop behavior */ ''}
          w-80 p-6 ${/* Mobile is always w-80 */ ''}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${/* Mobile position toggle */ ''}
          lg:translate-x-0 ${/* Desktop always in place */ ''}
          ${isOpen ? 'lg:w-80 lg:p-6' : 'lg:w-0 lg:p-0'} ${/* Desktop width toggle */ ''}



        `}
      >
        {/* --- SEGMENT 1: LOGO --- */}
        <div className="flex items-center justify-between mb-4">
          {/* Main Logo (links to Admin Home) */}
         



      



   

          <Link


          href="/admin"
          onClick={handleLinkClick}

            className="text-gray-800 dark:text-white"
            aria-label="MedicPortal Admin Home"
          >
            {/* 1. Light Mode Logo (Visible by default, hidden in dark mode) */}
            {/* REPLACE this src with your dark-text logo */}
            <img
              src="/assets/logos/logo-color.png"
              alt="MedicPortal Home"
              className="h-9 w-auto dark:hidden"
            />
            {/* 2. Dark Mode Logo (Your original white logo) */}
            {/* This is hidden by default, and shown in dark mode */}
            <img
              src="/assets/logos/logo-final.png"
              alt="MedicPortal Home"
              className="h-9 w-auto hidden dark:block"
            />
          </Link>








          {/* "All Resources" Button Removed */}
        </div>

        {/* This div contains all the scrolling content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
          
          {/* --- "MedicPortal" Card Removed --- */}

          {/* --- SEGMENT 2: ADMIN NAV --- */}
          <nav className="flex flex-col gap-2 mt-4">
            
            <Link
              onClick={handleLinkClick}
              href="/admin"
              className={`${navLinkBase} ${
                pathname === '/admin' ? activeStyle : inactiveStyle
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Admin Home</span>
            </Link>

            <Link
              onClick={handleLinkClick}
              href="/admin/questions"
              className={`${navLinkBase} ${
                pathname.startsWith('/admin/questions') ? activeStyle : inactiveStyle
              }`}
            >
              <FileQuestion className="h-5 w-5" />
              <span>Questions</span>
            </Link>


<Link
  onClick={handleLinkClick}
  href="/admin/qbanks"
  className={`${navLinkBase} ${
    pathname.startsWith('/admin/qbanks') ? activeStyle : inactiveStyle
  }`}
>
  <BookOpenCheck className="h-5 w-5" />
  <span>Qbanks</span>
</Link>

            <Link
              onClick={handleLinkClick}
              href="/admin/users"
              className={`${navLinkBase} ${
                pathname.startsWith('/admin/users') ? activeStyle : inactiveStyle
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </Link>



 {/* --- NEW SETTINGS LINK --- */}
   <Link
 onClick={handleLinkClick}
  href="/admin/settings"
  className={`${navLinkBase} ${
 pathname.startsWith('/admin/settings') ? activeStyle : inactiveStyle
 }`}
 >
 <Settings className="h-5 w-5" />
  <span>Site Settings</span>
 </Link>





            {/* --- DIVIDER --- */}
            <hr className="my-4 border-gray-300 dark:border-gray-700" />

            <Link
              onClick={handleLinkClick}
              href="/admin/mock-tests"
              className={`${navLinkBase} ${
                pathname.startsWith('/admin/mock-tests') ? activeStyle : inactiveStyle
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Mock Tests</span>
            </Link>

            <Link
              onClick={handleLinkClick}
              href="/admin/study-material"
              className={`${navLinkBase} ${
                pathname.startsWith('/admin/study-material') ? activeStyle : inactiveStyle
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Study Material</span>
            </Link>


{/* --- Dashboard Link (This one was correct) --- */}
  <Link
    onClick={handleLinkClick}
    href="/dashboard"
    className={`${navLinkBase} ${
      pathname.startsWith('/dashboard') ? activeStyle : inactiveStyle
    }`}
  >
    <LayoutGrid className="h-5 w-5" />
    <span>Go to Dashboard</span>
  </Link>




          </nav>

          {/* --- Secondary Nav Removed --- */}
          
        </div>

        {/* --- SEGMENT 5: FOOTER (pinned to bottom) --- */}
        <footer className="mt-auto pt-4">
          
          {/* "Refer a Friend" Card Removed */}

          {/* Theme Toggle & Links (Kept for consistency) */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="#" // You can update this to /privacy
              className="text-xs text-gray-600 dark:text-gray-400 hover:underline whitespace-nowrap"
            >
              Privacy
            </a>
            <a
              href="#" // You can update this to /terms
              className="text-xs text-gray-600 dark:text-gray-400 hover:underline whitespace-nowrap"
            >
              Terms
            </a>
          </div>
        </footer>
      </aside>

      {/* --- "AllResourcesPopup" Removed --- */}
    </>
  );
}