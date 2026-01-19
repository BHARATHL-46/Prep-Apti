
import React, { useState } from 'react';

interface SettingsProps {
  onUpdatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onUpdatePassword, onBack }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    const success = await onUpdatePassword(oldPass, newPass);
    if (success) {
      setMsg({ text: 'Password updated successfully', type: 'success' });
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setMsg({ text: 'Incorrect current password', type: 'error' });
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-sm font-bold text-sm focus:outline-none focus:ring-black focus:border-black bg-transparent transition-smooth";

  return (
    <div className="max-w-md mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tight">Security Settings</h1>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Update your credentials</p>
      </div>

      <div className="bg-white p-8 border border-gray-100 shadow-premium rounded-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Current Password</label>
            <input
              type="password"
              required
              className={inputClass}
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>
          <div className="h-[1px] bg-gray-50"></div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">New Password</label>
            <input
              type="password"
              required
              className={inputClass}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Confirm New Password</label>
            <input
              type="password"
              required
              className={inputClass}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          {msg && (
            <div className={`text-[10px] font-black uppercase tracking-widest text-center py-2 rounded-sm ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-sm shadow-xl hover:bg-gray-900 transition-smooth">
            Update Password
          </button>
        </form>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-smooth">Return to Dashboard</button>
      </div>
    </div>
  );
};

export default Settings;
