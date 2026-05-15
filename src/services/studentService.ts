/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

const COLLECTION = 'students';

export const studentService = {
  async getAll() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
      return [];
    }
  },

  async create(student: Omit<Student, 'id' | 'totalPoints'>) {
    try {
      const data = {
        ...student,
        totalPoints: 0,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, COLLECTION), data);
      return { id: docRef.id, ...data } as Student;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Student>) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${id}`);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION}/${id}`);
      throw error;
    }
  }
};
