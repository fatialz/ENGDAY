/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  UserCircle,
  MoreVertical,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { userService } from '../services/userService';
import { UserProfile, UserRole, SystemConfig } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { format } from 'date-fns';
import { configService } from '../services/configService';
import { Settings, Bell, Zap, Sliders } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAdmin } = useAppStore();
  const { addToast } = useToastStore();

  const fetchData = async () => {
    setLoading(true);
    const [userData, configData] = await Promise.all([
      userService.getAll(),
      configService.getConfig()
    ]);
    setUsers(userData);
    setConfig(configData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (user: UserProfile) => {
    if (user.uid === currentUser?.uid) {
      addToast("Anda tidak bisa mengubah role anda sendiri", "error");
      return;
    }
    
    // Toggle between ADMIN and PJ
    const newRole = user.role === UserRole.ADMIN ? UserRole.PJ : UserRole.ADMIN;

    try {
      await userService.updateRole(user.uid, newRole);
      addToast(`Role ${user.displayName} diubah menjadi ${newRole}`, "success");
      fetchData();
    } catch (error) {
      addToast("Gagal mengubah role", "error");
    }
  };

  const handleDelete = async (uid: string) => {
    if (uid === currentUser?.uid) {
      addToast("Anda tidak bisa menghapus diri sendiri", "error");
      return;
    }
    if (!window.confirm("Hapus user ini? Akses sistem akan segera dicabut.")) return;

    try {
      await userService.deleteUser(uid);
      addToast("User berhasil dihapus dari sistem", "success");
      fetchData();
    } catch (error) {
      addToast("Gagal menghapus user", "error");
    }
  };

  const handleConfigUpdate = async (updates: Partial<SystemConfig>) => {
    if (!config) return;
    try {
      const newConfig = { ...config, ...updates };
      await configService.updateConfig(updates);
      setConfig(newConfig);
      addToast("Konfigurasi sistem diperbarui", "success");
    } catch (e) {
      addToast("Gagal memperbarui konfigurasi", "error");
    }
  };

  const toggleDefaultPref = async (key: keyof SystemConfig['defaultNotificationPrefs']) => {
    if (!config) return;
    const newPrefs = { 
      ...config.defaultNotificationPrefs, 
      [key]: !config.defaultNotificationPrefs[key] 
    };
    handleConfigUpdate({ defaultNotificationPrefs: newPrefs });
  };

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 font-medium">System administrators and authorized controllers</p>
        </div>

        {isAdmin() && config && (
          <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 px-3 border-r border-slate-50 mr-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Rules</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => toggleDefaultPref('browserEnabled')}
                  className={`p-1.5 rounded-lg transition-all ${config.defaultNotificationPrefs.browserEnabled ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-300'}`}
                  title="Browser Alerts Default"
                >
                  <Bell size={14} />
                </button>
                <button 
                  onClick={() => toggleDefaultPref('criticalEnabled')}
                  className={`p-1.5 rounded-lg transition-all ${config.defaultNotificationPrefs.criticalEnabled ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-300'}`}
                  title="Critical Alerts Default"
                >
                  <AlertCircle size={14} />
                </button>
                <button 
                  onClick={() => toggleDefaultPref('thresholdEnabled')}
                  className={`p-1.5 rounded-lg transition-all ${config.defaultNotificationPrefs.thresholdEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}
                  title="Threshold Alerts Default"
                >
                  <Zap size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-3">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Critical</span>
                <input 
                  type="number" 
                  value={config.criticalViolationThreshold}
                  onChange={(e) => handleConfigUpdate({ criticalViolationThreshold: parseInt(e.target.value) })}
                  className="w-10 bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Threshold</span>
                <input 
                  type="number" 
                  value={config.pointThreshold}
                  onChange={(e) => handleConfigUpdate({ pointThreshold: parseInt(e.target.value) })}
                  className="w-10 bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((u) => (
          <div key={u.uid} className="modern-card p-5 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all border border-slate-100">
                <UserCircle size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-slate-800 tracking-tight">{u.displayName}</p>
                  <span className={`
                    text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded
                    ${u.role === UserRole.PJ ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}
                  `}>
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 uppercase tracking-wider"><Mail size={10} strokeWidth={3} /> {u.email}</span>
                  <span className="flex items-center gap-1 uppercase tracking-wider"><Calendar size={10} strokeWidth={3} /> {format(u.createdAt, 'MMM yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin() && (
                <button 
                  onClick={() => handleToggleRole(u)}
                  className="h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Toggle Role"
                >
                  Role
                </button>
              )}
              {isAdmin() && (
                <button 
                  onClick={() => handleDelete(u.uid)}
                  className="p-2 rounded-lg hover:bg-rose-50 text-slate-200 hover:text-rose-600 transition-all"
                  title="Revoke Access"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="modern-card p-6 bg-rose-50/50 border-rose-100 border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200 blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1 text-sm tracking-tight">Administrative Note</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              ADMIN users have system management access including user role configuration and access revocation. 
              Changes will immediately update a user's ability to perform data operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
