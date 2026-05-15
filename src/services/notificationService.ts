/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

const NOTIFICATIONS = 'notifications';

export const notificationService = {
  async createNotification(notification: Omit<AppNotification, 'id'>) {
    try {
      await addDoc(collection(db, NOTIFICATIONS), {
        ...notification,
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, NOTIFICATIONS);
    }
  },

  subscribeToNotifications(role: UserRole, callback: (notifications: AppNotification[]) => void) {
    const q = query(
      collection(db, NOTIFICATIONS),
      where('targetRoles', 'array-contains', role),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppNotification));
      callback(notifications);
    }, (error) => {
      // Permission errors are common for unauthorized roles, handle quietly
      if (error.code === 'permission-denied') {
        console.warn('Notification subscription denied (No permission)');
        callback([]);
        return;
      }
      handleFirestoreError(error, OperationType.LIST, NOTIFICATIONS);
    });
  },

  async markAsRead(notificationId: string) {
    try {
      const ref = doc(db, NOTIFICATIONS, notificationId);
      await updateDoc(ref, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, NOTIFICATIONS);
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  showBrowserNotification(title: string, body: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};
