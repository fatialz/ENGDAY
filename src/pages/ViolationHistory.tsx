/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Calendar,
  Filter,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { violationService } from '../services/violationService';
import { Violation } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { THEME, GRADES, CLASSES } from '../constants';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, getWeek, startOfDay, endOfDay, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

export function ViolationHistory() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date State
  const [startDate, setStartDate] = useState<string>(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  
  const { isPJ, isAdmin } = useAppStore();
  const { addToast } = useToastStore();

  const fetchData = async () => {
    setLoading(true);
    const data = await violationService.getLatest(1000); // Fetch more for history
    setViolations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredViolations = useMemo(() => {
    try {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(addWeeks(start, 1)); // Show one entire week from selected date
      
      return violations.filter(v => {
        const matchesSearch = v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRange = isWithinInterval(v.violationDate, { start, end });
        return matchesSearch && matchesRange;
      });
    } catch (e) {
      return [];
    }
  }, [violations, searchQuery, startDate]);

  const handleDelete = async (violation: Violation) => {
    if (!window.confirm("Hapus catatan pelanggaran ini? Poin siswa akan dikurangi otomatis.")) return;
    
    try {
      await violationService.deleteViolation(violation);
      addToast("Catatan pelanggaran berhasil dihapus", "success");
      fetchData();
    } catch (error) {
      addToast("Gagal menghapus catatan", "error");
    }
  };

  const nextWeek = () => {
    const nextStart = addWeeks(parseISO(startDate), 1);
    setStartDate(format(nextStart, 'yyyy-MM-dd'));
  };

  const prevWeek = () => {
    const prevStart = subWeeks(parseISO(startDate), 1);
    setStartDate(format(prevStart, 'yyyy-MM-dd'));
  };

  const resetToToday = () => {
    setStartDate(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Rekap Pelanggaran</h1>
          <p className="text-sm text-slate-500 font-medium">Audit data pelanggaran bahasa berdasarkan minggu</p>
        </div>
        
        <div className="flex flex-wrap items-center bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm gap-2">
          <div className="flex items-center bg-slate-50 rounded-lg p-0.5">
            <button 
              onClick={prevWeek}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-400 hover:text-slate-600 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextWeek}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-400 hover:text-slate-600 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 px-2 border-l border-slate-100 ml-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Search & Reset */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="modern-card p-3 flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-6 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-0 transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
        <button 
          onClick={resetToToday}
          className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
        >
          <Calendar size={16} /> <span>This Week</span>
        </button>
      </div>

      {/* History List */}
      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Record Info</th>
                <th className="px-8 py-5">Violation Type</th>
                <th className="px-8 py-5 text-center">Points</th>
                <th className="px-8 py-5 text-right">Reporter</th>
                {isPJ() && <th className="px-8 py-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredViolations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center -space-y-1">
                        <span className="text-[9px] font-black text-rose-500 uppercase">{format(v.violationDate, 'MMM')}</span>
                        <span className="text-lg font-black text-slate-800">{format(v.violationDate, 'dd')}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{v.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-400">{format(v.violationDate, 'HH:mm')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="max-w-md">
                      <p className="text-sm font-bold text-slate-700">{v.categoryName}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{v.description}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                      +{v.points}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{v.reportedBy}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Authorized Staff</p>
                    </div>
                  </td>
                  {isPJ() && (
                    <td className="px-8 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(v)}
                        className="p-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredViolations.length === 0 && (
                <tr>
                  <td colSpan={isPJ() ? 5 : 4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <History size={64} className="text-gray-300" />
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No data for this interval</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Stats Insight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="modern-card p-6 bg-rose-50/30 border-rose-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Weekly Count</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-rose-600 leading-none">{filteredViolations.length}</span>
            <span className="text-xs font-bold text-rose-400 mb-1">Records</span>
          </div>
        </div>
        <div className="modern-card p-6 bg-slate-50/50 border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Weekly Points</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-800 leading-none">
              {filteredViolations.reduce((sum, v) => sum + v.points, 0)}
            </span>
            <span className="text-xs font-bold text-slate-400 mb-1">Accumulated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
