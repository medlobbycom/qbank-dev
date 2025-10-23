'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Qbank { id: number; name: string; }

// --- ADD THIS ---
interface Media {
  id: number;
  url: string;
}
// --- END ---

const API_BASE = process.env.NEXT_PUBLIC_API_URL;




export default function NewQuestionPage() {
  const router = useRouter();

  // Form state
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']); // 5 options
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [topic, setTopic] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  // --- ADD THESE ---
  const [learningPoints, setLearningPoints] = useState('');
  const [references, setReferences] = useState('');
  const [stemMedia, setStemMedia] = useState<Media[]>([]);
  const [explanationMedia, setExplanationMedia] = useState<Media[]>([]);
  // --- END ---
  const [qbankId, setQbankId] = useState<number | null>(null);

  // Data/UI state
  const [qbanks, setQbanks] = useState<Qbank[]>([]);
  const [loadingQbanks, setLoadingQbanks] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- ADD THESE ---
  const [uploadingStem, setUploadingStem] = useState(false);
  const [uploadingExplanation, setUploadingExplanation] = useState(false);
  // --- END ---

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchQbanks = async () => {
      setLoadingQbanks(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token in localStorage');
        setError('Not authenticated. Please login.');
        setLoadingQbanks(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/qbanks`, { // <-- REMOVED /api
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const txt = await response.text().catch(() => response.statusText);
          throw new Error(`Failed to fetch qbanks: ${response.status} ${txt}`);
        }
        const data: Qbank[] = await response.json();
        setQbanks(data);
        setQbankId(data?.[0]?.id ?? null); // default to first if available
      } catch (err) {
        console.error(err);
        setError('Failed to load categories.');
      } finally {
        setLoadingQbanks(false);
      }
    };
    fetchQbanks();
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };


  // --- ADD THIS FUNCTION ---
  const handleFileUpload = async (file: File, type: 'stem' | 'explanation') => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please login.');
      return;
    }

    if (type === 'stem') setUploadingStem(true);
    if (type === 'explanation') setUploadingExplanation(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Upload failed (${response.status})`);
      }

      const data: Media = await response.json();

      if (type === 'stem') {
        setStemMedia(prev => [...prev, data]);
      } else {
        setExplanationMedia(prev => [...prev, data]);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'File upload failed');
    } finally {
      if (type === 'stem') setUploadingStem(false);
      if (type === 'explanation') setUploadingExplanation(false);
    }
  };
  // --- END ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!qbankId) {
      setError('Please select a Master Category.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          options,
          correctAnswerIndex,
          explanation,
          topic,
          specialty,
          difficulty,
          qbankId,

          // --- ADD THESE ---
          learningPoints: learningPoints.split('\n').filter(Boolean), // Send as array
          references: references.split('\n').filter(Boolean), // Send as array
          stemMediaIds: stemMedia.map(m => m.id), // Send as array of IDs
          explanationMediaIds: explanationMedia.map(m => m.id), // Send as array of IDs
          // --- END ---

        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to create question (${response.status})`);
      }

      setSuccess('Question created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/questions'), 1200);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // ---------- Modal handlers ----------
  const handleImport = async (e?: FormEvent) => {
    e?.preventDefault();
    setModalMessage(null);
    if (!importFile) { setModalMessage('Select a file to import'); return; }
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // if JSON -> send JSON body, if CSV -> send as form-data
      if (importFile.name.toLowerCase().endsWith('.json')) {
        const txt = await importFile.text();
        const body = JSON.parse(txt);
        const res = await fetch(`${API_BASE}/api/questions/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const b = await res.text().catch(() => null);
          throw new Error(b || `${res.status} ${res.statusText}`);
        }
      } else {
        const fd = new FormData();
        fd.append('file', importFile);
        const res = await fetch(`${API_BASE}/api/questions/import`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) {
          const b = await res.text().catch(() => null);
          throw new Error(b || `${res.status} ${res.statusText}`);
        }
      }

      setModalMessage('Import successful');
      // optional: refresh qbanks/questions list (not needed here)
    



    } catch (err: unknown) {
      // keep console useful for debugging while satisfying eslint
      console.error(err);
      setModalMessage(err instanceof Error ? err.message : String(err ?? 'Import failed'));



    } finally {
      setModalLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    setModalMessage(null);
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE}/api/questions/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const b = await res.text().catch(() => null);
        throw new Error(b || `${res.status} ${res.statusText}`);
      }
      if (format === 'json') {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `questions_export.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // server could return CSV; otherwise try to convert JSON
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `questions_export.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setModalMessage('Export ready');
    

    } catch (err: unknown) {
      console.error(err);
      setModalMessage(err instanceof Error ? err.message : String(err ?? 'Export failed'));


    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add New Question</h1>
          <p className="text-sm text-gray-500">Create single question or import in bulk</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm border hover:bg-gray-200"
          >
            Import / Export
          </button>
          <Link href="/admin/questions" className="text-sm text-indigo-500 hover:underline">&larr; Back to List</Link>
        </div>
      </div>

      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Master Category (Qbank) Selector */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Master Category (Qbank)</label>
            <select
              value={qbankId ?? ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setQbankId(Number.isNaN(v) ? null : v);
              }}
              required
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {loadingQbanks && <option value="">Loading categories...</option>}
              {!loadingQbanks && qbanks.length === 0 && <option value="">No categories available</option>}
              {!loadingQbanks && qbanks.length > 0 && <option value="" disabled>Select a Qbank</option>}
              {qbanks.map(qbank => (
                <option key={qbank.id} value={qbank.id}>{qbank.name}</option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Question Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={3}
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>




          {/* --- ADD THIS SECTION --- */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Stem Media</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'stem') }}
              className="w-full mt-1 text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploadingStem && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {stemMedia.map((media) => (
                <div key={media.id} className="relative">
                  <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`} alt="Stem media" className="h-20 w-20 rounded object-cover" />
                  <button type="button" onClick={() => setStemMedia(prev => prev.filter(m => m.id !== media.id))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 text-xs leading-none">&times;</button>
                </div>
              ))}
            </div>
          </div>
          {/* --- END SECTION --- */}



          {/* Options (5) */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Options (Select the correct one)</label>
            <div className="space-y-2 mt-1">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswerIndex === index}
                    onChange={() => setCorrectAnswerIndex(index)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className="w-full p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* --- MODIFIED THIS SECTION --- */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Explanation</label>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3}
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Explanation Media</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'explanation') }}
              className="w-full mt-1 text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploadingExplanation && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {explanationMedia.map((media) => (
                <div key={media.id} className="relative">
                  <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`} alt="Explanation media" className="h-20 w-20 rounded object-cover" />
                  <button type="button" onClick={() => setExplanationMedia(prev => prev.filter(m => m.id !== media.id))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 text-xs leading-none">&times;</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Learning Points (One per line)</label>
            <textarea
              value={learningPoints} onChange={(e) => setLearningPoints(e.target.value)} rows={3}
              placeholder="Ulcerated skin lesions should raise suspicion of malignancy."
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300">References (One per line)</label>
            <textarea
              value={references} onChange={(e) => setReferences(e.target.value)} rows={3}
              placeholder="Arasu A, Meah N, Sinclair R. Skin checks in primary care..."
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {/* --- END MODIFIED SECTION --- */}



          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Specialty</label>
              <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Create Question
            </button>
            {success && <p className="text-sm text-center text-green-500 mt-4">{success}</p>}
            {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
          </div>
        </form>
      </div>

      {/* ---------- Modal ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Import / Export Questions</h2>
              <button className="text-gray-500" onClick={() => setModalOpen(false)}>Close</button>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleImport} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Upload CSV or JSON</label>
                  <input type="file" accept=".csv,application/json" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} className="mt-1" />
                </div>

                <div className="flex gap-2">
                  <button disabled={modalLoading} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Import</button>
                  <button type="button" onClick={() => { setImportFile(null); setModalMessage(null); }} className="px-4 py-2 border rounded">Clear</button>
                  <button type="button" onClick={() => handleExport('json')} className="ml-auto px-4 py-2 bg-green-600 text-white rounded">Export JSON</button>
                  <button type="button" onClick={() => handleExport('csv')} className="px-4 py-2 bg-gray-700 text-white rounded">Export CSV</button>
                </div>

                {modalMessage && <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{modalMessage}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
