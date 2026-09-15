import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Camera,
  CalendarDays,
  Upload,
  KeyRound,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/roles';

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors';

function formatDateTime(value) {
  return new Date(value).toLocaleString('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Profile() {
  const { user, loading, refreshUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', profileImage: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.fullName || '', profileImage: user.profileImage || '' });
    }
  }, [user]);

  function handleImageFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMsg('Please choose an image file.');
      setProfileErr(true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg('Profile images must be 2 MB or smaller.');
      setProfileErr(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((current) => ({ ...current, profileImage: reader.result }));
      setProfileMsg('Image selected. Save changes to apply it.');
      setProfileErr(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr(false);
    if (profileForm.fullName.trim().length < 2) {
      setProfileMsg('Full name must be at least 2 characters');
      setProfileErr(true);
      return;
    }
    setSavingProfile(true);
    try {
      await api.put('/auth/me', {
        fullName: profileForm.fullName.trim(),
        profileImage: profileForm.profileImage.trim() || undefined,
      });
      await refreshUser();
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      const details = err.response?.data?.details?.map((item) => item.msg).join(', ');
      setProfileMsg(details || err.response?.data?.error || 'Failed to update profile');
      setProfileErr(true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Delete your account permanently? Your bookings and organizer events will also be removed.')) return;
    const currentPassword = window.prompt('Enter your current password to confirm account deletion:');
    if (!currentPassword) return;
    setDeleting(true);
    setProfileMsg('');
    try {
      await api.delete('/auth/me', { data: { currentPassword } });
      await logout();
    } catch (err) {
      setProfileMsg(err.response?.data?.error || 'Failed to delete account');
      setProfileErr(true);
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 border-4 border-astu-500/30 border-t-astu-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-12 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-gradient mb-2">My Profile</h1>
      <p className="text-slate-400 text-sm mb-8">View and manage your account information</p>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <p className="text-slate-100 font-medium">{user.fullName}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-astu-400" /> {user.email}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-astuGreen-400" />
              <span className="px-2.5 py-0.5 rounded-full bg-astuGreen-500/10 border border-astuGreen-400/30 text-astuGreen-400 text-xs font-medium">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
            {user.createdAt && (
              <div className="flex items-start gap-2 text-slate-400">
                <CalendarDays className="w-4 h-4 text-slate-500 mt-0.5" />
                <span>Member since {formatDateTime(user.createdAt)}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-6">Your role is managed by platform administrators and cannot be changed from this page.</p>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-astu-400" /> Edit profile
            </h2>
            {profileMsg && (
              <div className="glass-card p-3 mb-4 border-red-400/30">
                <p className={'text-sm flex items-center gap-2 ' + (profileErr ? 'text-red-400' : 'text-astuGreen-400')}>
                  {profileErr ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {profileMsg}
                </p>
              </div>
            )}
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
                <input type="text" required value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <span className="inline-flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Profile photo</span>
                </label>
                <div className="flex gap-2">
                  <input type="url" placeholder="Paste an image URL" value={profileForm.profileImage.startsWith('data:') ? '' : profileForm.profileImage}
                    onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                    className={inputClass} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 border border-astu-400/30 text-astu-300 rounded-xl px-3 hover:bg-astu-500/10 transition-colors" title="Choose from device">
                    <Upload className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Use a direct image URL or choose an image up to 2 MB from your device.</p>
              </div>
              <button type="submit" disabled={savingProfile}
                className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50">
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-medium text-slate-100 mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-astuGreen-400" /> Password
            </h2>
            <p className="text-sm text-slate-400 mb-4">Update your password on a dedicated secure page.</p>
            <Link to="/change-password" className="w-full inline-flex items-center justify-center gap-2 border border-astuGreen-400/30 text-astuGreen-300 px-6 py-2.5 rounded-xl font-medium hover:bg-astuGreen-500/10 transition-all">
              Change password <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-6 border-red-400/20">
            <h2 className="font-medium text-red-300 mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete account
            </h2>
            <p className="text-sm text-slate-500 mb-4">This permanently removes your account, bookings, and organizer events.</p>
            <button type="button" onClick={handleDeleteAccount} disabled={deleting}
              className="w-full inline-flex items-center justify-center gap-2 border border-red-400/30 text-red-300 px-6 py-2.5 rounded-xl font-medium hover:bg-red-500/10 transition-all disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete my account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}