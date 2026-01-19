
import { env } from 'process';
import { User, TestResult } from '../types';

const API_BASE_URL =process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const isDbConfigured = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.ok;
  } catch {
    return false;
  }
};

export const db = {
  users: {
    find: async (): Promise<User[]> => {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    findOne: async (query: Partial<User>): Promise<User | null> => {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      return users.find((u: User) =>
        Object.entries(query).every(([k, v]) => u[k as keyof User] === v)
      ) || null;
    },
    insertOne: async (user: User): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to insert user");
      }
    },
    updateOne: async (id: string, update: Partial<User>): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if (!response.ok) throw new Error('Failed to update user');
    },
    deleteOne: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
    }
  },
  tests: {
    find: async (query?: { userId: string }): Promise<TestResult[]> => {
      const url = query?.userId
        ? `${API_BASE_URL}/tests?userId=${query.userId}`
        : `${API_BASE_URL}/tests`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tests');
      return response.json();
    },
    insertOne: async (test: TestResult): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });
      if (!response.ok) throw new Error('Failed to insert test');
    },
    deleteOne: async (date: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tests/${date}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete test');
    }
  }
};

