/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  PJ = 'PJ'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  browserEnabled: boolean;
  criticalEnabled: boolean;
  thresholdEnabled: boolean;
}

export interface SystemConfig {
  defaultNotificationPrefs: NotificationPreferences;
  criticalViolationThreshold: number;
  pointThreshold: number;
}

export interface Student {
  id: string;
  name: string;
  studentId: string; // NIS
  grade: string;
  class: string;
  totalPoints: number;
  lastViolationAt?: number;
}

export interface ViolationCategory {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  categoryId: string;
  categoryName: string;
  points: number;
  description: string;
  violationDate: number; // timestamp
  reportedBy: string; // PJ name
  reportedById: string; // PJ UID
}

export interface DashboardStats {
  totalStudents: number;
  totalViolations: number;
  totalPoints: number;
  violationsToday: number;
  topViolators: Student[];
}

export type NotificationType = 'CRITICAL_VIOLATION' | 'THRESHOLD_REACHED' | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  studentId?: string;
  violationId?: string;
  targetRoles: UserRole[];
}
