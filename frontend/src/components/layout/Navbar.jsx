import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import logo from '../../assets/logo/Logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <nav className="bg-white border-b border-[#F0E8E5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={user?.is_staff ? '/admin' : '/dashboard'}
            className="flex items-center"
          >
            <img src={logo} alt="Pre-Litigation Academy" className="h-10 w-auto" />
          </Link>

          {/* Nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                    Overview
                  </Link>
                  <Link to="/admin/courses" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                    Courses
                  </Link>
                  <Link to="/admin/users" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/courses/1" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                    My Course
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-secondary">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-textDark">
                  {user.name}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#F0E8E5] py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#F0E8E5]">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-xs font-medium text-textDark truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
