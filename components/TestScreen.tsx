
import React, { useState, useEffect } from 'react';
import { Question, UserAnswer } from '../types';

interface TestScreenProps {
  questions: Question[];
  targetTotal: number;
  isGenerating: boolean;
  durationMinutes: number;
  onFinish: (answers: UserAnswer[], timeSpentSeconds: number) => void;
}

const TestScreen: React.FC<TestScreenProps> = ({ questions, targetTotal, isGenerating, durationMinutes, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>(
    Array.from({ length: targetTotal }, (_, i) => ({
      questionId: `placeholder-${i}`,
      selectedOptionIndex: null
    }))
  );
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(answers.slice(0, questions.length), durationMinutes * 60 - timeLeft);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, answers, onFinish, questions.length]);

  const handleSelect = (optionIndex: number) => {
    if (!questions[currentIndex]) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      questionId: questions[currentIndex].id,
      selectedOptionIndex: optionIndex
    };
    setAnswers(newAnswers);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const answeredCount = answers.filter(a => a.selectedOptionIndex !== null).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <aside className="w-full lg:w-64 space-y-4 order-2 lg:order-1">
        <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Timer</span>
            <span className={`text-xl font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-black'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full bg-gray-50 h-1 rounded-sm overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-1000"
              style={{ width: `${(timeLeft / (durationMinutes * 60)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <span>Progress</span>
            <span>{answeredCount}/{targetTotal}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: targetTotal }).map((_, idx) => {
              const isAvailable = idx < questions.length;
              const hasAnswer = answers[idx]?.selectedOptionIndex !== null;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full aspect-square rounded-sm text-[10px] font-black transition-smooth flex items-center justify-center border ${currentIndex === idx
                    ? 'bg-black text-white border-black shadow-sm'
                    : hasAnswer
                      ? 'bg-gray-100 text-black border-gray-200'
                      : isAvailable
                        ? 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                        : 'bg-transparent text-gray-200 border-dashed border-gray-200 cursor-wait'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          {isGenerating && (
            <div className="pt-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black uppercase text-blue-500 tracking-wider">AI Crafting... ({questions.length}/{targetTotal})</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onFinish(answers.slice(0, questions.length), durationMinutes * 60 - timeLeft)}
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-sm hover:bg-black transition-smooth shadow-sm text-xs uppercase tracking-widest"
        >
          Finish Test
        </button>
      </aside>

      <main className="flex-grow space-y-6 order-1 lg:order-2">
        <div className="bg-white p-8 md:p-10 rounded-sm border border-gray-200 shadow-sm min-h-[500px] flex flex-col transition-smooth">
          {currentQuestion ? (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Q {currentIndex + 1}
                  </span>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{currentQuestion.topic} • {currentQuestion.difficulty}</span>
                </div>
              </div>

              <div className="flex-grow mb-10">
                <h1 className="text-xl font-bold leading-relaxed mb-10 text-gray-900">
                  {currentQuestion.question}
                </h1>

                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`p-4 rounded-sm border transition-smooth group flex items-center gap-4 text-sm ${currentAnswer.selectedOptionIndex === idx
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-gray-200 bg-transparent hover:border-gray-400 text-gray-700'
                        }`}
                    >
                      <span className={`w-6 h-6 rounded-sm border flex items-center justify-center font-black text-[10px] shrink-0 ${currentAnswer.selectedOptionIndex === idx ? 'border-white/30 bg-white/10' : 'border-gray-200 bg-white'
                        }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-semibold">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 animate-pulse">
              <div className="w-16 h-1 bg-gray-100 rounded-full"></div>
              <div className="space-y-3 w-full">
                <div className="h-4 bg-gray-50 rounded-sm w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-50 rounded-sm w-1/2 mx-auto"></div>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">AI is brainstorming Q{currentIndex + 1}...</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2 rounded-sm font-bold text-gray-400 disabled:opacity-0 hover:text-black transition-smooth text-[10px] uppercase tracking-widest"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                } else if (!isGenerating || currentIndex === targetTotal - 1) {
                  onFinish(answers.slice(0, questions.length), durationMinutes * 60 - timeLeft);
                }
              }}
              className="px-6 py-2.5 rounded-sm font-bold bg-black text-white hover:translate-y-[-1px] transition-smooth shadow-sm text-[10px] uppercase tracking-widest"
            >
              {currentIndex === targetTotal - 1 || (currentIndex === questions.length - 1 && !isGenerating) ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestScreen;
