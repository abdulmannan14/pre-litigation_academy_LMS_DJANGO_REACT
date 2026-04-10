import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo/Logo.png';

const navItems = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-[#F0E8E5] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#F0E8E5]">
          <img src={logo} alt="Pre-Litigation Academy" className="h-9 w-auto" />
          <p className="text-xs text-gray-400 mt-1 pl-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-secondary font-medium'
                    : 'text-gray-500 hover:bg-background hover:text-textDark'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-[#F0E8E5]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-secondary">
              {user?.name?.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-textDark truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-red-500 hover:text-red-600 text-left px-1 py-1"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
