import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Shield, CheckCircle2, AlertCircle, Camera, CalendarDays } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/roles';

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors';

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ fullName: '', profileImage: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.fullName || '', profileImage: user.profileImage || '' });
    }
  }, [user]);

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
      setProfileMsg(err.response?.data?.error || 'Failed to update profile');
      setProfileErr(true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg('');
    setPwErr(false);
    if (pwForm.newPassword.length < 6) {
      setPwMsg('New password must be at least 6 characters');
      setPwErr(true);
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg('Passwords do not match');
      setPwErr(true);
      return;
    }
    setSavingPw(true);
    try {
      await api.post('/auth/me/password', pwForm);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwMsg('Password updated successfully');
    } catch (err) {
      setPwMsg(err.response?.data?.error || 'Failed to change password');
      setPwErr(true);
    } finally {
      setSavingPw(false);
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
              <img src={user.profileImage} alt={user.fullName} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
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
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
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
                  <span className="inline-flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Profile photo URL</span>
                </label>
                <input type="url" placeholder="https://example.com/photo.jpg" value={profileForm.profileImage}
                  onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                  className={inputClass} />
              </div>
              <button type="submit" disabled={savingProfile}
                className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50">
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-astuGreen-400" /> Change password
            </h2>
            {pwMsg && (
              <div className="glass-card p-3 mb-4 border-red-400/30">
                <p className={'text-sm flex items-center gap-2 ' + (pwErr ? 'text-red-400' : 'text-astuGreen-400')}>
                  {pwErr ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {pwMsg}
                </p>
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Current password</label>
                <input type="password" required value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
                <input type="password" required placeholder="At least 6 characters" value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm new password</label>
                <input type="password" required value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className={inputClass} />
              </div>
              <button type="submit" disabled={savingPw}
                className="w-full glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50">
                {savingPw ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
