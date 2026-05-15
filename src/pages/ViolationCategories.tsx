/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  ListTodo, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { violationService } from '../services/violationService';
import { ViolationCategory } from '../types';
import { useToastStore } from '../store/useToastStore';
import { DEFAULT_VIOLATION_CATEGORIES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

import { useAppStore } from '../store/useAppStore';

export function ViolationCategories() {
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { isPJ, isAdmin } = useAppStore();
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 10
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await violationService.getCategories();
    setCategories(data);
    setLoading(false);
  };

  const openEditModal = (cat: ViolationCategory) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description,
      points: cat.points
    });
    setIsModalOpen(true);
  };

  const closeAndClearModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', points: 10 });
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await violationService.seedCategories(DEFAULT_VIOLATION_CATEGORIES.map(({ id, ...rest }) => rest));
      addToast("Default categories seeded successfully", "success");
      fetchData();
    } catch (error) {
      addToast("Failed to seed categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await violationService.updateCategory(editingId, formData);
        addToast("Jenis pelanggaran berhasil diperbarui", "success");
      } else {
        await violationService.createCategory(formData);
        addToast("Jenis pelanggaran berhasil ditambahkan", "success");
      }
      closeAndClearModal();
      fetchData();
    } catch (error) {
      addToast("Gagal menyimpan data", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await violationService.deleteCategory(deletingId);
      addToast("Jenis pelanggaran berhasil dihapus", "success");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (error) {
      addToast("Terjadi kesalahan saat menghapus data", "error");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  if (loading) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Jenis Pelanggaran</h1>
          <p className="text-sm text-slate-500 font-medium">Configure violation types and their associated penalty weights</p>
        </div>
        <div className="flex items-center gap-3">
          {categories.length === 0 && isPJ() && (
            <button 
              onClick={handleSeed}
              className="flex items-center space-x-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors"
            >
              <span>Seed Defaults</span>
            </button>
          )}
          {isPJ() && (
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData({ name: '', description: '', points: 10 });
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-rose-200 hover:scale-105 transition-transform"
            >
              <Plus size={20} strokeWidth={3} />
              <span>New Category</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="modern-card p-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 uppercase tracking-wider">
                  {cat.points} pts
                </span>
                <ShieldAlert size={18} className="text-slate-200 group-hover:text-rose-200 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight group-hover:text-rose-600 transition-colors">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium min-h-[3rem]">{cat.description}</p>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Active Scheme</span>
                {isPJ() && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(cat)}
                      className="text-slate-300 hover:text-indigo-500 transition-colors p-1 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(cat.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAndClearModal}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-gray-100"
            >
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-red-100">
                  {editingId ? <Edit2 size={32} /> : <Plus size={32} />}
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingId ? 'Edit Violation Type' : 'Add Violation Type'}
                </h2>
                <p className="text-gray-500 font-medium mt-1">
                  {editingId ? 'Update the details of this violation.' : 'Define a new behavior and its point weight.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Speaking Indonesian, etc."
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-red focus:ring-0 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Penalty Weight (Points)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-red focus:ring-0 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Guidelines</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="What specific behavior is expected?"
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm focus:ring-0 focus:border-brand-red min-h-[100px] transition-all font-medium"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-16 rounded-2xl gradient-brand text-white font-black text-lg shadow-xl shadow-red-100 hover:scale-[1.02] transition-transform"
                >
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
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
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h2>
              <p className="text-sm text-slate-500 font-medium mb-8">
                This action cannot be undone. All future logs will no longer be able to use this category.
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
