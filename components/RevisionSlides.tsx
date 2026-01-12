
import React, { useState } from 'react';
import { RevisionData } from '../types';

interface RevisionSlidesProps {
  data: RevisionData[];
  onClose: () => void;
  isReady?: boolean;
  onStartTest?: () => void;
}

const RevisionSlides: React.FC<RevisionSlidesProps> = ({ data, onClose, isReady, onStartTest }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!data || data.length === 0) return null;

  const current = data[activeIdx];

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-500 flex flex-col">
      {/* Toast Notification when ready */}
      {isReady && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/20">
            <span className="text-[10px] font-black uppercase tracking-widest">Questions are ready!</span>
            <button 
              onClick={onStartTest}
              className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-smooth"
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      <header className="px-6 h-16 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Revision Mode</span>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <span className="text-xs font-bold text-black uppercase tracking-widest">{current.topic}</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-smooth">
          <span className="text-lg">✕</span>
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Important Notes</h2>
          <p className="text-xl font-medium leading-relaxed text-gray-800 whitespace-pre-wrap">{current.basics}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Essential Formulas</h2>
            <div className="space-y-3">
              {current.formulas.map((f, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-sm border border-gray-100 font-mono text-sm font-bold text-gray-700">
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Tips & Shortcuts</h2>
            <div className="space-y-4">
              {current.tips.map((t, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-gray-100 bg-white sticky bottom-0 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {data.map((_, i) => (
            <div key={i} className={`h-1 transition-all duration-300 rounded-full ${i === activeIdx ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
        <div className="flex gap-2 items-center">
          {isReady && (
             <button 
                onClick={onStartTest}
                className="mr-4 px-6 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest bg-green-500 text-white hover:bg-green-600 transition-smooth shadow-lg animate-bounce"
             >
                Start Test Now
             </button>
          )}
          <button 
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx(p => p - 1)}
            className="px-6 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest bg-gray-100 disabled:opacity-30"
          >
            Prev
          </button>
          <button 
            disabled={activeIdx === data.length - 1}
            onClick={() => setActiveIdx(p => p + 1)}
            className="px-6 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest bg-black text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RevisionSlides;
