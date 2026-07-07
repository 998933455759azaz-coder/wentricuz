import React, { useState } from "react";
import { GRADES_LIST } from "../data";
import { Users, ChevronRight, Briefcase, Award, Shield, Cpu, HelpCircle, Activity, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NodeProps {
  title: string;
  role: string;
  dept: string;
  grade: string;
  description: string;
  teamMembers: string[];
  color: string;
  isActive: boolean;
  onSelect: () => void;
}

function OrgNode({ title, role, dept, grade, color, isActive, onSelect }: NodeProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`text-left w-full p-4 rounded-xl border transition-all duration-200 ${
        isActive 
          ? `bg-${color}-500/10 border-${color}-500 shadow-${color}-500/5 ring-1 ring-${color}-500/30` 
          : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
          {grade}
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-850 text-slate-300`}>
          {dept}
        </span>
      </div>
      <h4 className="text-sm font-bold text-white mb-0.5">{title}</h4>
      <p className="text-xs text-slate-400 font-mono">{role}</p>
    </motion.button>
  );
}

export default function OrgStructureTab() {
  const [selectedNode, setSelectedNode] = useState<string>("CEO");

  const nodes = {
    CEO: {
      title: "Sardorbek Rakhmonov",
      role: "CEO (Chief Executive Officer)",
      dept: "Executive",
      grade: "G15",
      description: "Wentric Corporation bosh ijrochi direktori. Kompaniyaning umumiy strategiyasi, moliya oqimlari, global bozorga kengayishi va WCEMS ekotizimining to'g'ri ishlashi uchun to'liq javobgar.",
      teamMembers: ["Executive Board", "Legal Advisor", "All C-Levels"],
      color: "emerald"
    },
    Legal: {
      title: "Yuridik Maslahatchi",
      role: "Legal Advisor",
      dept: "Legal",
      grade: "G13",
      description: "Kompaniyaning xalqaro va mahalliy shartnomalari, xodimlar mehnat huquqlari, intellektual mulk muhofazasi hamda qonuniy masalalar bo'yicha mustaqil maslahatchi.",
      teamMembers: ["Legal Compliance Officer"],
      color: "amber"
    },
    CTO: {
      title: "Javoxirjon To'rayev",
      role: "CTO (Chief Technology Officer)",
      dept: "Engineering",
      grade: "G14",
      description: "Texnologiyalar bo'yicha bosh direktor. Backend, Frontend, Mobile, DevOps, QA hamda AI Laboratoriyasi yo'nalishlarini boshqaradi. Tizim xavfsizligi va barqaror ish faoliyatini ta'minlaydi.",
      teamMembers: ["Engineering Manager", "Backend Team", "Frontend Team", "Mobile Team", "DevOps Team", "AI Lab", "QA Team"],
      color: "sky"
    },
    COO: {
      title: "Malika Solihova",
      role: "COO (Chief Operating Officer)",
      dept: "Operations",
      grade: "G14",
      description: "Operatsion boshqaruv direktori. HR jamoasi, Ma'murlar, Loyihalar boshqaruvi (PMO) va Mijozlarni qo'llab-quvvatlash (Support) departamentlari faoliyatini muvofiqlashtiradi.",
      teamMembers: ["HR Department", "Operations Managers", "Support Lead", "Administration"],
      color: "indigo"
    },
    CMO: {
      title: "Laylo Karimova",
      role: "CMO (Chief Marketing Officer)",
      dept: "Marketing",
      grade: "G14",
      description: "Marketing va Brending direktori. Wentric brendining ijtimoiy tarmoqlardagi obro'si, SMM kampaniyalari, dizayn va video kontent ishlab chiqarish yo'nalishlariga rahbarlik qiladi.",
      teamMembers: ["Branding Manager", "Digital Marketing", "Design & Video Team", "SMM & Content"],
      color: "rose"
    },
    CISO: {
      title: "Alisher Ubaydullayev",
      role: "CISO (Chief Information Security Officer)",
      dept: "Security",
      grade: "G14",
      description: "Axborot xavfsizligi bo'yicha bosh direktor. Red Team (Pentest), Blue Team (Himoya), SOC (Xavfsizlik markazi) va incident response jamoalarining muvofiqligini nazorat qiladi.",
      teamMembers: ["Red Team Leader", "Blue Team Leader", "Compliance Auditor", "SOC Analysts"],
      color: "violet"
    },
    CFO: {
      title: "Moliyaviy Direktor",
      role: "CFO (Chief Financial Officer)",
      dept: "Finance",
      grade: "G14",
      description: "Moliya va buxgalteriya ishlari bo'yicha bosh direktor. Maoshlar to'lovi (Payroll), xarajatlar tahlili, kompaniya byudjetini rejalashtirish va xaridlar nazorati uchun mas'ul.",
      teamMembers: ["Accounting", "Payroll Specialist", "Procurement Officer"],
      color: "teal"
    }
  };

  const currentNode = nodes[selectedNode as keyof typeof nodes];

  return (
    <div id="org-structure-tab-container" className="space-y-8">
      {/* Structural Hierarchy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Tree Column: Visual Nodes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-slate-200">Interaktiv Tashkiliy Tuzilma (C-Suite)</h3>
          </div>

          {/* Level 1: CEO */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-sm">
              <OrgNode
                title={nodes.CEO.title}
                role={nodes.CEO.role}
                dept={nodes.CEO.dept}
                grade={nodes.CEO.grade}
                description={nodes.CEO.description}
                teamMembers={nodes.CEO.teamMembers}
                color={nodes.CEO.color}
                isActive={selectedNode === "CEO"}
                onSelect={() => setSelectedNode("CEO")}
              />
            </div>
          </div>

          <div className="flex justify-center items-center my-2">
            <div className="h-4 w-0.5 bg-slate-800"></div>
          </div>

          {/* Level 2: Legal Advisor (floating slightly side) */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-xs bg-slate-900/30 p-1 rounded-xl border border-dashed border-slate-800">
              <OrgNode
                title={nodes.Legal.title}
                role={nodes.Legal.role}
                dept={nodes.Legal.dept}
                grade={nodes.Legal.grade}
                description={nodes.Legal.description}
                teamMembers={nodes.Legal.teamMembers}
                color={nodes.Legal.color}
                isActive={selectedNode === "Legal"}
                onSelect={() => setSelectedNode("Legal")}
              />
            </div>
          </div>

          <div className="flex justify-center items-center my-2">
            <div className="h-4 w-0.5 bg-slate-800"></div>
          </div>

          {/* Level 3: Department Executives (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <OrgNode
              title={nodes.CTO.title}
              role={nodes.CTO.role}
              dept={nodes.CTO.dept}
              grade={nodes.CTO.grade}
              description={nodes.CTO.description}
              teamMembers={nodes.CTO.teamMembers}
              color={nodes.CTO.color}
              isActive={selectedNode === "CTO"}
              onSelect={() => setSelectedNode("CTO")}
            />
            <OrgNode
              title={nodes.COO.title}
              role={nodes.COO.role}
              dept={nodes.COO.dept}
              grade={nodes.COO.grade}
              description={nodes.COO.description}
              teamMembers={nodes.COO.teamMembers}
              color={nodes.COO.color}
              isActive={selectedNode === "COO"}
              onSelect={() => setSelectedNode("COO")}
            />
            <OrgNode
              title={nodes.CMO.title}
              role={nodes.CMO.role}
              dept={nodes.CMO.dept}
              grade={nodes.CMO.grade}
              description={nodes.CMO.description}
              teamMembers={nodes.CMO.teamMembers}
              color={nodes.CMO.color}
              isActive={selectedNode === "CMO"}
              onSelect={() => setSelectedNode("CMO")}
            />
            <OrgNode
              title={nodes.CISO.title}
              role={nodes.CISO.role}
              dept={nodes.CISO.dept}
              grade={nodes.CISO.grade}
              description={nodes.CISO.description}
              teamMembers={nodes.CISO.teamMembers}
              color={nodes.CISO.color}
              isActive={selectedNode === "CISO"}
              onSelect={() => setSelectedNode("CISO")}
            />
            <OrgNode
              title={nodes.CFO.title}
              role={nodes.CFO.role}
              dept={nodes.CFO.dept}
              grade={nodes.CFO.grade}
              description={nodes.CFO.description}
              teamMembers={nodes.CFO.teamMembers}
              color={nodes.CFO.color}
              isActive={selectedNode === "CFO"}
              onSelect={() => setSelectedNode("CFO")}
            />
          </div>
        </div>

        {/* Right Info Column: Details of Selected Executive Node */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <Award size={14} /> WCEMS VAKOLAT DARADJASI
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentNode.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{currentNode.role}</p>
              </div>

              <div className="border-t border-slate-800 my-3"></div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">TAVSIF VA MAS'ULIYATI:</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{currentNode.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">BO'YSUNUVCHI JAMOA VA SOHALAR:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentNode.teamMembers.map((team, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      <ChevronRight size={10} className="text-emerald-400" /> {team}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Activity size={12} /> GRADE STATUS: {currentNode.grade}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Grade System Reference Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Briefcase size={18} className="text-emerald-400" /> Xodimlar Grade va Lavozim Tizimi
            </h3>
            <p className="text-xs text-slate-400 mt-1">G1 dan G15 gacha bo'lgan to'liq korporativ moliya va daraja strukturasi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="py-3 px-4 font-bold text-slate-300">Grade</th>
                <th className="py-3 px-4 font-bold text-slate-300">Rasmiy Lavozim</th>
                <th className="py-3 px-4 font-bold text-slate-300">Maosh Diapazoni</th>
                <th className="py-3 px-4 font-bold text-slate-300">Tavsif va Qo'llanishi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {GRADES_LIST.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{item.grade}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{item.title}</td>
                  <td className="py-3 px-4 font-mono text-amber-400 flex items-center gap-0.5">
                    <DollarSign size={13} /> {item.minSalary} – {item.maxSalary}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs leading-relaxed">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
