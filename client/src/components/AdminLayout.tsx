import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { User, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans text-slate-800 selection:bg-brand-pink selection:text-white pb-20 flex flex-col w-full">
      
      {/* HEADER / NAVBAR */}
      <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link to="/admin/dashboard" className="bg-brand-pink text-white font-bold px-4 py-1.5 rounded-lg text-sm tracking-wider hover:bg-opacity-90 transition-all">
            QUIZZZZZ
          </Link>
          <div className="bg-gray-100 text-slate-500 font-semibold px-4 py-1.5 rounded-lg text-xs tracking-wider">
            ADMIN
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 text-xs font-medium text-slate-500">
             <User strokeWidth={2.5} className="w-4 h-4 text-brand-teal" />
             <span className="uppercase tracking-widest">{admin?.name || 'Admin'}</span>
          </div>

          <button onClick={logout} className="flex items-center space-x-2 border border-gray-200 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors uppercase tracking-wider" title="Logout">
            <LogOut strokeWidth={2.5} className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full bg-gray-50/30">
        <Outlet />
      </div>

    </div>
  );
}
