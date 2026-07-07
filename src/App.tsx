import React, { useState, useEffect } from "react";
import { INITIAL_EMPLOYEES, INITIAL_PROJECTS } from "./data";
import { Employee, Project } from "./types";
import ConstitutionTab from "./components/ConstitutionTab";
import OrgStructureTab from "./components/OrgStructureTab";
import EmployeeDatabaseTab from "./components/EmployeeDatabaseTab";
import BotSimulatorTab from "./components/BotSimulatorTab";
import ProjectBoardTab from "./components/ProjectBoardTab";
import AdminPanelTab from "./components/AdminPanelTab";
import CodeExporterTab from "./components/CodeExporterTab";

import { 
  Building2, Users, Bot, FolderKanban, ShieldCheck, FileCode, BookOpen, Clock, Globe, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"constitution" | "org" | "employees" | "bot" | "projects" | "admin" | "exporter">("employees");
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Clock setup
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalWarnings = employees.reduce((acc, curr) => acc + curr.warningCount, 0);

  return (
    <div id="wcems-root-layout" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Professional Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black tracking-widest font-mono shadow-lg shadow-emerald-500/10 border border-emerald-400">
              WC
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                Wentric Corporation <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">Employee Management System (WCEMS)</p>
            </div>
          </div>

          {/* Quick Metrics Panel */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
              <Users size={13} className="text-emerald-400" />
              <span className="text-slate-400">Xodimlar:</span>
              <span className="text-white font-bold">{employees.length} ta</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
              <ShieldAlert size={13} className="text-rose-400" />
              <span className="text-slate-400">Warnings:</span>
              <span className="text-rose-400 font-bold">{totalWarnings} ta</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
              <Globe size={13} className="text-sky-400" />
              <span className="text-slate-400">Infrastruktura:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
              <Clock size={13} className="text-amber-400" />
              <span className="text-slate-300 font-bold w-16 text-center">{currentTime || "00:00:00"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Navigation Tab Rail */}
        <div className="flex overflow-x-auto gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-sm shadow-xl scrollbar-none">
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "employees" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 size={14} /> Xodimlar Bazasi & Card
          </button>

          <button
            onClick={() => setActiveTab("bot")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bot" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot size={14} /> Telegram Bot Simulator & AI
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "admin" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={14} /> 20x Admin Panel
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "projects" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderKanban size={14} /> Loyihalar (Kanban)
          </button>

          <button
            onClick={() => setActiveTab("org")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "org" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={14} /> Tashkiliy Tuzilma
          </button>

          <button
            onClick={() => setActiveTab("constitution")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "constitution" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen size={14} /> Kompaniya Konstitutsiyasi
          </button>

          <button
            onClick={() => setActiveTab("exporter")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "exporter" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode size={14} /> Python Bot Code Exporter
          </button>
        </div>

        {/* Tab content viewer */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "constitution" && <ConstitutionTab />}
              {activeTab === "org" && <OrgStructureTab />}
              {activeTab === "employees" && (
                <EmployeeDatabaseTab employees={employees} setEmployees={setEmployees} />
              )}
              {activeTab === "bot" && (
                <BotSimulatorTab employees={employees} setEmployees={setEmployees} />
              )}
              {activeTab === "projects" && <ProjectBoardTab />}
              {activeTab === "admin" && (
                <AdminPanelTab employees={employees} setEmployees={setEmployees} />
              )}
              {activeTab === "exporter" && <CodeExporterTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Branding line */}
      <footer className="bg-slate-900/40 border-t border-slate-800/60 py-6 px-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <p>© {new Date().getFullYear()} Wentric Corporation. All Rights Reserved. WCEMS v1.0. Crafted for Security & High Performance.</p>
      </footer>
    </div>
  );
}

