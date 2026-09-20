import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function NotificationBell() {
  const [items, setItems] = useState([]); const [open, setOpen] = useState(false);
  useEffect(() => { if (!localStorage.getItem('token')) return; api.get('/notifications').then((res) => setItems(res.data)).catch(() => {}); }, []);
  const unread = items.filter((item) => !item.is_read).length;
  async function markAll(e) { e.preventDefault(); await api.patch('/notifications/read-all'); setItems((current) => current.map((item) => ({ ...item, is_read: 1 }))); }
  async function markRead(id) { await api.patch('/notifications/' + id + '/read'); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: 1 } : item)); }
  return <div className="relative"><button type="button" aria-label="Notifications" onClick={() => setOpen(!open)} className="relative text-slate-300 hover:text-astu-300"><Bell className="w-5 h-5" />{unread > 0 && <span className="absolute -top-2 -right-2 min-w-4 h-4 rounded-full bg-red-400 px-1 text-[10px] text-slate-950 font-bold">{unread > 9 ? '9+' : unread}</span>}</button>{open && <div className="absolute right-0 mt-3 w-80 glass-card p-3 shadow-2xl"><div className="flex items-center justify-between px-2 pb-2 border-b border-white/10"><strong className="text-sm text-slate-100">Notifications</strong><button type="button" onClick={markAll} className="text-xs text-astu-300 inline-flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5" /> Read all</button></div>{items.length === 0 ? <p className="text-sm text-slate-500 p-4">No notifications yet.</p> : <div className="max-h-72 overflow-auto">{items.slice(0, 5).map((item) => <button type="button" key={item.id} onClick={() => markRead(item.id)} className="w-full text-left px-2 py-3 border-b border-white/5 hover:bg-white/5"><p className="text-sm text-slate-200">{item.title}{!item.is_read && <span className="inline-block w-2 h-2 rounded-full bg-astuGreen-400 ml-2" />}</p><p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.message}</p></button>)}</div>}<Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-xs text-astu-300 pt-3">View all notifications</Link></div>}</div>;
}
