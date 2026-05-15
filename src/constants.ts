/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APP_NAME = "English Day Violation Tracker";

export const GRADES = ["10", "11", "12"];
export const CLASSES = ["MP1", "MP2", "PPLG1", "PPLG2", "DKV", "AKL1", "AKL2", "BR1", "BR2"];

export const DEFAULT_VIOLATION_CATEGORIES = [
  { id: 'v1', name: 'Speaking Native Language', description: 'Speaking in Indonesian/Local language during English Day', points: 10 },
  { id: 'v2', name: 'Refusing to Respond', description: 'Refusing to answer when addressed in English', points: 15 },
  { id: 'v3', name: 'Mocking English Accents', description: 'Making fun of peers or teachers accents', points: 20 },
];

export const THEME = {
  primary: "#ef4444", // red-500
  secondary: "#f472b6", // pink-400
  accent: "#be123c", // rose-700
  gradient: "bg-gradient-to-r from-red-600 via-pink-500 to-rose-500",
  gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-500"
};
