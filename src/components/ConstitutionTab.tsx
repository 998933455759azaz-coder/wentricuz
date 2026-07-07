import React from "react";
import { COMPANY_CONSTITUTION } from "../data";
import { Book, Shield, Star, Award, AlertTriangle, Scale } from "lucide-react";
import { motion } from "motion/react";

export default function ConstitutionTab() {
  return (
    <div id="constitution-tab-container" className="space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-radial from-slate-800 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Book size={320} className="text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Shield size={12} /> RASMIY HUJJAT
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3 font-sans">
            Wentric Corporation Konstitutsiyasi
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Wentric Corporation Employee Management System (WCEMS) v1.0 ning asosiy tamoyillari, 
            korporativ qadriyatlari va xizmat yo'riqnomalari majmuasi. Har bir resident xodim uchun amal qilishi majburiydir.
          </p>
        </div>
      </motion.div>

      {/* Grid: Mission, Vision & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Star size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Kompaniya Missiyasi</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            {COMPANY_CONSTITUTION.mission}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Award size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Kompaniya Viziyasi (Kelajak)</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            {COMPANY_CONSTITUTION.vision}
          </p>
        </motion.div>
      </div>

      {/* Core Values Bento */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Scale size={16} className="text-emerald-400" /> Kompaniyaning Asosiy Qadriyatlari
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPANY_CONSTITUTION.values.map((v, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.4)" }}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 transition-colors"
            >
              <span className="text-xs font-bold text-emerald-400 font-mono">0{idx + 1}</span>
              <h4 className="text-sm font-semibold text-slate-100 mt-1 mb-2">{v.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rules and Ethics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ethics list */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" /> Xodimlar Etikasi Qoidalari
          </h3>
          <ul className="space-y-3">
            {COMPANY_CONSTITUTION.ethics.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-mono font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Discipline and Warning */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400" /> Intizom Qoidalari va Xavfsizlik
          </h3>
          <ul className="space-y-3">
            {COMPANY_CONSTITUTION.discipline.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-rose-400 font-mono font-bold mt-0.5">!</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
