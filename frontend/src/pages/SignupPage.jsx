import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkEmail, checkUsername } from '../api/authApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import favicon from '../assets/logo/Favicon.png';

// Eye icons
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// Password strength calculator
function getPasswordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak',   color: 'bg-red-400',   text: 'text-red-500',   bars: 1 };
  if (score <= 3) return { label: 'Fair',   color: 'bg-amber-400', text: 'text-amber-500', bars: 2 };
  if (score === 4) return { label: 'Good',  color: 'bg-blue-400',  text: 'text-blue-500',  bars: 3 };
  return             { label: 'Strong', color: 'bg-green-500', text: 'text-green-600', bars: 4 };
}

// Password input with eye toggle
function PasswordInput({ label, name, value, onChange, placeholder, error, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-textDark">
          {label} {required && <span className="text-secondary">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm text-textDark bg-white placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${
            error ? 'border-red-400' : 'border-[#E5DDD9]'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Hook for debounced availability check
function useAvailabilityCheck(value, checkFn, minLength = 1) {
  const [taken, setTaken] = useState(false);
  const [checking, setChecking] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!value || value.trim().length < minLength) {
      setTaken(false);
      setChecking(false);
      return;
    }
    clearTimeout(timer.current);
    setChecking(true);
    timer.current = setTimeout(async () => {
      try {
        const { data } = await checkFn(value.trim());
        setTaken(data.exists);
      } catch {
        setTaken(false);
      } finally {
        setChecking(false);
      }
    }, 600);
    return () => clearTimeout(timer.current);
  }, [value]);

  return { taken, checking };
}

export default function SignupPage() {
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const { taken: usernameTaken, checking: usernameChecking } = useAvailabilityCheck(form.username, checkUsername, 3);
  const { taken: emailTaken,    checking: emailChecking    } = useAvailabilityCheck(form.email,    checkEmail);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters.';
    else if (usernameTaken) errs.username = 'This username is already taken.';
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    else if (emailTaken) errs.email = 'This email is already registered.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await signup(form.username.trim(), form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
  };

  const passwordMismatch = form.confirm.length > 0 && form.confirm !== form.password;
  const passwordMatch   = form.confirm.length > 0 && form.confirm === form.password;
  const strength = getPasswordStrength(form.password);

  const usernameError = usernameTaken ? 'This username is already taken.' : errors.username || '';
  const emailError    = emailTaken    ? 'This email is already registered.' : errors.email || '';

  const isBlocked = loading || usernameTaken || usernameChecking || emailTaken || emailChecking;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={favicon} alt="Pre-Litigation Academy" className="h-32 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-textDark">Pre-Litigation Academy</h1>
          <p className="text-sm text-gray-500 mt-1">Training the Next Generation of Legal Professionals</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0E8E5] p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full name */}
            <Input
              label="Full name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.name}
              required
            />

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="Username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                error={usernameError}
                required
              />
              {usernameChecking && (
                <p className="text-xs text-gray-400 -mt-1">Checking availability...</p>
              )}
              {!usernameChecking && form.username.length >= 3 && !usernameTaken && !errors.username && (
                <p className="text-xs text-green-600 -mt-1">✓ Username available</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={emailError}
                required
              />
              {emailChecking && (
                <p className="text-xs text-gray-400 -mt-1">Checking availability...</p>
              )}
            </div>

            {/* Password with strength indicator */}
            <div className="flex flex-col gap-1.5">
              <PasswordInput
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                error={errors.password}
                required
              />
              {strength && (
                <div className="mt-1">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          bar <= strength.bars ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.text}`}>{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <PasswordInput
                label="Confirm password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                error={passwordMismatch ? 'Passwords do not match.' : errors.confirm || ''}
                required
              />
              {passwordMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1 -mt-1">
                  <span>✓</span> Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isBlocked}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
