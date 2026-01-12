
import React, { useState } from 'react';
import { Question, UserAnswer, TestResult } from '../types';

interface ResultViewProps {
  questions: Question[];
  answers: UserAnswer[];
  result: TestResult;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ questions, answers, result, onRestart }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'incorrect' | 'correct'>('all');

  const filteredQuestions = questions.filter((q, idx) => {
    const isCorrect = answers[idx].selectedOptionIndex === q.correctIndex;
    if (activeTab === 'correct') return isCorrect;
    if (activeTab === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black tracking-tight">Review</h2>
        <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">Performance Analysis</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Score', value: `${result.score}/${result.totalQuestions}`, color: 'text-black' },
          { label: 'Accuracy', value: `${result.accuracy}%`, color: 'text-blue-600' },
          { label: 'Correct', value: result.correctCount, color: 'text-green-500' },
          { label: 'Incorrect', value: result.incorrectCount, color: 'text-red-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded border border-gray-200 text-center space-y-1">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-center bg-gray-100 p-1 rounded self-center">
          {(['all', 'correct', 'incorrect'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-smooth ${
                activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const globalIdx = questions.findIndex(item => item.id === q.id);
            const userAnswer = answers[globalIdx];
            const isCorrect = userAnswer.selectedOptionIndex === q.correctIndex;

            return (
              <div key={q.id} className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Question {globalIdx + 1}</span>
                    <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest ${
                      isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{q.question}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-4 rounded border text-xs font-semibold flex items-center gap-3 ${
                          optIdx === q.correctIndex
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : optIdx === userAnswer.selectedOptionIndex
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-transparent border-gray-100 text-gray-500'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-sm bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50/50 p-8 border-t border-gray-100 space-y-3">
                  <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Explanation</h4>
                  <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                    {q.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onRestart}
          className="px-12 py-3.5 rounded font-bold text-lg bg-black text-white shadow hover:translate-y-[-1px] transition-smooth uppercase tracking-widest text-sm"
        >
          New Session
        </button>
      </div>
    </div>
  );
};

export default ResultView;
