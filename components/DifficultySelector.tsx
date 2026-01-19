
import React from 'react';
import { Difficulty, DifficultySplit } from '../types.ts';
import { DIFFICULTY_PRESETS } from '../constants.tsx';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  split: DifficultySplit;
  onChange: (difficulty: Difficulty, split: DifficultySplit) => void;
  onBack: () => void;
  onNext: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulty, split, onChange, onBack, onNext }) => {
  const handlePresetSelect = (d: Difficulty) => {
    if (d === 'Custom') {
      onChange(d, split);
    } else {
      onChange(d, DIFFICULTY_PRESETS[d as keyof typeof DIFFICULTY_PRESETS]);
    }
  };

  const handleSplitChange = (key: keyof DifficultySplit, val: number) => {
    const newSplit = { ...split, [key]: val };
    onChange('Custom', newSplit);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight uppercase">Challenge Level</h2>
        <p className="text-gray-500 font-medium text-sm">Choose your desired level of difficulty.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-w-4xl mx-auto">
        {(['Easy', 'Medium', 'Hard', 'Mixed', 'Custom'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => handlePresetSelect(d)}
            className={`p-4 rounded-sm border transition-smooth flex flex-col items-center gap-1 ${
              difficulty === d
                ? 'border-black bg-black text-white shadow-sm'
                : 'border-gray-200 bg-transparent hover:border-gray-400'
            }`}
          >
            <span className="font-bold text-sm">{d}</span>
          </button>
        ))}
      </div>

      {difficulty === 'Custom' && (
        <div className="max-w-md mx-auto p-8 bg-transparent rounded-sm border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <span>Easy</span>
              <span>{split.easy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={split.easy}
              onChange={(e) => handleSplitChange('easy', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-sm appearance-none cursor-pointer accent-black"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <span>Medium</span>
              <span>{split.medium}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={split.medium}
              onChange={(e) => handleSplitChange('medium', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-sm appearance-none cursor-pointer accent-black"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <span>Hard</span>
              <span>{split.hard}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={split.hard}
              onChange={(e) => handleSplitChange('hard', parseInt(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-sm appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 pt-8">
        <button
          onClick={onBack}
          className="px-8 py-2.5 rounded-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-smooth text-sm"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2.5 rounded-sm font-bold bg-black text-white shadow-sm hover:translate-y-[-1px] transition-smooth text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;
