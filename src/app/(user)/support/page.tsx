'use client';
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

// --- Reusable Helper Components (from your original file) ---

// Card style like SettingsSection
const SupportSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{description}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

// Form input style from settings page
const InputField = ({
  label,
  type,
  id,
  defaultValue,
  disabled = false,
}: {
  label: string;
  type: string;
  id: string;
  defaultValue: string;
  disabled?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      defaultValue={defaultValue}
      disabled={disabled}
      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 dark:disabled:bg-gray-800"
    />
  </div>
);

// Textarea style
const TextareaField = ({
  label,
  id,
  rows = 4,
}: {
  label: string;
  id: string;
  rows?: number;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      rows={rows}
      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Please describe your issue in detail..."
    />
  </div>
);

// FAQ item style
const FaqItem = ({ q, a }: { q: string; a: string }) => (
  <div className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 last:pb-0 last:border-0">
    <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a}</p>
  </div>
);

// Ticket item style
const TicketItem = ({
  subject,
  status,
  time,
}: {
  subject: string;
  status: 'Solved' | 'Pending';
  time: string;
}) => {
  const isSolved = status === 'Solved';
  const Icon = isSolved ? CheckCircle : Clock;
  const colorClass = isSolved ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400';

  return (
    <li className="flex items-start space-x-3">
      <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${colorClass}`} />
      <div className="flex-1">
        <p className="text-gray-900 dark:text-white font-medium">{subject}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Status: <span className={`font-medium ${colorClass}`}>{status}</span> - {time}
        </p>
      </div>
    </li>
  );
};


// --- Placeholder Data ---
const placeholderUser = {
  name: 'Irfan Murtaza',
  email: 'itkorai@gmail.com',
};

const faqs = [
  { q: 'How do I reset my password?', a: 'You can reset your password from the "Account Settings" page. If you are logged out, use the "Forgot Password" link on the login page.' },
  { q: 'How do I manage my subscription?', a: 'Visit "Account Settings" and click on the "Manage Subscription" button to be redirected to our payment provider portal.' },
  { q: 'Where can I find my session history?', a: 'Your session history is available on the "Session History" page, accessible from the main sidebar.' },
];

const recentTickets = [
  { subject: 'Issue with mock exam timer', status: 'Solved' as const, time: '1 day ago' },
  { subject: 'Question about subscription billing', status: 'Pending' as const, time: '3 hours ago' },
  { subject: 'Feedback on clinical question #452', status: 'Solved' as const, time: '3 days ago' },
];

// --- Main Page Component ---
export default function SupportPage() {
  return (
    // THIS IS THE FIX: Using the exact same wrapper as the settings page
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
        Support Center
      </h1>

      {/* --- SUBMIT A TICKET --- */}
      <SupportSection
        title="Submit a Ticket"
        description="We'll get back to you as soon as possible."
      >
        <InputField label="Full Name" id="fullName" type="text" defaultValue={placeholderUser.name} disabled />
        <InputField label="Email Address" id="email" type="email" defaultValue={placeholderUser.email} disabled />
        <InputField label="Subject" id="subject" type="text" defaultValue="" />
        <TextareaField label="Message" id="message" />
        <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Submit Ticket
        </button>
      </SupportSection>

      {/* --- RECENT TICKETS --- */}
      <SupportSection
        title="Recent Tickets"
        description="Check the status of your recent support requests."
      >
        <ul className="space-y-4">
          {recentTickets.map((ticket, index) => (
            <TicketItem
              key={index}
              subject={ticket.subject}
              status={ticket.status}
              time={ticket.time}
            />
          ))}
        </ul>
      </SupportSection>

      {/* --- FAQS --- */}
      <SupportSection
        title="Frequently Asked Questions"
        description="Find quick answers to common questions."
      >
        {faqs.map((faq, index) => (
          <FaqItem key={index} q={faq.q} a={faq.a} />
        ))}
      </SupportSection>
    </div>
  );
}