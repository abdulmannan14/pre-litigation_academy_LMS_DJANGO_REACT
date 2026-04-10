import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import favicon from '../assets/logo/Favicon.png';

export default function LoginPage() {
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});

  // Redirect already-logged-in users
  useEffect(() => {
    if (user) navigate(user.is_staff ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    if (!form.password) errs.password = 'Password is required.';
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
    const result = await login(form.username, form.password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={favicon} alt="Pre-Litigation Academy" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-textDark">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0E8E5] p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Demo credentials hint */}
          <div className="mb-5 p-3 bg-accent/40 rounded-xl text-xs text-secondary">
            <p className="font-semibold mb-1">Demo — create an account or use superuser credentials.</p>
            <p className="text-gray-500">Run <code className="bg-white px-1 rounded">python manage.py createsuperuser</code> in backend.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              error={errors.username}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-secondary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
