
import React, { useState } from 'react';
import { User, TestResult } from '../types';

interface AdminDashboardProps {
  users: User[];
  tests: TestResult[];
  onUpdateStatus: (userId: string, status: User['status']) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteTest: (date: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, tests, onUpdateStatus, onDeleteUser, onDeleteTest }) => {
  const [view, setView] = useState<'users' | 'tests'>('users');

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">Admin Console</h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Global Management & Monitoring</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-sm gap-1">
          <button
            onClick={() => setView('users')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-smooth ${
              view === 'users' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setView('tests')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-smooth ${
              view === 'tests' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Tests ({tests.length})
          </button>
        </div>
      </div>

      {view === 'users' && (
        <div className="bg-white border border-gray-100 shadow-premium overflow-hidden rounded-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.filter(u => !u.isAdmin).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{user.fullName}</div>
                    <div className="text-[10px] font-bold text-gray-500">{user.email} • {user.gender}</div>
                    <div className="text-[8px] font-black text-gray-300 uppercase tracking-wider">ID: {user.id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm ${
                      user.status === 'approved' ? 'bg-green-100 text-green-700' :
                      user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[10px] font-black space-x-3">
                    {user.status !== 'approved' && (
                      <button onClick={() => onUpdateStatus(user.id, 'approved')} className="text-green-600 hover:text-green-800 uppercase tracking-widest">Approve</button>
                    )}
                    {user.status !== 'blocked' && (
                      <button onClick={() => onUpdateStatus(user.id, 'blocked')} className="text-red-400 hover:text-red-600 uppercase tracking-widest">Block</button>
                    )}
                    <button onClick={() => onDeleteUser(user.id)} className="text-gray-300 hover:text-black uppercase tracking-widest">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'tests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.slice().reverse().map((test) => {
            const user = users.find(u => u.id === test.userId);
            return (
              <div key={test.date} className="bg-white p-6 border border-gray-100 shadow-premium rounded-sm space-y-4 hover:border-black transition-smooth">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">{user?.fullName || 'Unknown User'}</div>
                    <div className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">{new Date(test.date).toLocaleString()}</div>
                  </div>
                  <button onClick={() => onDeleteTest(test.date)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded-sm">
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Score</div>
                    <div className="text-sm font-black">{test.score}/{test.totalQuestions}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-sm">
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Acc</div>
                    <div className="text-sm font-black">{test.accuracy}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-sm">
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Time</div>
                    <div className="text-sm font-black">{Math.round(test.timeSpent / 60)}m</div>
                  </div>
                </div>
              </div>
            );
          })}
          {tests.length === 0 && (
             <div className="col-span-full py-20 text-center bg-gray-50 border border-dashed border-gray-200 rounded-sm">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No test records found globally.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
