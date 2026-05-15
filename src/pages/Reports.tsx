/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { studentService } from '../services/studentService';
import { violationService } from '../services/violationService';
import { Student, Violation } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';

export function Reports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchData = async () => {
      const [s, v] = await Promise.all([
        studentService.getAll(),
        violationService.getLatest(1000)
      ]);
      setStudents(s);
      setViolations(v);
      setLoading(false);
    };
    fetchData();
  }, []);

  const weekInterval = {
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  };

  const weeklyViolations = violations.filter(v => isWithinInterval(v.violationDate, weekInterval));

  const downloadStudentReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("English Day Violation Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 30);
    
    // Table
    autoTable(doc, {
      startY: 40,
      head: [['NIS', 'Name', 'Grade', 'Class', 'Total Points']],
      body: students.map(s => [s.studentId, s.name, s.grade, s.class, s.totalPoints]),
      headStyles: { fillColor: [239, 68, 68] },
      styles: { font: 'helvetica' }
    });
    
    doc.save(`student_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    addToast("Export PDF siswa berhasil", "success");
  };

  const downloadWeeklyReport = () => {
    const doc = new jsPDF();
    const weekStr = `${format(weekInterval.start, 'dd MMM')} - ${format(weekInterval.end, 'dd MMM yyyy')}`;
    
    // Header
    doc.setFontSize(20);
    doc.text("English Day Weekly Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${weekStr}`, 14, 30);
    
    // Table
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Student', 'Violation', 'Points', 'Reporter']],
      body: weeklyViolations.map(v => [
        format(v.violationDate, 'yyyy-MM-dd'),
        v.studentName,
        v.categoryName,
        v.points,
        v.reportedBy
      ]),
      headStyles: { fillColor: [99, 102, 241] }, // Indigo for weekly
      styles: { font: 'helvetica' }
    });
    
    doc.save(`weekly_report_${format(weekInterval.start, 'yyyy-MM-dd')}.pdf`);
    addToast("Export laporan mingguan berhasil", "success");
  };

  const downloadViolationLog = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("English Day Audit Log", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`All recorded violations as of: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 30);
    
    // Table
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Student', 'Violation', 'Points', 'Reporter']],
      body: violations.map(v => [
        format(v.violationDate, 'yyyy-MM-dd'),
        v.studentName,
        v.categoryName,
        v.points,
        v.reportedBy
      ]),
      headStyles: { fillColor: [244, 114, 182] },
      styles: { font: 'helvetica' }
    });
    
    doc.save(`violation_log_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    addToast("Export log pelanggaran berhasil", "success");
  };

  if (loading) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan & Analytic</h1>
          <p className="text-sm text-slate-500 font-medium">Generate official documentation and PDF reports for school records</p>
        </div>

        <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setCurrentWeekStart(prev => subWeeks(prev, 1))}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 text-center min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Selected Week</p>
            <p className="text-sm font-bold text-slate-700 whitespace-nowrap uppercase">
              {format(weekInterval.start, 'dd MMMM yyyy')}
            </p>
          </div>
          <button 
            onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReportCard 
          title="Laporan Mingguan" 
          description={`Summary of ${weeklyViolations.length} violations recorded during the selected weekly interval.`}
          icon={<Calendar className="text-indigo-500" size={28} />}
          onDownload={downloadWeeklyReport}
          activeColor="hover:border-indigo-200"
          badge="Weekly"
        />
        <ReportCard 
          title="Rekap Poin Siswa" 
          description="Summary of all students and their accumulated violation points. Useful for end-of-month grading."
          icon={<FileText className="text-rose-500" size={28} />}
          onDownload={downloadStudentReport}
          activeColor="hover:border-rose-200"
        />
        <ReportCard 
          title="Full Violation Log" 
          description="Comprehensive audit trail of every single language violation recorded with reporter details."
          icon={<Layers className="text-pink-500" size={28} />}
          onDownload={downloadViolationLog}
          activeColor="hover:border-pink-200"
        />
      </div>

      <div className="modern-card p-10 bg-slate-900 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500 blur-[120px] opacity-20 translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-white shadow-inner">
            <Printer size={32} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 tracking-tight">Cetak Laporan PDF</h3>
            <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
              Seluruh laporan dibuat sesuai dengan standar administratif sekolah. 
              Gunakan mode PDF untuk pencetakan fisik atau arsip digital.
            </p>
          </div>
          <button 
            onClick={downloadStudentReport}
            className="px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-black/20"
          >
            <Download size={18} /> <span>Preview PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon, onDownload, activeColor, badge }: any) {
  return (
    <div className={cn("modern-card p-8 group transition-all relative", activeColor)}>
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
          {badge}
        </span>
      )}
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm h-12 line-clamp-2">{description}</p>
      <button 
        onClick={onDownload}
        className="w-full h-12 rounded-xl bg-slate-50 text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
      >
        <Download size={18} /> Download PDF
      </button>
    </div>
  );
}
