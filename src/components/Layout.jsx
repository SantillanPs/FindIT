import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-background bg-modern">
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group no-underline">
                <div className="bg-brand-primary text-white p-2 rounded-lg flex items-center justify-center group-hover:rotate-3 transition-transform">
                  <span className="text-xl">🔍</span>
                </div>
                <span className="text-slate-900 font-extrabold text-xl tracking-tight leading-none">
                  Find<span className="text-brand-primary">IT</span>
                </span>
              </Link>
            </div>
            
            <nav className="flex items-center space-x-2">
              {user ? (
                <>
                  <div className="hidden lg:flex items-center space-x-1">
                    {user.role === 'admin' ? (
                      <>
                        <NavLink to="/admin" label="Dashboard" />
                        <NavLink to="/admin/discovery" label="Matches" />
                        <NavLink to="/admin/claims" label="Review Claims" />
                        <NavLink to="/admin/verify" label="Verify Students" />
                      </>
                    ) : (
                      <>
                        <NavLink to="/student" label="Home" />
                        <NavLink to="/public-feed" label="Found Items" />
                        <NavLink to="/my-claims" label="My Claims" />
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 border-l border-slate-200 ml-4 pl-4">
                    <NotificationCenter />
                    <div className="hidden md:flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        {user.role === 'student' && (
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-amber-500'}`} title={user.is_verified ? 'Verified Student' : 'Unverified Student'}></span>
                        )}
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          {user.role}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 mt-1">
                        {user.email.split('@')[0]}
                      </span>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all"
                      title="Logout"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-slate-600 hover:text-brand-primary font-semibold text-sm">Sign In</Link>
                  <Link to="/register" className="btn-primary py-2 px-4">Join Now</Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {user && user.role === 'student' && !user.is_verified && (
            <div className="mb-8 app-card border-brand-accent/20 bg-brand-accent/5 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-sm text-brand-accent">Verification Required</p>
                  <p className="text-xs text-slate-500 font-medium">Please submit your student ID to start reporting lost or found items.</p>
                </div>
              </div>
            </div>
          )}
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium">
            Helping our campus find what's lost. &copy; 2026 FindIT System.
          </p>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, label }) => (
  <Link 
    to={to} 
    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all no-underline"
  >
    {label}
  </Link>
);



export default Layout;
