
import React from 'react';
import { WeightageMode, TopicWeightage } from '../types.ts';

interface WeightageSelectorProps {
  topics: string[];
  mode: WeightageMode;
  weightages: TopicWeightage[];
  onChange: (mode: WeightageMode, weightages: TopicWeightage[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const WeightageSelector: React.FC<WeightageSelectorProps> = ({ 
  topics, 
  mode, 
  weightages, 
  onChange, 
  onBack, 
  onNext 
}) => {
  const totalWeight = weightages.reduce((sum, w) => sum + w.percentage, 0);

  const handleModeChange = (newMode: WeightageMode) => {
    let newWeightages = [...weightages];
    if (newMode === 'Equal') {
      const perTopic = Math.floor(100 / topics.length);
      const remainder = 100 % topics.length;
      newWeightages = topics.map((t, i) => ({
        topic: t,
        percentage: perTopic + (i < remainder ? 1 : 0)
      }));
    }
    onChange(newMode, newWeightages);
  };

  const handlePercentageChange = (topicName: string, newValue: number) => {
    const oldWeightage = weightages.find(w => w.topic === topicName);
    if (!oldWeightage) return;

    // Constrained update logic
    const otherTopics = weightages.filter(w => w.topic !== topicName);
    if (otherTopics.length === 0) {
      onChange('Custom', [{ topic: topicName, percentage: 100 }]);
      return;
    }

    const otherTotal = otherTopics.reduce((s, w) => s + w.percentage, 0);
    const diff = newValue - oldWeightage.percentage;

    // Check if we can satisfy the increase by decreasing others
    // Or if we can satisfy the decrease by increasing others
    // Max value for slider i = oldPercentage + otherTotal
    // Min value for slider i = 0 (but we can always reach 0)
    
    const cappedNewValue = Math.min(newValue, oldWeightage.percentage + otherTotal);
    const actualDiff = cappedNewValue - oldWeightage.percentage;

    if (actualDiff === 0) return;

    let newWeightages = weightages.map(w => {
      if (w.topic === topicName) return { ...w, percentage: cappedNewValue };
      
      // Distribute the diff among others proportionally
      if (otherTotal === 0) {
        // If others are all zero, distribute the reduction equally if possible
        const share = actualDiff / otherTopics.length;
        return { ...w, percentage: Math.max(0, Math.round(w.percentage - share)) };
      }
      
      const proportion = w.percentage / otherTotal;
      const share = actualDiff * proportion;
      return { ...w, percentage: Math.max(0, Math.round(w.percentage - share)) };
    });

    // Final reconciliation for rounding errors to ensure exactly 100
    const currentSum = newWeightages.reduce((s, w) => s + w.percentage, 0);
    const error = 100 - currentSum;
    if (error !== 0) {
      const firstOther = newWeightages.find(w => w.topic !== topicName);
      if (firstOther) firstOther.percentage += error;
    }

    onChange('Custom', newWeightages);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tight uppercase">Topic Weightage</h2>
        <p className="text-gray-500 font-medium text-sm">Define how topics are distributed in the test.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex bg-gray-100 p-1 rounded-sm gap-1">
          {(['Equal', 'Custom'] as WeightageMode[]).map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm transition-smooth ${
                mode === m ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {m} Distribution
            </button>
          ))}
        </div>

        {mode === 'Custom' && (
          <div className="bg-white p-8 rounded-sm border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Interactive Balancing</h3>
              <div className="text-[10px] font-black px-3 py-1 rounded-sm bg-black text-white">
                TOTAL: 100%
              </div>
            </div>
            
            <div className="space-y-8">
              {weightages.map(w => (
                <div key={w.topic} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                    <span className="truncate max-w-[240px] tracking-widest">{w.topic}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-sm">{w.percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={w.percentage}
                    onChange={(e) => handlePercentageChange(w.topic, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-sm appearance-none cursor-pointer accent-black"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'Equal' && (
          <div className="bg-white p-12 rounded-sm border border-gray-200 shadow-sm text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center">
                 <span className="text-xs font-black">≈</span>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed max-w-sm">
                The session will feature an equal number of questions from each of your {topics.length} selected topics.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-smooth"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-10 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-black text-white shadow-md hover:translate-y-[-1px] transition-smooth"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WeightageSelector;
