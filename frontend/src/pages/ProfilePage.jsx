import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { updateProfile, changePassword } from '../api/authApi';

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E5DDD9] text-sm text-textDark bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent disabled:bg-background disabled:text-gray-400';

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls + ' pr-10'}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-40"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function Alert({ type, message, onDismiss }) {
  if (!message) return null;
  const styles = type === 'success'
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-red-50 border-red-200 text-red-600';
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm ${styles}`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-3 opacity-60 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password form
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const setProfile = (field) => (e) =>
    setProfileForm((f) => ({ ...f, [field]: e.target.value }));
  const setPw = (field) => (e) =>
    setPwForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile({
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        email: profileForm.email.trim(),
        username: profileForm.username.trim(),
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to update profile.';
      if (data) {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          msg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
        }
      }
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.old_password || !pwForm.new_password || !pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg({ type: '', text: '' });
    try {
      await changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password.';
      setPwMsg({ type: 'error', text: msg });
    } finally {
      setPwSaving(false);
    }
  };

  const displayName = user?.full_name || user?.username || '';
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textDark">Profile & Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account information and password.</p>
        </div>

        {/* Avatar card */}
        <Card className="!p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-secondary border-2 border-secondary/20 shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-textDark text-lg">{displayName}</p>
              <p className="text-sm text-gray-400">@{user?.username}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Profile info */}
        <Card className="mb-6">
          <h2 className="font-semibold text-textDark mb-5">Personal Information</h2>

          {profileMsg.text && (
            <div className="mb-4">
              <Alert type={profileMsg.type} message={profileMsg.text} onDismiss={() => setProfileMsg({ type: '', text: '' })} />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
              <input
                type="text"
                value={profileForm.first_name}
                onChange={setProfile('first_name')}
                placeholder="First name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
              <input
                type="text"
                value={profileForm.last_name}
                onChange={setProfile('last_name')}
                placeholder="Last name"
                className={inputCls}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              value={profileForm.username}
              onChange={setProfile('username')}
              placeholder="username"
              className={inputCls}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={setProfile('email')}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={handleSaveProfile} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Change password */}
        <Card>
          <h2 className="font-semibold text-textDark mb-5">Change Password</h2>

          {pwMsg.text && (
            <div className="mb-4">
              <Alert type={pwMsg.type} message={pwMsg.text} onDismiss={() => setPwMsg({ type: '', text: '' })} />
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
              <PasswordInput
                value={pwForm.old_password}
                onChange={setPw('old_password')}
                placeholder="Enter current password"
                disabled={pwSaving}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
              <PasswordInput
                value={pwForm.new_password}
                onChange={setPw('new_password')}
                placeholder="Min. 6 characters"
                disabled={pwSaving}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
              <PasswordInput
                value={pwForm.confirm}
                onChange={setPw('confirm')}
                placeholder="Re-enter new password"
                disabled={pwSaving}
              />
              {pwForm.new_password && pwForm.confirm && (
                <p className={`text-xs mt-1.5 ${pwForm.new_password === pwForm.confirm ? 'text-green-600' : 'text-red-500'}`}>
                  {pwForm.new_password === pwForm.confirm ? '✓ Passwords match' : 'Passwords do not match.'}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={handleChangePassword} disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
