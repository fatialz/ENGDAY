import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';

interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isPJ: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  isAdmin: () => {
    const user = get().user;
    if (!user) return false;
    const masterEmails = ['fatia7056@gmail.com', 'fatiazahra5690@gmail.com'];
    const isBelajarId = user.email.endsWith('@smk.belajar.id');
    
    // Admin features (Role toggle) for explicit ADMIN role
    // Master emails and smk.belajar.id domains also get it unless they are testing with PJ role
    if (user.role === UserRole.ADMIN) return true;
    if ((masterEmails.includes(user.email) || isBelajarId) && user.role !== UserRole.PJ) return true;
    return false;
  },
  isPJ: () => {
    const user = get().user;
    if (!user) return false;
    const masterEmails = ['fatia7056@gmail.com', 'fatiazahra5690@gmail.com'];
    const isBelajarId = user.email.endsWith('@smk.belajar.id');
    
    // PJ features (Data management/deletion) for PJ role, master emails, or smk.belajar.id
    return masterEmails.includes(user.email) || isBelajarId || user.role === UserRole.PJ;
  },
}));
