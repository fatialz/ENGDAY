/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Calendar
} from 'lucide-react';
import { studentService } from '../services/studentService';
import { violationService } from '../services/violationService';
import { Student, Violation } from '../types';
import { THEME } from '../constants';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recentViolations, setRecentViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const { isPJ } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      const [s, v] = await Promise.all([
        studentService.getAll(),
        violationService.getLatest(100) // Increase for stats
      ]);
      setStudents(s);
      setRecentViolations(v);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const weekInterval = {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 })
    };

    const violationsToday = recentViolations.filter(v => format(v.violationDate, 'yyyy-MM-dd') === todayStr);
    const weeklyViolations = recentViolations.filter(v => isWithinInterval(v.violationDate, weekInterval));

    // Calculate weekly top violators
    const studentWeeklyPoints: { [key: string]: { name: string, points: number, grade: string, class: string } } = {};
    weeklyViolations.forEach(v => {
      if (!studentWeeklyPoints[v.studentId]) {
        studentWeeklyPoints[v.studentId] = { name: v.studentName, points: 0, grade: '', class: '' };
      }
      studentWeeklyPoints[v.studentId].points += v.points;
    });

    const topWeekly = Object.entries(studentWeeklyPoints)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    return {
      violationsToday: violationsToday.length,
      weeklyCount: weeklyViolations.length,
      weeklyPoints: weeklyViolations.reduce((sum, v) => sum + v.points, 0),
      totalPoints: students.reduce((sum, s) => sum + s.totalPoints, 0),
      topWeekly,
      topAllTime: [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5)
    };
  }, [students, recentViolations]);

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Recap and monitoring for English Day violators</p>
        </div>
        <div className="flex items-center gap-4">
          {isPJ() && (
            <Link to="/app/violations" className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-rose-200 hover:scale-105 transition-transform">
              <Plus size={18} strokeWidth={3} />
              <span>Input Violation</span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Daily Reports" 
          value={stats.violationsToday} 
          subValue="Violations Today"
          color="bg-rose-500"
        />
        <StatCard 
          label="Weekly Reports" 
          value={stats.weeklyCount} 
          subValue="This Week"
          color="bg-pink-500"
        />
        <StatCard 
          label="Weekly Points" 
          value={stats.weeklyPoints} 
          subValue="This Week"
          color="bg-indigo-500"
        />
        <StatCard 
          label="Cumulative" 
          value={stats.totalPoints} 
          subValue="All Records"
          color="bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Violations - Takes 2 columns */}
        <div className="lg:col-span-2 modern-card p-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <Link to="/app/history" className="text-xs font-bold text-rose-500 hover:underline uppercase">Full Audit Trail</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Violation Type</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {recentViolations.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {v.studentName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{v.studentName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{v.categoryName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded text-xs font-bold">+{v.points} pts</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 font-medium whitespace-nowrap">
                      {format(v.violationDate, 'HH:mm')}
                    </td>
                  </tr>
                ))}
                {recentViolations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No violations reported yet today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center / Weekly Rank */}
        <div className="space-y-6">
          <div className="modern-card p-6 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-white font-bold tracking-tight">Weekly Ranking</h4>
              <Calendar className="text-slate-600" size={16} />
            </div>
            <div className="space-y-4">
              {stats.topWeekly.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                      idx === 0 ? "bg-rose-500 text-white" : "bg-white/10 text-slate-400"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Weekly Points</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-500">+{s.points}</span>
                </div>
              ))}
              {stats.topWeekly.length === 0 && (
                <p className="text-center py-4 text-slate-500 text-xs italic">No violations this week. Excellent!</p>
              )}
            </div>
          </div>

          <div className="modern-card p-6">
            <h4 className="text-slate-800 font-bold mb-4 flex items-center justify-between">
              <span>All-Time High Risk</span>
              <AlertTriangle className="text-rose-500" size={16} />
            </h4>
            <div className="space-y-4">
              {stats.topAllTime.filter(s => s.totalPoints > 0).map((s) => (
                <div key={s.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{s.grade}-{s.class}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-800">{s.totalPoints}</span>
                </div>
              ))}
              {stats.topAllTime.filter(s => s.totalPoints > 0).length === 0 && (
                <p className="text-center py-4 text-slate-400 text-xs italic">Clear records for now.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: any) {
  return (
    <div className="modern-card p-6">
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
        <span className="text-rose-500 text-xs font-bold">{subValue}</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
        <div className={cn("h-1.5 rounded-full transition-all duration-1000", color)} style={{ width: '65%' }}></div>
      </div>
    </div>
  );
}
