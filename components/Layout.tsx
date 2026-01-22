
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const menuItems = [
    { label: 'Início', path: '/', icon: 'grid_view' },
    { label: 'Vistorias', path: '/vistorias', icon: 'checklist' },
    { label: 'Financeiro', path: '/financeiro', icon: 'payments' },
    { label: 'Agenda', path: '/agenda', icon: 'calendar_month' },
    { label: 'Clientes', path: '/clientes', icon: 'group' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col fixed h-full z-50 print:hidden">
        <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">CheckMaster</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#6366f1] text-white shadow-xl shadow-indigo-200 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-50">
           <button className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200 group">
             <span className="material-symbols-outlined group-hover:rotate-180 transition-transform">logout</span>
             <span className="font-bold text-sm">Sair</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 p-6 md:p-14 min-w-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
