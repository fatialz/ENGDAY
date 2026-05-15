/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Violation, ViolationCategory, UserRole, SystemConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { notificationService } from './notificationService';
import { configService } from './configService';

const VIOLATIONS = 'violations';
const CATEGORIES = 'violationCategories';

export const violationService = {
  // Categories
  async getCategories() {
    try {
      const q = query(collection(db, CATEGORIES), orderBy('points', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ViolationCategory));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, CATEGORIES);
      return [];
    }
  },

  async createCategory(category: Omit<ViolationCategory, 'id'>) {
    try {
      await addDoc(collection(db, CATEGORIES), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, CATEGORIES);
    }
  },

  async seedCategories(categories: Omit<ViolationCategory, 'id'>[]) {
    try {
      for (const cat of categories) {
        await addDoc(collection(db, CATEGORIES), cat);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, CATEGORIES);
    }
  },

  async deleteCategory(id: string) {
    try {
      await deleteDoc(doc(db, CATEGORIES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, CATEGORIES);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<ViolationCategory>) {
    try {
      const ref = doc(db, CATEGORIES, id);
      await updateDoc(ref, category);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, CATEGORIES);
      throw error;
    }
  },

  // Violations
  async getLatest(count = 10) {
    try {
      const q = query(collection(db, VIOLATIONS), orderBy('violationDate', 'desc'), limit(count));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Violation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, VIOLATIONS);
      return [];
    }
  },

  async createViolation(violation: Omit<Violation, 'id'>) {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Get student first (READ)
        const studentRef = doc(db, 'students', violation.studentId);
        const studentDoc = await transaction.get(studentRef);
        
        if (!studentDoc.exists()) throw new Error("Student not found");

        const studentData = studentDoc.data();
        const prevPoints = studentData.totalPoints || 0;
        const newPoints = prevPoints + violation.points;

        // 2. Create violation record (WRITE)
        const violationRef = doc(collection(db, VIOLATIONS));
        transaction.set(violationRef, violation);

        // 3. Update student points (WRITE)
        transaction.update(studentRef, {
          totalPoints: newPoints,
          lastViolationAt: violation.violationDate
        });

        // 4. Handle Notifications
        const notificationsToCreate: any[] = [];
        
        const configRef = doc(db, 'system_config', 'notifications');
        const configSnap = await transaction.get(configRef);
        const config = configSnap.exists() ? configSnap.data() as any : { 
          criticalViolationThreshold: 15, 
          pointThreshold: 50 
        };

        // Critical Violation check
        if (violation.points >= config.criticalViolationThreshold) {
          notificationsToCreate.push({
            type: 'CRITICAL_VIOLATION',
            title: 'Critical Violation Logged',
            message: `${violation.studentName} committed a critical offense: ${violation.categoryName} (${violation.points} pts)`,
            timestamp: Date.now(),
            read: false,
            studentId: violation.studentId,
            targetRoles: [UserRole.ADMIN, UserRole.PJ]
          });
        }

        // Threshold check
        const threshold = config.pointThreshold;
        if (Math.floor(newPoints / threshold) > Math.floor(prevPoints / threshold)) {
          notificationsToCreate.push({
            type: 'THRESHOLD_REACHED',
            title: 'Point Threshold Reached',
            message: `${violation.studentName} has reached ${newPoints} total points!`,
            timestamp: Date.now(),
            read: false,
            studentId: violation.studentId,
            targetRoles: [UserRole.ADMIN, UserRole.PJ]
          });
        }

        // Create notifications outside transaction or within if desired (but addDoc is async)
        // Usually better to do after transaction success for clean firestore.rules
        // But for consistency we'll just queue them here and return them
        return notificationsToCreate;
      }).then(async (notifs) => {
        if (notifs && notifs.length > 0) {
          for (const n of notifs) {
            await notificationService.createNotification(n);
          }
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, VIOLATIONS);
      throw error;
    }
  },

  async deleteViolation(violation: Violation) {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Get student first (READ)
        const studentRef = doc(db, 'students', violation.studentId);
        const studentDoc = await transaction.get(studentRef);

        // 2. Delete record (WRITE)
        const violationRef = doc(db, VIOLATIONS, violation.id);
        transaction.delete(violationRef);

        // 3. Revert student points (WRITE)
        if (studentDoc.exists()) {
          const currentPoints = studentDoc.data().totalPoints || 0;
          transaction.update(studentRef, {
            totalPoints: Math.max(0, currentPoints - violation.points)
          });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, VIOLATIONS);
      throw error;
    }
  }
};
