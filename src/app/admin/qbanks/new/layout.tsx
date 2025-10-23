// src/app/admin/questions/new/layout.tsx
import { Metadata } from 'next';
import React from 'react';

// --- NEW: Page Title & SEO Description ---
export const metadata: Metadata = {
  // This will become "Add New Question - Admin Dashboard | MedicPortal"
  title: 'Add New Qbank - Admin Dashboard', 
  description: 'Create a new Qbank for the question bank.',
};

// This layout just passes the children (your page.tsx) through
export default function NewQuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}