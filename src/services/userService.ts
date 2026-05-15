/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

const COLLECTION = 'users';

export const userService = {
  async getAll() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ ...doc.data() } as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
      return [];
    }
  },

  async updateRole(uid: string, role: UserRole) {
    try {
      const docRef = doc(db, COLLECTION, uid);
      await updateDoc(docRef, { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${uid}`);
      throw error;
    }
  },

  async deleteUser(uid: string) {
    try {
      const docRef = doc(db, COLLECTION, uid);
      await deleteDoc(docRef);
      // Note: Real Firebase Auth deletion requires admin SDK, but deleting document
      // will effectively block access due to our security rules requiring a valid profile.
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION}/${uid}`);
      throw error;
    }
  }
};
