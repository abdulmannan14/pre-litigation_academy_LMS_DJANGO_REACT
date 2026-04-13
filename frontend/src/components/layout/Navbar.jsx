import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import { useState } from 'react';
import logo from '../../assets/logo/Logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { courses } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.full_name || user?.username || '';
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const firstCourseId = courses?.[0]?.id;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const studentLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    ...(firstCourseId ? [{ label: 'My Course', to: `/courses/${firstCourseId}` }] : []),
  ];

  const adminLinks = [
    { label: 'Overview', to: '/admin' },
    { label: 'Courses', to: '/admin/courses' },
    { label: 'Students', to: '/admin/users' },
  ];

  const navLinks = user?.is_staff ? adminLinks : studentLinks;

  return (
    <nav className="bg-white border-b border-[#F0E8E5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={user?.is_staff ? '/admin' : '/dashboard'}
            className="flex items-center shrink-0"
          >
            <img src={logo} alt="Pre-Litigation Academy" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive(to)
                      ? 'text-secondary font-medium bg-accent'
                      : 'text-gray-500 hover:text-secondary hover:bg-accent/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right: user menu + mobile hamburger */}
          {user && (
            <div className="flex items-center gap-3">
              {/* User dropdown — desktop */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary border border-secondary/20">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-textDark hidden md:block">
                    {displayName}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#F0E8E5] py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-[#F0E8E5]">
                        <p className="text-xs font-medium text-textDark truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {!user.is_staff && (
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-background transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-background transition-colors"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu drawer */}
      {user && menuOpen && (
        <div className="sm:hidden border-t border-[#F0E8E5] bg-white px-4 py-3 space-y-1">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 border-b border-[#F0E8E5]">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-secondary">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-textDark truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(to)
                  ? 'text-secondary font-medium bg-accent'
                  : 'text-gray-600 hover:bg-background'
              }`}
            >
              {label}
            </Link>
          ))}

          {!user.is_staff && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-background transition-colors"
            >
              Profile
            </Link>
          )}

          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors mt-1"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
