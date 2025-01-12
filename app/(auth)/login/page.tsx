'use client';

import { useState } from 'react';
import { login } from './actions'
import { redirect } from 'next/navigation';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('email', `${username}@admin.com`);
    formData.append('password', password);

    const result = await login(formData);

    if (result.error) {
      setError(result.error);  // Set error message to display
    } else {
      redirect('/');
    }
  }

  return (
    <div className='p-6 border border-1 border-gray-300 dark:border-gray-100 rounded-lg'>
      <h1 className='text-3xl font-bold text-black dark:text-white'>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label htmlFor="username" className='text-sm text-black dark:text-white font-normal block mb-2'>Username</label>
          <input id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100'
            required />
        </div>
        <div className='mb-3'>
          <label htmlFor="password" className='text-sm text-black dark:text-white font-normal block mb-2'>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100'
            required />
        </div>
        <button type='submit' className='w-full px-4 py-2 text-white bg-blue-800 hover:bg-blue-900 rounded-lg'>Log in</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <PWAInstallPrompt />
    </div>
  )
}