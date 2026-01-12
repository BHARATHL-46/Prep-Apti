
import React from 'react';
import { TestResult } from '../types';

interface HistoryViewProps {
  tests: TestResult[];
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ tests, onBack }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tight">Performance History</h1>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Your Professional Growth Track</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {tests.length === 0 ? (
          <div className="py-24 text-center bg-white border border-dashed border-gray-200 rounded-sm">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">No attempts recorded yet.</p>
            <button onClick={onBack} className="mt-6 px-8 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm">Take First Test</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.slice().reverse().map((test) => (
              <div key={test.date} className="bg-white p-6 border border-gray-100 shadow-premium rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:translate-x-1 transition-smooth">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-sm flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{new Date(test.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black">{new Date(test.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="text-lg font-black">{test.score} / {test.totalQuestions}</div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(test.date).toLocaleTimeString()} • Accuracy: {test.accuracy}%</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest ${
                    test.accuracy >= 80 ? 'bg-green-50 text-green-600' :
                    test.accuracy >= 50 ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {test.accuracy >= 80 ? 'Mastery' : test.accuracy >= 50 ? 'Developing' : 'Review Needed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={onBack} className="px-8 py-3 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-smooth">Back to Home</button>
      </div>
    </div>
  );
};

export default HistoryView;
