// src/app/admin/questions/page.tsx
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- ADD THIS

interface Question {
  id: number;
  text: string;
  topic: string;
  specialty: string;
  difficulty: string;
  qbank: { name: string }; // <-- ADD THIS
}

// --- END ---

// --- ADD THESE INTERFACES ---
interface Media { id: number; url: string; }
interface LearningPoint { id: number; text: string; }

interface FullQuestionDetails extends Question {
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  references: string[];
  stemMedia: Media[];
  explanationMedia: Media[];
  learningPoints: LearningPoint[];

}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);


  // --- ADD PAGINATION & MODAL STATE ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<FullQuestionDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // --- END ---


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // <-- ADD THIS

  useEffect(() => {
    const fetchQuestions = async () => {

      setLoading(true); // <-- Ensure loading state is set
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');



        // --- MODIFIED FETCH FOR PAGINATION ---
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions?page=${page}&limit=${limit}`, {



          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch questions.');

 
         const data: { questions: Question[], total: number } = await response.json();
         setQuestions(data.questions);
         setTotal(data.total);
        // --- END ---


      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [page, limit]); // <-- Re-fetch on page or limit change

  const handleDelete = async (questionId: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
    } catch (err: unknown) { // <-- THIS IS THE FIX
      if (err instanceof Error) {
        setError(err.message);
        alert(`Error: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
        alert('An unknown error occurred.');
      }
    }
  };


  // --- ADD THESE MODAL HANDLERS ---
  const handleView = async (questionId: number) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setError(null); // Clear list errors
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch question details.');
      const data: FullQuestionDetails = await response.json();
      setSelectedQuestion(data);
   

} catch (err: unknown) { // <-- Use unknown
      // Check if it's an Error object before accessing .message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching details.');
      }
    } finally {
      setModalLoading(false);
    }


  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setError(null); // Clear modal error
  };
  // --- END ---




  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Question Management
        </h1>
        <Link href="/admin/questions/new" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          + Add New Question
        </Link>
      </div>

      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">

         {loading && !questions.length && <p className="text-center dark:text-gray-300">Loading questions...</p>}
        {/* Show list error, but not modal errors */}

        {error && <p className="text-center text-red-500">{error}</p>}
        
        {questions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left dark:text-gray-300">
              <thead className="border-b border-gray-300/50 dark:border-gray-700/50">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Question Text</th>
                  <th className="p-4">Qbank</th>
                  <th className="p-4">Topic</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-50' : ''}> {/* Show table dimmed while loading new page */}
                {questions.map((question) => (
                  <tr key={question.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/20">
                    <td className="p-4">{question.id}</td>
                    <td className="p-4 max-w-sm truncate">{question.text}</td>
                    <td className="p-4">{question.qbank?.name || 'N/A'}</td>
                    <td className="p-4">{question.topic}</td>
                    <td className="p-4">{question.specialty}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        question.difficulty === 'EASY' ? 'bg-green-200 text-green-800' :
                        question.difficulty === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="p-4 flex gap-4 items-center">

                       <button
                          onClick={() => handleView(question.id)}
                          className="font-medium text-green-500 hover:underline"
                        >
                          View
                        </button>

                      <Link 
                        href={`/admin/questions/edit/${question.id}`} 
                        className="font-medium text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(question.id)}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* --- ADD PAGINATION COMPONENT --- */}
        {total > 0 && (
          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
        {/* --- END --- */}

      </div>

      {/* --- ADD MODAL COMPONENT --- */}
      {isModalOpen && (
        <QuestionDetailModal
          question={selectedQuestion}
          loading={modalLoading}
          error={error}
          onClose={closeModal}
          onEdit={(id) => router.push(`/admin/questions/edit/${id}`)}
        />
      )}
      {/* --- END --- */}



    </div>
  );
}


// --- ADD THIS HELPER COMPONENT ---
function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, onLimitChange }: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex justify-between items-center mt-6 dark:text-gray-300">
      <div>
        <label htmlFor="limit" className="text-sm mr-2">Items per page:</label>
        <select
          id="limit"
          value={itemsPerPage}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1); // Reset to first page
          }}
          className="p-1 rounded-md bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded disabled:opacity-50 bg-gray-200 dark:bg-gray-700"
        >
          &larr; Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded disabled:opacity-50 bg-gray-200 dark:bg-gray-700"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
// --- END ---

// --- ADD THIS HELPER COMPONENT ---
function QuestionDetailModal({ question, loading, error, onClose, onEdit }: {
  question: FullQuestionDetails | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onEdit: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Question #{question?.id || '...'}</h2>
          <div>
            {question && <button onClick={() => onEdit(question.id)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md mr-2">Edit</button>}
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">&times; Close</button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading && <p className="dark:text-gray-300">Loading details...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {question && (




            // Use Tailwind classes for layout
            <div className="space-y-6">
              {/* --- THIS IS THE CORRECT STRUCTURE TO ADD --- */}
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Qbank</p>
                <p className="mt-1 text-base dark:text-gray-200">{question.qbank?.name || 'Loading...'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Question Text</p>
                <p className="mt-1 text-base dark:text-gray-200 whitespace-pre-wrap">{question.text}</p>
                {/* Display Stem Media */}
                {question.stemMedia && question.stemMedia.length > 0 && (
                   <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                     {question.stemMedia.map(m => (
                       <img key={m.id} src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${m.url}`} alt="Stem media" className="rounded-md object-cover aspect-square" />
                     ))}
                   </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Options</p>
                <ul className="mt-2 space-y-2">
                  {question.options.map((opt, i) => (
                    <li key={i} className={`flex items-start p-3 rounded-md border ${i === question.correctAnswerIndex ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-700'}`}>
                      <span className={`flex-shrink-0 font-mono mr-3 ${i === question.correctAnswerIndex ? 'text-green-700 dark:text-green-300' : 'dark:text-gray-300'}`}>{String.fromCharCode(65 + i)}.</span>
                      <span className={`${i === question.correctAnswerIndex ? 'font-semibold text-green-800 dark:text-green-200' : 'dark:text-gray-200'}`}>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Explanation</p>
                <p className="mt-1 text-base dark:text-gray-200 whitespace-pre-wrap">{question.explanation || '-'}</p>
                 {/* Display Explanation Media */}
                {question.explanationMedia && question.explanationMedia.length > 0 && (
                   <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                     {question.explanationMedia.map(m => (
                       <img key={m.id} src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${m.url}`} alt="Explanation media" className="rounded-md object-cover aspect-square" />
                     ))}
                   </div>
                 )}
              </div>







                {question.learningPoints.length > 0 && (



                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Points</p>
                  <ul className="mt-2 list-disc list-inside space-y-1 dark:text-gray-300">
                    {question.learningPoints.map(lp => <li key={lp.id}>{lp.text}</li>)}
                  </ul>
                </div>



                )}
                {question.references.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">References</p>
                  <ol className="mt-2 list-decimal list-inside space-y-1 text-sm dark:text-gray-400">
                    {question.references.map((ref, i) => <li key={i}>{ref}</li>)}
                  </ol>
                </div>
              )}
                
                {/* --- END ADDED STRUCTURE --- */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// --- END ---