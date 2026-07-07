import React, { useState } from "react";
import { Employee, EmployeeStatus } from "../types";
import { GRADES_LIST } from "../data";
import { 
  Search, Filter, Plus, Calendar, Shield, Award, AlertOctagon, 
  UserPlus, CheckCircle, ChevronDown, RefreshCw, Sparkles, AlertCircle, X, Edit, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export default function EmployeeDatabaseTab({ employees, setEmployees }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Selection for physical card badge visualizer
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("DEV-004");
  
  // Form state for new employee
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    username: "",
    position: "",
    grade: "G9",
    department: "Engineering",
    team: "Backend Team",
    manager: "CTO",
    kpi: 90,
    okr: "Muvaffaqiyatli integratsiyalar va topshiriqlar ijrosi.",
    bonus: 0,
    vacationDays: 12,
    skills: "Python, FastAPI",
    certificates: "Wentric Intern Certificate"
  });

  const [formError, setFormError] = useState("");

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.username || !newEmp.position) {
      setFormError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    if (!newEmp.username.startsWith("@")) {
      setFormError("Username '@' belgisi bilan boshlanishi shart.");
      return;
    }
    
    // Check duplication
    if (employees.some(emp => emp.username.toLowerCase() === newEmp.username.toLowerCase())) {
      setFormError("Ushbu username ostida xodim allaqachon mavjud!");
      return;
    }

    const uniqueId = `${newEmp.department.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const addedEmployee: Employee = {
      id: uniqueId,
      name: newEmp.name,
      username: newEmp.username,
      position: newEmp.position,
      grade: newEmp.grade,
      department: newEmp.department,
      team: newEmp.team,
      manager: newEmp.manager,
      startDate: new Date().toISOString().split("T")[0],
      status: EmployeeStatus.ONLINE,
      kpi: Number(newEmp.kpi),
      okr: newEmp.okr,
      bonus: Number(newEmp.bonus),
      warningCount: 0,
      vacationDays: Number(newEmp.vacationDays),
      skills: newEmp.skills.split(",").map(s => s.trim()),
      certificates: newEmp.certificates.split(",").map(s => s.trim()).filter(Boolean),
      completedProjects: [],
      permissions: ["View Platform"]
    };

    setEmployees(prev => [addedEmployee, ...prev]);
    setSelectedEmployeeId(addedEmployee.id);
    
    // Reset
    setNewEmp({
      name: "",
      username: "",
      position: "",
      grade: "G9",
      department: "Engineering",
      team: "Backend Team",
      manager: "CTO",
      kpi: 90,
      okr: "Muvaffaqiyatli integratsiyalar va topshiriqlar ijrosi.",
      bonus: 0,
      vacationDays: 12,
      skills: "Python, FastAPI",
      certificates: "Wentric Intern Certificate"
    });
    setFormError("");
    setShowAddForm(false);
  };

  // Warning updater
  const handleUpdateWarning = (id: string, increment: boolean) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        let newCount = emp.warningCount + (increment ? 1 : -1);
        if (newCount < 0) newCount = 0;
        if (newCount > 5) newCount = 5;
        
        // If warning reaches 5, recommend status change to FIRED
        let status = emp.status;
        if (newCount === 5) {
          status = EmployeeStatus.FIRED;
        }
        return { ...emp, warningCount: newCount, status };
      }
      return emp;
    }));
  };

  // KPI updater
  const handleUpdateKpi = (id: string, value: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, kpi: Math.max(0, Math.min(100, value)) };
      }
      return emp;
    }));
  };

  // Bonus updater
  const handleUpdateBonus = (id: string, amount: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, bonus: Math.max(0, emp.bonus + amount) };
      }
      return emp;
    }));
  };

  // Status changer
  const handleUpdateStatus = (id: string, status: EmployeeStatus) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, status };
      }
      return emp;
    }));
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDept = deptFilter === "ALL" || emp.department === deptFilter;
    const matchesStatus = statusFilter === "ALL" || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Helper for KPI Rating Label
  const getKpiRating = (kpi: number) => {
    if (kpi >= 95) return { label: "⭐️ Outstanding", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (kpi >= 85) return { label: "🟢 Excellent", color: "text-green-400 bg-green-500/10 border-green-500/20" };
    if (kpi >= 70) return { label: "🟡 Good", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    if (kpi >= 50) return { label: "🟠 Needs Improvement", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
    return { label: "🔴 PIP (Performance Improvement)", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  };

  // Helper for Status color
  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ONLINE:
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      case EmployeeStatus.VACATION:
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      case EmployeeStatus.FIRED:
        return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div id="employee-db-tab-container" className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* LEFT & MID COLUMN: Search, Filters & Employee Directory */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Search, filters, and Add Button */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
          
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Ism, ID, username yoki lavozim orqali izlash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
              <Filter size={14} className="text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Barcha Bo'limlar</option>
                <option value="Executive">Executive</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Barcha Holatlar</option>
                <option value={EmployeeStatus.ONLINE}>Online (Faol)</option>
                <option value={EmployeeStatus.VACATION}>Ta'tilda</option>
                <option value={EmployeeStatus.FIRED}>Bo'shatilgan</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus size={14} /> Xodim Qo'shish
            </button>
          </div>
        </div>

        {/* Add Employee Modal Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="text-emerald-400" size={20} /> Yangi Xodim Ro'yxatdan O'tkazish
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              <form onSubmit={handleAddEmployee} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">To'liq ism (F.I.Sh) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Hasanov Ilyos"
                      value={newEmp.name}
                      onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Username (Telegram) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: @hasanov_ilyos"
                      value={newEmp.username}
                      onChange={(e) => setNewEmp({...newEmp, username: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Lavozim *</label>
                    <input
                      type="text"
                      required
                      placeholder="Backend Developer"
                      value={newEmp.position}
                      onChange={(e) => setNewEmp({...newEmp, position: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Department</label>
                    <select
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="Security">Security</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Grade</label>
                    <select
                      value={newEmp.grade}
                      onChange={(e) => setNewEmp({...newEmp, grade: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {GRADES_LIST.map(g => (
                        <option key={g.grade} value={g.grade}>{g.grade} - {g.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Mas'ul Rahbari</label>
                    <input
                      type="text"
                      placeholder="CTO yoki CEO"
                      value={newEmp.manager}
                      onChange={(e) => setNewEmp({...newEmp, manager: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Boshlang'ich KPI</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newEmp.kpi}
                      onChange={(e) => setNewEmp({...newEmp, kpi: Number(e.target.value)})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Boshlang'ich Bonus ($)</label>
                    <input
                      type="number"
                      value={newEmp.bonus}
                      onChange={(e) => setNewEmp({...newEmp, bonus: Number(e.target.value)})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Ta'til kunlari</label>
                    <input
                      type="number"
                      value={newEmp.vacationDays}
                      onChange={(e) => setNewEmp({...newEmp, vacationDays: Number(e.target.value)})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Sertifikatlar (vergul bilan ajrating)</label>
                  <input
                    type="text"
                    placeholder="AWS Solutions Architect, PMP"
                    value={newEmp.certificates}
                    onChange={(e) => setNewEmp({...newEmp, certificates: e.target.value})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Asosiy skills (vergul bilan ajrating)</label>
                  <input
                    type="text"
                    placeholder="Python, Git, Asyncio, Docker"
                    value={newEmp.skills}
                    onChange={(e) => setNewEmp({...newEmp, skills: e.target.value})}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-750 font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg"
                  >
                    Ro'yxatga qo'shish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Directory Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-12 text-center text-slate-400">
            <Search size={36} className="mx-auto text-slate-600 mb-3" />
            <p className="text-sm">Hech qanday xodim topilmadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((emp) => {
              const kpiObj = getKpiRating(emp.kpi);
              const isSelected = selectedEmployeeId === emp.id;
              
              return (
                <motion.div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  whileHover={{ scale: 1.01 }}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20" 
                      : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-emerald-400 border border-slate-800">
                        {emp.id}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{emp.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{emp.username}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(emp.status)}`}>
                      🟢 {emp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-slate-850/60 py-3 my-3 text-[11px] font-sans">
                    <div>
                      <span className="text-slate-500 block">LAVOZIM:</span>
                      <span className="text-slate-300 font-medium">{emp.position}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GRADE:</span>
                      <span className="text-emerald-400 font-bold">{emp.grade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">BO'LIM:</span>
                      <span className="text-slate-300">{emp.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">MA'SUL RAHBARI:</span>
                      <span className="text-slate-300">{emp.manager}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">KPI:</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${kpiObj.color}`}>
                        {emp.kpi}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                        <span>Bonus:</span>
                        <span>+${emp.bonus}</span>
                      </div>
                      
                      {emp.warningCount > 0 && (
                        <div className="flex items-center gap-1 font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          <AlertOctagon size={10} />
                          <span>{emp.warningCount} W</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Interactive Control panel & Physical Card Generator */}
      <div className="space-y-6">
        
        {/* PHYSICAL ID CARD BADGE VISUALIZER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          
          <div className="w-full flex justify-between items-center mb-6">
            <span className="text-[10px] font-mono font-bold text-slate-500">WENTRIC RESIDENT ID</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/10">ACTIVE v1.0</span>
          </div>

          {/* Physical Badge Body */}
          <motion.div 
            key={selectedEmployee.id}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[260px] bg-slate-950 border border-slate-800 rounded-xl p-5 relative shadow-lg flex flex-col items-center"
          >
            {/* Logo/Header */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-black text-slate-950 font-mono">W</div>
              <span className="text-xs font-black tracking-widest text-white font-mono">WENTRIC</span>
            </div>

            {/* Avatar / Placeholder Illustration */}
            <div className="w-24 h-24 rounded-lg bg-radial from-slate-800 to-slate-900 border border-slate-800 flex flex-col items-center justify-center mb-4 relative overflow-hidden group">
              <span className="text-3xl font-black text-emerald-400 font-sans">{selectedEmployee.name.charAt(0)}</span>
              
              {/* Overlay with ID */}
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[9px] font-bold py-0.5 text-emerald-400 font-mono border-t border-slate-850">
                {selectedEmployee.id}
              </div>
            </div>

            {/* Name & Title */}
            <h4 className="text-sm font-bold text-white font-sans">{selectedEmployee.name}</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedEmployee.position}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedEmployee.username}</p>

            <div className="w-full border-t border-dashed border-slate-800 my-4"></div>

            {/* Metadata Fields on Card */}
            <div className="w-full grid grid-cols-2 gap-2 text-left text-[9px] font-sans mb-3">
              <div>
                <span className="text-slate-500 block">DEPT:</span>
                <span className="text-slate-300 font-semibold">{selectedEmployee.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block">GRADE:</span>
                <span className="text-emerald-400 font-bold">{selectedEmployee.grade}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ISSUED SANA:</span>
                <span className="text-slate-300 font-mono">{selectedEmployee.startDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">STATUS:</span>
                <span className="text-emerald-400 font-bold">{selectedEmployee.status}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="w-full mt-2 bg-white/5 py-1.5 px-3 rounded flex flex-col items-center justify-center border border-slate-900">
              <div className="flex gap-[1px] h-6 items-center w-full justify-center opacity-70">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 4, 1].map((w, i) => (
                  <div key={i} className="bg-slate-300 h-full" style={{ width: `${w}px` }}></div>
                ))}
              </div>
              <span className="text-[7px] text-slate-500 font-mono mt-1 tracking-widest">{selectedEmployee.id}*WCEMS*ID</span>
            </div>
          </motion.div>
        </div>

        {/* INTERACTIVE CONTROLS PANEL */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xodimlarni boshqarish paneli</h3>
            <span className="text-[10px] font-mono text-amber-500">{selectedEmployee.id}</span>
          </div>

          <div className="border-t border-slate-850 my-2"></div>

          {/* 1. STATUS CONTROLS */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">Tizimdagi holati (Status):</span>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(EmployeeStatus).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(selectedEmployee.id, st)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    selectedEmployee.status === st
                      ? "bg-emerald-500 text-slate-950 border-emerald-500"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* 2. WARNING CONTROLS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-medium">Ogohlantirish darajasi (Warning System):</span>
              <span className="text-[11px] font-bold font-mono text-rose-400">{selectedEmployee.warningCount} / 5</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                disabled={selectedEmployee.warningCount === 0}
                onClick={() => handleUpdateWarning(selectedEmployee.id, false)}
                className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-850 hover:border-slate-700 text-xs font-bold rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Kamaytirish
              </button>
              <button
                disabled={selectedEmployee.warningCount === 5}
                onClick={() => handleUpdateWarning(selectedEmployee.id, true)}
                className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-slate-950 text-xs font-bold rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                + Ogohlantirish
              </button>
            </div>

            {/* Warning consequences explanation */}
            {selectedEmployee.warningCount > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <AlertCircle size={10} /> Disiplinar Oqibatlar:
                </span>
                <p>
                  {selectedEmployee.warningCount === 1 && "⚠️ Warning 1: Og'zaki rasmiy ogohlantirish berildi."}
                  {selectedEmployee.warningCount === 2 && "⚠️ Warning 2: Yozma rasmiy ogohlantirish guruhga kiritildi."}
                  {selectedEmployee.warningCount === 3 && "📉 Warning 3: KPI avtomatik ravishda pasayadi."}
                  {selectedEmployee.warningCount === 4 && "🕒 Warning 4: 1 haftalik sinov (probation) joriy etildi."}
                  {selectedEmployee.warningCount === 5 && "❌ Warning 5: Mehnat shartnomasini bekor qilish ko'rib chiqilmoqda!"}
                </p>
              </div>
            )}
          </div>

          {/* 3. KPI SLIDER CONTROLS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-medium">KPI Baholash (Hozirgi chorak):</span>
              <span className="text-[11px] font-bold font-mono text-emerald-400">{selectedEmployee.kpi}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={selectedEmployee.kpi}
              onChange={(e) => handleUpdateKpi(selectedEmployee.id, Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0% PIP</span>
              <span>70% GOOD</span>
              <span>85% EXCELLENT</span>
              <span>95% STAR</span>
            </div>
          </div>

          {/* 4. BONUS CONTROLS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-medium">Moliyaviy Bonuslar:</span>
              <span className="text-[11px] font-bold font-mono text-amber-400">+${selectedEmployee.bonus}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[-100, -50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleUpdateBonus(selectedEmployee.id, amt)}
                  className="py-1 bg-slate-950 hover:bg-slate-850 text-[10px] font-mono text-slate-300 rounded border border-slate-850 hover:border-slate-700 transition-colors"
                >
                  {amt > 0 ? `+$${amt}` : `-$${Math.abs(amt)}`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. OKR INFORMATION AND SKILLS */}
          <div className="pt-2 border-t border-slate-850 text-xs space-y-3">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">CHORAK OKR REJASI:</span>
              <p className="text-slate-300 leading-relaxed font-sans mt-1 text-[11px]">{selectedEmployee.okr}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase mb-1.5">XODIM SKILLSET:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployee.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-850 text-[10px] font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
