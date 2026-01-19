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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b-2 border-blue-900 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 no-underline group">
                <span className="bg-blue-900 text-white p-1.5 rounded text-lg">🔍</span>
                <span className="text-blue-900 font-bold text-xl tracking-tight hidden sm:block">
                  FindIT<span className="text-slate-500 font-medium text-sm ml-1">: University L&F</span>
                </span>
              </Link>
            </div>
            
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 mr-4 border-r border-slate-200 pr-4">
                    {user.role === 'admin' ? (
                      <>
                        <Link to="/admin" className="text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors">Staff Portal</Link>
                        <Link to="/admin/discovery" className="text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors">Match Analysis</Link>
                        <Link to="/admin/claims" className="text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors">Claim Review</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/student" className="text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors">My Portal</Link>
                        <Link to="/public-feed" className="text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors">Registry</Link>
                        <Link to="/my-claims" className="text-sm font-semibold text-slate-600 hover:text-blue-900 transition-colors">History</Link>
                        <NotificationCenter />
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
                      <span className="text-xs">👤</span>
                      <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{user.email}</span>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-red-100"
                    >
                      LOGOUT
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link to="/login" className="text-slate-600 hover:text-blue-900 font-semibold text-sm">Login</Link>
                  <Link to="/register" className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-bold shadow-md hover:bg-blue-800 transition-all">Sign Up</Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {user && user.role === 'student' && !user.is_verified && (
            <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-amber-400 font-bold ml-1 mr-3 text-xl">⚠️</div>
                <div className="text-sm text-amber-800 font-medium">
                  Your student account is <span className="font-bold underline">unverified</span>. Please submit identity proof to unlock all features.
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">FindIT University Services &bull; Official Campus Recovery System &copy; 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
