/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  ListTodo, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { auth } from '../../lib/firebase';
import { THEME } from '../../constants';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PJ] },
  { label: 'Data Siswa', href: '/app/students', icon: Users, roles: [UserRole.ADMIN, UserRole.PJ] },
  { label: 'Pelanggaran', href: '/app/violations', icon: AlertTriangle, roles: [UserRole.ADMIN, UserRole.PJ] },
  { label: 'Rekap Pelanggaran', href: '/app/history', icon: AlertTriangle, roles: [UserRole.ADMIN, UserRole.PJ] },
  { label: 'Jenis Pelanggaran', href: '/app/categories', icon: ListTodo, roles: [UserRole.ADMIN, UserRole.PJ] },
  { label: 'User Management', href: '/app/users', icon: Settings, roles: [UserRole.ADMIN, UserRole.PJ] },
  { label: 'Laporan', href: '/app/reports', icon: FileText, roles: [UserRole.ADMIN, UserRole.PJ] },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAppStore();
  const location = useLocation();

  const filteredItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center space-x-3 mb-4 mt-4 lg:mt-0">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-lg">
              <Plus size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">ED-Tracker</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {filteredItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              const isManagementSection = item.label === 'User Management';
              
              return (
                <React.Fragment key={item.href}>
                  {isManagementSection && (
                    <div className="pt-4 pb-2 px-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
                    </div>
                  )}
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold",
                      isActive 
                        ? "bg-rose-50 text-rose-600 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Profile Card */}
          <div className="p-4 mt-auto border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs text-slate-500 mb-1">Logged in as</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user?.displayName}</p>
              <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-pink-100 text-pink-800 uppercase tracking-wider">
                {user?.role} Role
              </span>
              <button 
                onClick={() => auth.signOut()}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
