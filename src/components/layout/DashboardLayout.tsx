import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationCenter } from './NotificationCenter';
import { useAppStore } from '../../store/useAppStore';
import { User } from 'lucide-react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, isPJ } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             {/* Mobile space placeholder */}
             <div className="lg:hidden w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">E</div>
          </div>
          
          <div className="flex items-center gap-4">
            {(isAdmin() || isPJ()) && <NotificationCenter />}
            
            <div className="h-10 w-[1px] bg-slate-100 mx-1 hidden lg:block" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.displayName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 leading-none">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
