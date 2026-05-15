/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole, SystemConfig } from '../types';
import { useAppStore } from '../store/useAppStore';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { configService } from './configService';

const provider = new GoogleAuthProvider();

export const authService = {
  async login() {
    try {
      const result = await signInWithPopup(auth, provider);
      return await this.syncUser(result.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
    useAppStore.getState().setUser(null);
  },

  async syncUser(firebaseUser: FirebaseUser) {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let userDoc;
    try {
      userDoc = await getDoc(userDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
    }

    if (userDoc && userDoc.exists()) {
      let profile = userDoc.data() as UserProfile;
      
      // Auto-promote @belajar.id users if they are not already PJ or ADMIN
      // (Though currently everyone is at least ADMIN, but if we add GUEST later this is useful)
      const email = firebaseUser.email || '';
      if (email.endsWith('@belajar.id') && profile.role !== UserRole.ADMIN && profile.role !== UserRole.PJ) {
        profile.role = UserRole.ADMIN;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, profile, { merge: true });
      }

      useAppStore.getState().setUser(profile);
      return profile;
    } else {
      // First user logic: check if system is initialized
      const configRef = doc(db, 'system', 'config');
      let isFirstUser = false;
      try {
        const configSnap = await getDoc(configRef);
        isFirstUser = !configSnap.exists();
      } catch (error) {
        // If we can't read config, it might be first time or permission issue
        // But for bootstrap, we'll try to treat it as first user if it fails in a specific way
        // or just allow the check
        console.warn('Config check failed, assuming not first user unless specific error');
        isFirstUser = false; 
      }
      
      // Assign role based on email domain or master status
      const masterEmails = ['fatia7056@gmail.com', 'fatiazahra5690@gmail.com'];
      const email = firebaseUser.email || '';
      const isMaster = masterEmails.includes(email);
      const isBelajarId = email.endsWith('@belajar.id');

      let role = UserRole.PJ; // Default to PJ for new users
      if (isFirstUser || isMaster) {
        role = UserRole.PJ;
      } else if (isBelajarId) {
        role = UserRole.ADMIN;
      }

      const config = await configService.getConfig();

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous User',
        role,
        createdAt: Date.now(),
        notificationPreferences: config.defaultNotificationPrefs
      };

      try {
        await setDoc(userDocRef, newProfile);
        if (isFirstUser || isMaster) {
          // Initialize system config
          await setDoc(configRef, { initialized: true, initializedAt: Date.now(), initializedBy: firebaseUser.uid });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }
      
      useAppStore.getState().setUser(newProfile);
      return newProfile;
    }
  },

  init() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.syncUser(firebaseUser);
      } else {
        useAppStore.getState().setUser(null);
      }
      useAppStore.getState().setLoading(false);
    });
  }
};
