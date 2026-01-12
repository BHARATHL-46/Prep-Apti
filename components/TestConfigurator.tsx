
import React, { useState } from 'react';

interface TestConfiguratorProps {
  questionCount: number;
  duration: number;
  onChange: (count: number, duration: number) => void;
  onBack: () => void;
  onStart: () => void;
}

const TestConfigurator: React.FC<TestConfiguratorProps> = ({ 
  questionCount, 
  duration, 
  onChange, 
  onBack, 
  onStart 
}) => {
  const [isCustomTotal, setIsCustomTotal] = useState(false);
  const presets = [5, 10, 30, 60, 100];

  const handlePresetClick = (val: number) => {
    setIsCustomTotal(false);
    onChange(val, duration);
  };

  const handleManualChange = (val: number) => {
    onChange(Math.max(1, val), duration);
  };

  const handleDurationChange = (val: number) => {
    onChange(questionCount, Math.max(1, val));
  };

  const inputClass = "w-full px-4 py-3 text-lg font-black bg-transparent border border-gray-300 rounded-sm focus:ring-1 focus:ring-black outline-none transition-smooth";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tight uppercase">Configuration</h2>
        <p className="text-gray-500 font-medium text-sm">Finalize your session parameters.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-sm border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-black"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Total Questions</h3>
            </div>
            <span className="text-xl font-black">{questionCount}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => handlePresetClick(p)}
                className={`flex-grow py-3 rounded-sm border font-black text-[10px] uppercase transition-smooth ${
                  !isCustomTotal && questionCount === p 
                    ? 'bg-black text-white border-black' 
                    : 'bg-transparent text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setIsCustomTotal(true)}
              className={`flex-grow py-3 rounded-sm border font-black text-[10px] uppercase transition-smooth ${
                isCustomTotal 
                  ? 'bg-black text-white border-black' 
                  : 'bg-transparent text-gray-400 border-gray-200 hover:border-gray-300'
              }`}
            >
              Manual
            </button>
          </div>

          {isCustomTotal && (
            <div className="pt-4 animate-in slide-in-from-top-2 duration-300">
              <input
                type="number"
                value={questionCount}
                onChange={(e) => handleManualChange(parseInt(e.target.value) || 1)}
                placeholder="Enter total count..."
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-sm border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Duration (Minutes)</h3>
          </div>
          <div className="space-y-4">
            <input
              type="number"
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
              className={inputClass.replace('text-lg', 'text-2xl')}
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Session will terminate automatically when time expires.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-smooth"
        >
          Back
        </button>
        <button
          onClick={onStart}
          className="px-10 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-black text-white shadow-md hover:translate-y-[-1px] transition-smooth"
        >
          Begin Session
        </button>
      </div>
    </div>
  );
};

export default TestConfigurator;
