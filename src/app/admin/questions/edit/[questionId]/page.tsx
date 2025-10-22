
// src/app/admin/questions/edit/[questionId]/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Qbank { id: number; name: string; }
interface QuestionData {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  specialty: string;
  difficulty: string;
  qbankId: number;
}

export default function EditQuestionPage({ params }: { params: { questionId: string } }) {
  const router = useRouter();
  const { questionId } = params;

  const [formData, setFormData] = useState<Partial<QuestionData>>({});
  const [qbanks, setQbanks] = useState<Qbank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchInitialData = async () => {
      try {
        const [qbanksRes, questionRes] = await Promise.all([


fetch(`${process.env.NEXT_PUBLIC_API_URL}/qbanks`, { headers: { Authorization: `Bearer ${token}` } }),


          fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (!qbanksRes.ok || !questionRes.ok) throw new Error('Failed to load data');

        const qbanksData = await qbanksRes.json();
        const questionData = await questionRes.json();
        setQbanks(qbanksData);
        setFormData(questionData as Partial<QuestionData>);
      } catch (error) {
        // log for debugging and show friendly error
        // eslint-disable-next-line no-console
        console.error(error);
        setError('Failed to load question data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [questionId]);

  function setField<K extends keyof QuestionData>(name: K, value: QuestionData[K]) {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof QuestionData;
    let value: unknown = e.target.value;

    // convert to correct types for specific fields
    if (e.target instanceof HTMLSelectElement && (name === 'qbankId' || name === 'correctAnswerIndex')) {
      value = parseInt(e.target.value, 10);
    } else if (e.target instanceof HTMLInputElement && e.target.type === 'radio' && name === 'correctAnswerIndex') {
      value = parseInt(e.target.value, 10);
    } else if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
      value = Number(e.target.value);
    }

    setField(name, value as QuestionData[typeof name]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const base = formData.options ?? ['', '', '', '', ''];
    const newOptions = [...base];
    newOptions[index] = value;
    setField('options', newOptions);
  };

  const handleCorrectAnswerSelect = (index: number) => {
    setField('correctAnswerIndex', index);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update question');
      setSuccess('Question updated successfully! Redirecting...');
      setTimeout(() => router.push('/admin/questions'), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) { setError(err.message); }
      else { setError('Unknown error'); }
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  if (loading) return <div>Loading question for editing...</div>;
  if (error && !formData.text) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* Added text-gray-800 to match 'Add' page dark:text-white is already there */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Question #{questionId}</h1>
        <Link href="/admin/questions" className="text-sm text-indigo-500 hover:underline">&larr; Back to List</Link>
      </div>
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* --- MOVED AND STYLED TO MATCH 'ADD' PAGE --- */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Master Category (Qbank)</label>
            <select
              name="qbankId"
              value={formData.qbankId ?? ''}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a category</option>
              {qbanks.map(q => (<option key={q.id} value={q.id}>{q.name}</option>))}
            </select>
          </div>

          {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Question Text</label>
            <textarea
              name="text"
              value={formData.text ?? ''}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            {/* --- UPDATED LABEL TO MATCH 'ADD' PAGE --- */}
            <label className="block text-sm font-medium dark:text-gray-300">Options (Select the correct one)</label>
            <div className="space-y-2 mt-1">
              {(formData.options ?? ['', '', '', '', '']).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswerIndex"
                    value={index}
                    checked={formData.correctAnswerIndex === index}
                    onChange={() => handleCorrectAnswerSelect(index)}
                    // --- STYLED TO MATCH 'ADD' PAGE ---
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    placeholder={`Option ${index + 1}`}
                    // --- STYLED TO MATCH 'ADD' PAGE (kept w-full, which is fine in flex) ---
                    className="w-full p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">Explanation</label>
            <textarea
              name="explanation"
              value={formData.explanation ?? ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Topic</label>
              <input type="text" name="topic" value={formData.topic ?? ''} onChange={handleInputChange} required 
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Specialty</label>
              <input type="text" name="specialty" value={formData.specialty ?? ''} onChange={handleInputChange} required 
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Difficulty</label>
              <select name="difficulty" value={formData.difficulty ?? 'MEDIUM'} onChange={handleInputChange} 
                className="w-full mt-1 p-2 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            
            {/* This div was moved to the top of the form */}
            
          </div>

          <div className="pt-4">
            {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
            <button type="submit" 
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Update Question
            </button>
            
            {/* --- STYLED TO MATCH 'ADD' PAGE --- */}
            {success && <p className="text-sm text-center text-green-500 mt-4">{success}</p>}
            {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
