import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Center | MedicPortal',
  description: 'Get help, submit a ticket, and find answers to your questions.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}