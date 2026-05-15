/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  CheckCircle2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { studentService } from '../services/studentService';
import { violationService } from '../services/violationService';
import { Student, ViolationCategory } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { THEME } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function ViolationInput() {
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ViolationCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isPJ } = useAppStore();
  const { addToast } = useToastStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const canSubmit = isPJ();

  useEffect(() => {
    const fetchData = async () => {
      const [s, c] = await Promise.all([
        studentService.getAll(),
        violationService.getCategories()
      ]);
      setStudents(s);
      setCategories(c);
      setLoading(false);

      // Check for studentId in URL
      const preSelectedId = searchParams.get('studentId');
      if (preSelectedId) {
        const student = s.find(item => item.id === preSelectedId);
        if (student) {
          setSelectedStudent(student);
        }
      }
    };
    fetchData();
  }, [searchParams]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.includes(searchQuery)
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCategory || !user || !canSubmit) return;

    setIsSubmitting(true);
    try {
      await violationService.createViolation({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        points: selectedCategory.points,
        description: description || selectedCategory.description,
        violationDate: Date.now(),
        reportedBy: user.displayName,
        reportedById: user.uid
      });

      addToast("Pelanggaran berhasil dicatat", "success");
      navigate('/app/history');
    } catch (error) {
      addToast("Gagal mencatat pelanggaran", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Log Violation</h1>
        <p className="text-sm text-slate-500 font-medium">Record language violations accurately for point assignment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Select Student */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">1</div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Select Student</h2>
          </div>
          
          <div className="modern-card p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-6 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-0 text-sm font-medium"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {/* Show selected student if it exists and search is empty */}
              {!searchQuery && selectedStudent && (
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Selected Student</p>
                  <button
                    onClick={() => setSelectedStudent(selectedStudent)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-rose-200 bg-rose-50 shadow-sm text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                        {selectedStudent.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedStudent.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedStudent.grade}-{selectedStudent.class}</p>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-rose-600" />
                  </button>
                </div>
              )}

              {searchQuery && filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left",
                    selectedStudent?.id === student.id 
                      ? "border-rose-200 bg-rose-50 shadow-sm" 
                      : "border-slate-50 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{student.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{student.grade}-{student.class}</p>
                    </div>
                  </div>
                  {selectedStudent?.id === student.id && <CheckCircle2 size={18} className="text-rose-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Select Category */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-brand-pink flex items-center justify-center font-bold">2</div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">Violation Type</h2>
          </div>
          
          <div className="space-y-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "w-full p-4 rounded-3xl border transition-all text-left group relative overflow-hidden",
                  selectedCategory?.id === cat.id 
                    ? "border-pink-200 bg-pink-50 shadow-sm" 
                    : "border-white bg-white hover:border-slate-100 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between mb-1 relative z-10">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{cat.name}</span>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                    selectedCategory?.id === cat.id ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {cat.points} pts
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 leading-relaxed pr-4 relative z-10">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation & Description */}
      <AnimatePresence>
        {selectedStudent && selectedCategory && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="modern-card p-8 bg-slate-900 text-white overflow-hidden relative shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <ShieldCheck size={24} className="text-rose-500" /> Apply Penalty
              </h3>
              
              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Student</label>
                  <p className="text-lg font-bold">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{selectedStudent.grade}-{selectedStudent.class}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Infraction</label>
                  <p className="text-lg font-bold text-rose-500">{selectedCategory.name}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">+{selectedCategory.points} Points</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Additional Context (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the context..."
                    className="w-full bg-white/5 border-white/10 rounded-2xl p-4 text-sm focus:ring-0 focus:border-rose-500 min-h-[100px] transition-all placeholder:text-slate-600"
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSubmit}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 font-bold text-lg shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2 group transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : !canSubmit ? 'Restricted to PJ Role' : (
                    <>
                      Confirm & Submit <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShieldCheck({ size, className }: any) {
  return (
    <div className={cn("rounded-lg flex items-center justify-center", className)}>
      <AlertTriangle size={size} />
    </div>
  );
}
