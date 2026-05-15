/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { Student } from '../types';
import { THEME, GRADES, CLASSES } from '../constants';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function StudentData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'studentId' | 'totalPoints';
    direction: 'asc' | 'desc';
  } | null>({ key: 'name', direction: 'asc' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();
  const { user, isPJ, isAdmin } = useAppStore();
  const { addToast } = useToastStore();

  const canDelete = isPJ();
  const canAdd = isPJ() || isAdmin();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    grade: '10',
    class: CLASSES[0] || 'MP1'
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await studentService.getAll();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    let result = students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.studentId.includes(searchQuery);
      const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
      const matchesClass = selectedClass === 'All' || s.class === selectedClass;
      return matchesSearch && matchesGrade && matchesClass;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [students, searchQuery, selectedGrade, selectedClass, sortConfig]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const requestSort = (key: 'name' | 'studentId' | 'totalPoints') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: 'name' | 'studentId' | 'totalPoints') => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-20" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp size={14} className="ml-1 text-rose-500" /> : 
      <ArrowDown size={14} className="ml-1 text-rose-500" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, formData);
        addToast("Data siswa berhasil diperbarui", "success");
      } else {
        await studentService.create(formData);
        addToast("Siswa baru berhasil ditambahkan", "success");
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', studentId: '', grade: '10', class: CLASSES[0] || 'MP1' });
      fetchData();
    } catch (error) {
      addToast("Terjadi kesalahan saat menyimpan data", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await studentService.delete(deletingId);
      addToast("Data siswa berhasil dihapus", "success");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (error: any) {
      console.error("Delete Error:", error);
      const msg = error.message?.includes("insufficient permissions") 
        ? "Anda tidak memiliki izin untuk menghapus data ini."
        : "Terjadi kesalahan saat menghapus data";
      addToast(msg, "error");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      studentId: student.studentId,
      grade: student.grade,
      class: student.class
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Student Directory</h1>
          <p className="text-sm text-slate-500">Manage and track student information system-wide</p>
        </div>
        {canAdd && (
          <button 
            onClick={() => {
              setEditingStudent(null);
              setFormData({ name: '', studentId: '', grade: '10', class: CLASSES[0] || 'MP1' });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-rose-200 hover:scale-105 transition-transform"
          >
            <UserPlus size={20} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="modern-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-6 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-0 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="h-11 px-6 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-0 text-sm font-bold text-slate-600"
          >
            <option value="All">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-11 px-6 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-0 text-sm font-bold text-slate-600"
          >
            <option value="All">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100">
                <th 
                  className="px-8 py-5 cursor-pointer hover:text-rose-500 transition-colors"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Name {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-8 py-5 cursor-pointer hover:text-rose-500 transition-colors"
                  onClick={() => requestSort('studentId')}
                >
                  <div className="flex items-center">
                    Student ID {getSortIcon('studentId')}
                  </div>
                </th>
                <th className="px-8 py-5 text-center">Class</th>
                <th 
                  className="px-8 py-5 text-center cursor-pointer hover:text-rose-500 transition-colors"
                  onClick={() => requestSort('totalPoints')}
                >
                  <div className="flex items-center justify-center">
                    Total Points {getSortIcon('totalPoints')}
                  </div>
                </th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                        {student.name[0]}
                      </div>
                      <p className="font-bold text-slate-800">{student.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-[10px] text-slate-400 font-bold">{student.studentId}</p>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      {student.grade}-{student.class}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold",
                      student.totalPoints > 50 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {student.totalPoints} pts
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {canDelete && (
                        <button 
                          onClick={() => navigate(`/app/violations?studentId=${student.id}`)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-all font-bold flex items-center gap-1 group"
                          title="Report Violation"
                        >
                          <AlertOctagon size={16} className="group-hover:scale-110 transition-transform" />
                          <span className="hidden lg:inline text-[10px] uppercase tracking-tighter">Log Points</span>
                        </button>
                      )}
                      {canDelete ? (
                        <>
                          <button onClick={() => openEdit(student)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => confirmDelete(student.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase">ReadOnly</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="text-slate-800">{filteredStudents.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-white border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show current page, first, last, and neighbors
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-9 h-9 rounded-xl text-xs font-bold transition-all",
                        currentPage === pageNum 
                          ? "bg-rose-500 text-white shadow-md shadow-rose-200" 
                          : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl bg-white border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-gray-100"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingStudent ? 'Edit Student Details' : 'Register New Student'}
                </h2>
                <p className="text-gray-500 font-medium mt-1">Please provide the required information accurately.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Description</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter student's full name"
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-red focus:ring-0 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">NIS (Student ID)</label>
                  <input 
                    required
                    type="text" 
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    placeholder="Enter NIS"
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-red focus:ring-0 transition-all text-sm font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Grade</label>
                    <select 
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-red focus:ring-0 transition-all text-sm font-bold"
                    >
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class</label>
                    <select 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-red focus:ring-0 transition-all text-sm font-bold"
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] h-14 rounded-2xl gradient-brand text-white font-bold shadow-xl shadow-red-100 hover:scale-[1.02] transition-transform"
                  >
                    {editingStudent ? 'Update Account' : 'Save Registration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Student?</h2>
              <p className="text-sm text-slate-500 font-medium mb-8">
                This will permanently remove the student record. Historical violation logs will remain but won't be linked to an active student.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
