'use client';
import { useState } from 'react';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return alert('Select a file first');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/import`, {

      method: 'POST',
      body: formData,
    });

    if (res.ok) setMessage('✅ Import successful');
    else setMessage('❌ Import failed');
  };

  const handleExport = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/export`);


    if (!res.ok) return alert('Export failed');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_export.json';
    a.click();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Bulk Import / Export Questions</h1>
      <div className="space-y-4">
        <input
          type="file"
          accept=".json,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2"
        />
        <div className="flex gap-4">
          <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded">
            Import
          </button>
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded">
            Export
          </button>
        </div>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
