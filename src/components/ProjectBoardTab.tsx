import React, { useState } from "react";
import { Project } from "../types";
import { INITIAL_PROJECTS } from "../data";
import { 
  FolderGit, ChevronRight, Play, CheckCircle2, LayoutGrid, Clock, Users, Plus, Star
} from "lucide-react";
import { motion } from "motion/react";

export default function ProjectBoardTab() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  
  const columns: Project["status"][] = [
    "Planning",
    "Backlog",
    "In Progress",
    "Code Review",
    "Testing",
    "Staging",
    "Production",
    "Maintenance"
  ];

  const handleMoveProject = (id: string, newStatus: Project["status"]) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        let progress = p.progress;
        if (newStatus === "Production" || newStatus === "Maintenance") progress = 100;
        else if (newStatus === "Planning") progress = 0;
        else if (newStatus === "Backlog") progress = 15;
        else if (newStatus === "In Progress") progress = 45;
        else if (newStatus === "Code Review") progress = 85;
        else if (newStatus === "Testing") progress = 90;
        else if (newStatus === "Staging") progress = 95;

        return { ...p, status: newStatus, progress };
      }
      return p;
    }));
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Planning": return "border-slate-800 text-slate-400 bg-slate-900/10";
      case "Backlog": return "border-blue-500/20 text-blue-400 bg-blue-500/5";
      case "In Progress": return "border-amber-500/20 text-amber-400 bg-amber-500/5";
      case "Code Review": return "border-purple-500/20 text-purple-400 bg-purple-500/5";
      case "Testing": return "border-indigo-500/20 text-indigo-400 bg-indigo-500/5";
      case "Staging": return "border-sky-500/20 text-sky-400 bg-sky-500/5";
      case "Production": return "border-emerald-500/20 text-emerald-400 bg-emerald-500/5";
      case "Maintenance": return "border-teal-500/20 text-teal-400 bg-teal-500/5";
    }
  };

  return (
    <div id="project-board-tab-container" className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FolderGit size={18} className="text-emerald-400" /> Wentric Loyihalarni Boshqarish Kanbany
          </h3>
          <p className="text-xs text-slate-400 mt-1">SOP bo'yicha loyiha bosqichlarining to'liq nazorati (Planning ➔ Maintenance)</p>
        </div>

        <div className="flex gap-2 text-xs font-mono">
          <span className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-300">
            Jami Loyihalar: {projects.length} ta
          </span>
          <span className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">
            Uptime: 100%
          </span>
        </div>
      </div>

      {/* Grid: Columns Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colProjects = projects.filter(p => p.status === col);
          
          return (
            <div key={col} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 min-w-[200px] flex flex-col space-y-3">
              
              {/* Column Sarlavha */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">{col}</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  {colProjects.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-2.5 min-h-[150px]">
                {colProjects.map((p) => (
                  <motion.div
                    key={p.id}
                    layoutId={p.id}
                    whileHover={{ y: -2 }}
                    className={`p-3.5 rounded-xl border ${getStatusColor(col)} text-left flex flex-col justify-between space-y-3 relative group transition-all`}
                  >
                    <div>
                      <span className="text-[8px] font-mono font-black tracking-widest text-slate-500 block">{p.id}</span>
                      <h4 className="text-xs font-bold text-white mt-1 leading-normal">{p.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">{p.description}</p>
                    </div>

                    <div className="space-y-2">
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>Progress:</span>
                          <span>{p.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${p.progress}%` }}></div>
                        </div>
                      </div>

                      {/* Team Assignment */}
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono pt-1">
                        <Users size={10} /> {p.assignees.join(", ")}
                      </div>
                    </div>

                    {/* Move Quick Control inside card */}
                    <div className="mt-2.5 pt-2 border-t border-slate-900/40 flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <select
                        value={p.status}
                        onChange={(e) => handleMoveProject(p.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-900 rounded px-1.5 py-0.5 text-[9px] text-slate-400 font-sans focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {columns.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
                
                {colProjects.length === 0 && (
                  <div className="h-full border border-dashed border-slate-900 rounded-xl flex items-center justify-center p-4 text-[10px] text-slate-600 font-mono">
                    Bo'sh
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
