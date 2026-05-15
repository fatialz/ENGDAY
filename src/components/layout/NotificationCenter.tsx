/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { notificationService } from '../../services/notificationService';
import { AppNotification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAppStore();

  useEffect(() => {
    if (!user) return;

    // Only PJ and Admin should subscribe
    const canNotify = user.role === 'ADMIN' || user.role === 'PJ' || 
                    ['fatia7056@gmail.com', 'fatiazahra5690@gmail.com'].includes(user.email);
    
    if (!canNotify) return;

    // Request permissions
    notificationService.requestPermission();

    const unsubscribe = notificationService.subscribeToNotifications(user.role, (newNotifs) => {
      // Check for new unread notifications to show browser alert
      const unread = newNotifs.filter(n => !n.read);
      const prevUnreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      unread.forEach(n => {
        if (!prevUnreadIds.includes(n.id)) {
          notificationService.showBrowserNotification(n.title, n.message);
        }
      });

      setNotifications(newNotifs);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL_VIOLATION': return <AlertCircle className="text-rose-500" size={16} />;
      case 'THRESHOLD_REACHED': return <TrendingUp className="text-amber-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all relative shadow-sm"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 lg:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Bell size={16} className="text-rose-500" />
                  <span>Notifications</span>
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <Bell size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">No alerts yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group",
                        !n.read && "bg-blue-50/30"
                      )}
                      onClick={() => {
                        notificationService.markAsRead(n.id);
                        // Optional: navigate to student detail or violation record
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-bold text-slate-800 mb-0.5", !n.read && "text-blue-900")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed mb-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {formatDistanceToNow(n.timestamp)} ago
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    View All Activity
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
