
import React, { useState } from 'react';
import { APTITUDE_TOPICS } from '../constants.tsx';

interface TopicSelectorProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
  onNext: () => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopics, onChange, onNext }) => {
  const [customTopic, setCustomTopic] = useState('');

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onChange(selectedTopics.filter(t => t !== topic));
    } else {
      onChange([...selectedTopics, topic]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopic.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      onChange([...selectedTopics, trimmed]);
      setCustomTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    onChange(selectedTopics.filter(t => t !== topic));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tight uppercase">Select Topics</h2>
        <p className="text-gray-500 font-medium text-sm">Choose the subjects you want to practice.</p>
      </div>

      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto p-4 bg-gray-50/50 rounded-sm border border-dashed border-gray-200">
          {selectedTopics.map(topic => (
            <div 
              key={topic} 
              className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95 duration-200"
            >
              <span>{topic}</span>
              <button 
                onClick={() => removeTopic(topic)}
                className="hover:text-red-400 transition-colors border-l border-white/20 pl-2 ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
        {APTITUDE_TOPICS.map(topic => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`px-4 py-2 rounded-sm border transition-smooth text-[10px] font-black uppercase tracking-widest ${
                isSelected
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleAddCustom} className="max-w-md mx-auto flex gap-2">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Add custom topic (e.g. Logarithms)..."
          className="flex-grow px-4 py-2 rounded-sm border border-gray-200 bg-transparent focus:outline-none focus:ring-1 focus:ring-black transition-smooth text-xs font-bold"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-black text-white font-black rounded-sm hover:bg-gray-800 transition-smooth text-[10px] uppercase tracking-widest"
        >
          Add
        </button>
      </form>

      <div className="flex justify-center pt-8">
        <button
          onClick={onNext}
          disabled={selectedTopics.length === 0}
          className={`px-12 py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-smooth ${
            selectedTopics.length > 0
              ? 'bg-black text-white shadow-md hover:translate-y-[-1px]'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;
