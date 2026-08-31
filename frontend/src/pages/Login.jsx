import { useState } from 'react';
import api from '../api/client';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setMessage('Logged in successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="border rounded px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="bg-emerald-700 text-white rounded py-2">
          Login
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
