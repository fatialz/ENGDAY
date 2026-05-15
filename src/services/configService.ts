/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SystemConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

const CONFIG_COLL = 'system_config';
const NOTIFICATION_DOC = 'notifications';

const DEFAULT_CONFIG: SystemConfig = {
  defaultNotificationPrefs: {
    browserEnabled: true,
    criticalEnabled: true,
    thresholdEnabled: true
  },
  criticalViolationThreshold: 15,
  pointThreshold: 50
};

export const configService = {
  async getConfig(): Promise<SystemConfig> {
    try {
      const ref = doc(db, CONFIG_COLL, NOTIFICATION_DOC);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        return snap.data() as SystemConfig;
      }
      
      return DEFAULT_CONFIG;
    } catch (error) {
      console.warn('System config not found or inaccessible, using defaults');
      return DEFAULT_CONFIG;
    }
  },

  async updateConfig(config: Partial<SystemConfig>) {
    try {
      const ref = doc(db, CONFIG_COLL, NOTIFICATION_DOC);
      await updateDoc(ref, config);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, CONFIG_COLL);
      throw error;
    }
  }
};
