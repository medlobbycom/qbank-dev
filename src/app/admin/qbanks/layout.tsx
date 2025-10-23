// src/app/admin/questions/layout.tsx
import { Metadata } from 'next';
import React from 'react';

// --- This is your new page title & SEO ---
export const metadata: Metadata = {
  // Using your h1 tag and requested format
  title: 'Qbanks Management - Admin Dashboard | Medicportal', 
  description: 'View, edit, and manage all Qbanks in the question bank.',
};

// This layout just passes the children (your page.tsx) through
export default function AdminQuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}