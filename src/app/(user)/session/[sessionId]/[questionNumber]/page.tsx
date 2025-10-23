// src/app/(user)/session/[sessionId]/[questionNumber]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

import { useRouter } from 'next/navigation';
// --- ADD LIGHTBOX IMPORTS ---
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// Optional: Import plugins if needed (e.g., Zoom, Thumbnails)
// import Zoom from "yet-another-react-lightbox/plugins/zoom";
// --- END ---

import QuestionNavigator from '@/components/QuestionNavigator';

// Removed duplicate basic Question interface

interface Attempt { questionId: number, isCorrect: boolean }



// --- ADD THESE ---
interface Media { id: number; url: string; }
interface LearningPoint { id: number; text: string; }
// --- END ---

// --- MODIFIED INTERFACES ---
interface Question {
   id: number;
   text: string;
   options: string[];
  stemMedia?: Media[]; // <-- ADD THIS
}
interface AnswerResult {
   isCorrect: boolean;
   correctAnswerIndex: number;
   explanation: string;
  explanationMedia?: Media[];  // <-- ADD THIS
  learningPoints?: LearningPoint[]; // <-- ADD THIS
  references?: string[];       // <-- ADD THIS
}
// --- END MODIFIED ---

export default function SessionPage({ params }: { params: { sessionId: string; questionNumber: string } }) {
  const router = useRouter();
  const { sessionId, questionNumber } = params;
  const questionIndex = parseInt(questionNumber, 10) - 1;

  const [questions, setQuestions] = useState<Question[]>([]);
  // This state will now be populated from the database on page load
  const [attempts, setAttempts] = useState<Attempt[]>([]); 
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);


  // --- ADD LIGHTBOX STATE ---
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // --- END ---


  useEffect(() => {
    // THIS IS THE FIX: This function now fetches EVERYTHING for the session,
    // including past attempts, from the database.
    const initializeSession = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to load session');
        const data = await response.json();
        
        setQuestions(data.questions.filter(Boolean));
        setAttempts(data.attempts); // <-- Load previous attempts from the database
        setQuestionIds(data.session.questionIds);

      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    initializeSession();
  }, [sessionId, router]);

  const handleCheckAnswer = async () => {
    if (selectedOptionIndex === null) return;
    const token = localStorage.getItem('token');
    const currentQuestion = questions[questionIndex];
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/question/${currentQuestion.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ selectedOptionIndex }),
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      const resultData = await response.json();
      setLastResult(resultData);
      setIsAnswerChecked(true);
      
      const newAttempt = { questionId: currentQuestion.id, isCorrect: resultData.isCorrect };
      // Update the local attempts state for instant UI feedback
      setAttempts(prev => [...prev.filter(a => a.questionId !== newAttempt.questionId), newAttempt]);

    } catch (error) { console.error(error); alert('Error checking answer.'); }
  };
  
  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextQuestionNumber = questionIndex + 2;
      router.push(`/session/${sessionId}/${nextQuestionNumber}`);
      setSelectedOptionIndex(null);
      setIsAnswerChecked(false);
      setLastResult(null);
    } else {
      router.push('/clinical/qbank');
    }
  };
  
  if (loading) return <div className="text-center p-8">Loading Quiz...</div>;

  const currentQuestion = questions[questionIndex];
  if (!currentQuestion) return <div className="text-center p-8">Question not found.</div>;


  // --- PREPARE SLIDES FOR LIGHTBOX ---
  const allMedia = [
    ...(currentQuestion.stemMedia || []),
    ...(lastResult?.explanationMedia || [])
  ];
  const slides = allMedia.map(media => ({
    src: `${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`
  }));
  // --- END ---

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <QuestionNavigator 
          sessionId={sessionId}
          questionIds={questionIds}
          currentQuestionNumber={parseInt(questionNumber, 10)}
          attempts={attempts} // Pass the attempts from the database
          mode="live"
          basePath={`/session/${sessionId}`}
        />
      </div>

      <div className="lg:col-span-3">
        {/* The JSX for the quiz UI does not need to change */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">


          {/* Question Text (Moved Up) */}
          <p className="text-lg md:text-xl font-medium mb-6 dark:text-gray-200">{currentQuestion.text}</p>
          {/* Stem Media (Moved Down) */}


          {currentQuestion.stemMedia && currentQuestion.stemMedia.length > 0 && (
           




            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentQuestion.stemMedia.map((media, index) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index); // Index within allMedia
                    setLightboxOpen(true);
                  }}
                  className="overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >


                    <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`} alt="Question media" className="object-cover w-full h-full aspect-square hover:opacity-80 transition-opacity" />
                </button>

              ))}
            </div>
          )}

          <div className="space-y-4">
            {currentQuestion.options.map((option: string, index: number) => {
                let buttonClass = 'bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50';
                if (isAnswerChecked && lastResult) {
                  if (index === lastResult.correctAnswerIndex) {
                    buttonClass = 'bg-green-500 text-white';
                  } else if (index === selectedOptionIndex && !lastResult.isCorrect) {
                    buttonClass = 'bg-red-500 text-white';
                  }
                } else if (index === selectedOptionIndex) {
                  buttonClass = 'bg-indigo-200 dark:bg-indigo-900 border-indigo-500 ring-2 ring-indigo-500';
                }
                return (
                    <button
                      key={index}
                      onClick={() => !isAnswerChecked && setSelectedOptionIndex(index)}
                      disabled={isAnswerChecked}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${buttonClass}`}
                    >
                      <span className="font-mono mr-4">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </button>
                );
            })}
          </div>
        </div>
        
        {isAnswerChecked && lastResult?.explanation && (
          <div className="mt-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
            <h3 className="font-bold text-lg dark:text-white mb-2">Explanation</h3>

            {/* --- MODIFIED EXPLANATION BLOCK --- */}
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lastResult.explanation }} />

            {lastResult.explanationMedia && lastResult.explanationMedia.length > 0 && (
              <div className="mt-4 space-y-4">


                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {lastResult.explanationMedia.map((media, index) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => {
                            // Calculate index relative to combined array
                            setLightboxIndex((currentQuestion.stemMedia?.length || 0) + index);
                            setLightboxOpen(true);
                          }}
                          className="overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {/* Updated env variable */}

                            <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`} alt="Explanation media" className="object-cover w-full h-full aspect-square hover:opacity-80 transition-opacity" />
                        </button>




                ))}
              </div>
                        </div>
            )}

            {lastResult.learningPoints && lastResult.learningPoints.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold dark:text-white mb-2">Learning Points</h4>
                <ul className="list-disc list-inside space-y-1 dark:text-gray-300">
                  {lastResult.learningPoints.map(lp => <li key={lp.id}>{lp.text}</li>)}
                </ul>
              </div>
            )}

            {lastResult.references && lastResult.references.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold dark:text-white mb-2">References</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm dark:text-gray-400">
                  {lastResult.references.map((ref, i) => <li key={i}>{ref}</li>)}
                </ol>
              </div>
            )}
            {/* --- END MODIFIED BLOCK --- */}

          </div>
        )}
        
        <div className="mt-8 flex justify-end">
          {isAnswerChecked ? (
            <button onClick={handleNextQuestion} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700">
              {questionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          ) : (
            <button onClick={handleCheckAnswer} disabled={selectedOptionIndex === null} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Check Answer
            </button>
          )}
        </div>
      </div>

      
      {/* --- ADD LIGHTBOX COMPONENT --- */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
        // plugins={[Zoom]} // Optional: Add plugins here
      />
      {/* --- END --- */}
    </div>
  );
}