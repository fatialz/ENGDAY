/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { ShieldCheck, Languages, Award, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { THEME } from '../constants';
import { cn } from '../lib/utils';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm shadow-rose-200">
              <Languages size={20} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">ENG DAY <span className="text-rose-500">TRACKER</span></span>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <h1 className="text-5xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Maintain the <br />
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">English Spirit</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Transform your school's English Day enforcement with an automated, role-based violation tracker and point system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link 
                to="/login" 
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-rose-200"
              >
                Get Started Now <ChevronRight size={20} strokeWidth={3} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck size={28} strokeWidth={2.5} />}
              title="Role-Based Security"
              description="Dedicated access models for Admin and PJ to ensure data integrity and compliance."
              color="text-rose-500 bg-rose-50"
            />
            <FeatureCard 
              icon={<Award size={28} strokeWidth={2.5} />}
              title="Auto-Point System"
              description="Automated calculations for violation points with instant record updates."
              color="text-pink-500 bg-pink-50"
            />
            <FeatureCard 
              icon={<Languages size={28} strokeWidth={2.5} />}
              title="Detailed Reporting"
              description="Daily, weekly, and monthly recaps with PDF export functionality for school records."
              color="text-rose-500 bg-rose-50"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs font-bold tracking-widest uppercase">
          <div>© 2024 English Day Violation Tracker</div>
          <div className="flex gap-8">
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
  return (
    <div className="p-8 modern-card bg-white group hover:-translate-y-2 transition-all duration-300">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", color)}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-normal text-sm">{description}</p>
    </div>
  );
}
