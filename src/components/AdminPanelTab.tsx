import React, { useState } from "react";
import { Employee, EmployeeStatus } from "../types";
import { DISCORD_STRUCTURE, GRADES_LIST } from "../data";
import { 
  Server, Shield, Cpu, Terminal, Users, FileText, Download, Play, CheckCircle2, 
  Search, ShieldAlert, Award, Clock, DollarSign, BookOpen, Key, Wifi, Settings, Briefcase, ChevronRight, Activity, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export default function AdminPanelTab({ employees, setEmployees }: Props) {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<number>(0);
  
  // Audits log state
  const [auditLogs, setAuditLogs] = useState<string[]>([
    "System: WCEMS v1.0 engine launched on port 3000.",
    "Database: Connected to SQLite3 (wentric_employees.db).",
    "Security: CISO Alisher Sec set up ethical hacking scanning.",
    "System: Weekly PDF generator scheduler armed for Friday midnight.",
  ]);

  // IP whitelist state
  const [ipList, setIpList] = useState<string[]>(["182.20.10.4", "195.162.2.100"]);
  const [newIp, setNewIp] = useState("");

  // pending approvals
  const [pendingApprovals, setPendingApprovals] = useState([
    { name: "Sirojov Davron", username: "@davron_qa", position: "QA Engineer", department: "Engineering" },
    { name: "Azizova Nigora", username: "@nigora_seo", position: "SEO Specialist", department: "Marketing" }
  ]);

  // Daily reports search
  const [reportSearch, setReportSearch] = useState("");

  // Sop search term
  const [sopQuery, setSopQuery] = useState("");

  // SOC alert simulation
  const [socLogs, setSocLogs] = useState([
    { time: "11:04", alert: "Unauthorized access blocked on DEV-PORTAL", level: "Medium" },
    { time: "11:15", alert: "SQL injection payload filtered by WAF", level: "High" }
  ]);

  const addAuditLog = (msg: string) => {
    setAuditLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleBackupDb = () => {
    addAuditLog("Admin triggered SQL database dump download.");
    window.open("/api/db-backup", "_blank");
  };

  const handleApproveApplicant = (idx: number, name: string, username: string, pos: string, dept: string) => {
    const randomId = `${dept.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newEmp: Employee = {
      id: randomId,
      name,
      username,
      position: pos,
      grade: "G8",
      department: dept,
      team: `${dept} Team`,
      manager: "COO",
      startDate: new Date().toISOString().split("T")[0],
      status: EmployeeStatus.ONLINE,
      kpi: 90,
      okr: "Onboarding tugatish va birinchi sprintda qatnashish.",
      bonus: 0,
      warningCount: 0,
      vacationDays: 12,
      skills: ["Git", "Fundamentals"],
      certificates: [],
      completedProjects: [],
      permissions: ["View Platform"]
    };

    setEmployees(prev => [newEmp, ...prev]);
    setPendingApprovals(prev => prev.filter((_, i) => i !== idx));
    addAuditLog(`Applicant approved: ${name} (${username}) added as ${randomId}`);
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    setIpList(prev => [...prev, newIp]);
    addAuditLog(`New IP address whitelisted: ${newIp}`);
    setNewIp("");
  };

  // Mute simulation state
  const [mutes, setMutes] = useState<{username: string, duration: string}[]>([
    { username: "@intruder_x", duration: "24 soat" }
  ]);
  const [muteUser, setMuteUser] = useState("");

  const handleMute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muteUser) return;
    setMutes(prev => [...prev, { username: muteUser, duration: "24 soat" }]);
    addAuditLog(`User muted in chat: ${muteUser} for 24 hours.`);
    setMuteUser("");
  };

  // 20 systems metadata
  const systems = [
    { id: 0, title: "1. System Status Monitor", desc: "Server, xizmatlar va SQLite ishlash ko'rsatkichlari." },
    { id: 1, title: "2. Active/Inactive Employees", desc: "Xodimlarning onlayn yoki ta'tildagi holati tahlili." },
    { id: 2, title: "3. SQLite3 DB Backup", desc: "Zaxira nusxalarini (SQL script formatida) yuklash paneli." },
    { id: 3, title: "4. Promotion Tracker", desc: "KPI va ogohlantirishlar bo'yicha lavozim ko'tarilishi monitoringi." },
    { id: 4, title: "5. Warning Logs Browser", desc: "Guruhda va tizimda berilgan ogohlantirishlar arxivi." },
    { id: 5, title: "6. Daily Work Reports Console", desc: "Xodimlarning kunlik rejalar va hisobotlar paneli." },
    { id: 6, title: "7. Salary Payroll Preview", desc: "Maoshlar va bonuslar bo'yicha moliya hisob-kitoblari." },
    { id: 7, title: "8. Discord Channels Viewer", desc: "Rasmiy korporativ Discord server kanallar tuzilishi." },
    { id: 8, title: "9. Mute & Restrictions", desc: "Qoida buzganlarni chatda cheklash va taqiqlash boshqaruvi." },
    { id: 9, title: "10. Incident Response (SOC)", desc: "Axborot xavfsizligi va CISO kibertahdid ogohlantirishlari." },
    { id: 10, title: "11. Pending Approvals Queue", desc: "Yangi qo'shilayotgan xodimlarni tasdiqlash navbati." },
    { id: 11, title: "12. Weekly PDF Generator", desc: "Haftalik KPI va davomat bo'yicha PDF hisobot tayyorlash." },
    { id: 12, title: "13. Knowledge Base SOP", desc: "Standard Operating Procedures (SOP) yo'riqnomalar qidiruvi." },
    { id: 13, title: "14. NDAs & Contracts Tracker", desc: "Maxfiylik va ish shartnomalarining huquqiy holati." },
    { id: 14, title: "15. PMO Project Stats", desc: "Loyiha boshqaruvi va ularning status bo'yicha ulushi." },
    { id: 15, title: "16. Certifications Registry", desc: "Xodimlarning xalqaro va ichki sertifikatlari ro'yxati." },
    { id: 16, title: "17. IP Whitelisting Console", desc: "Kompaniya serverlariga ulanuvchi xavfsiz IP manzillar." },
    { id: 17, title: "18. Gemini AI Settings", desc: "Suhbat tahlilining AI parametrlari boshqaruvi." },
    { id: 18, title: "19. Database Diagnostics", desc: "SQLite integrity cheklari va diagnostik ma'lumotlari." },
    { id: 19, title: "20. Audit Logs Registry", desc: "Tizimdagi barcha amallarning xronologik xotira daftari." }
  ];

  return (
    <div id="admin-panel-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-slate-100 font-sans">
      
      {/* 20 Systems Vertical Sidebar Selector */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 max-h-[700px] overflow-y-auto">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-3 px-1">⚙️ 20 Xil Ma'muriy Tizimlar:</span>
        {systems.map((sys) => (
          <button
            key={sys.id}
            onClick={() => setActiveAdminSubTab(sys.id)}
            className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors flex flex-col ${
              activeAdminSubTab === sys.id 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-950/40 hover:text-slate-200"
            }`}
          >
            <span className="font-bold">{sys.title}</span>
            <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{sys.desc}</span>
          </button>
        ))}
      </div>

      {/* Main Panel Content Window (3 cols on large screen) */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[600px] shadow-2xl relative overflow-hidden">
        
        {/* Subtle glow background */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" /> 
              {systems[activeAdminSubTab].title}
            </h3>
            <span className="text-[10px] font-mono text-slate-500">WCEMS_SYSTEM_v1.0</span>
          </div>

          {/* DYNAMIC SUBTAB RENDERERS */}
          {activeAdminSubTab === 0 && (
            /* 1. System Status Monitor */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">SERVER PORT:</span>
                  <span className="text-white font-bold text-sm">3000 (Proxy)</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">DATABASE SIZE:</span>
                  <span className="text-emerald-400 font-bold text-sm">7.2 KB (SQLite)</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">GEMINI ENGINE:</span>
                  <span className="text-indigo-400 font-bold text-sm">v3.5-flash</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">WEB STATUS:</span>
                  <span className="text-emerald-400 font-bold text-sm">ONLINE</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850 space-y-2">
                <span className="font-bold text-slate-300 block">Sarlavha Diagnostikalari:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Node JS Uptime:</span> <span className="text-slate-200">99.98%</span></div>
                  <div className="flex justify-between"><span>Request Latency:</span> <span className="text-emerald-400">12ms</span></div>
                  <div className="flex justify-between"><span>CPU usage:</span> <span className="text-slate-200">1.4%</span></div>
                  <div className="flex justify-between"><span>Memory heap:</span> <span className="text-slate-200">32 MB / 512 MB</span></div>
                </div>
              </div>
            </div>
          )}

          {activeAdminSubTab === 1 && (
            /* 2. Active/Inactive Employees Analyzer */
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-emerald-400 font-bold text-lg block">{employees.filter(e => e.status === EmployeeStatus.ONLINE).length}</span>
                  <span className="text-[10px] text-slate-400">Online xodimlar</span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-amber-400 font-bold text-lg block">{employees.filter(e => e.status === EmployeeStatus.VACATION).length}</span>
                  <span className="text-[10px] text-slate-400">Ta'tilda bo'lganlar</span>
                </div>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <span className="text-rose-400 font-bold text-lg block">{employees.filter(e => e.status === EmployeeStatus.FIRED).length}</span>
                  <span className="text-[10px] text-slate-400">Bo'shatilgan xodimlar</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850">
                <span className="font-semibold text-slate-300 block mb-2">Hozirgi davomat statusi:</span>
                <div className="space-y-2 text-[11px]">
                  {employees.map(e => (
                    <div key={e.id} className="flex justify-between items-center py-1 border-b border-slate-900/40">
                      <span>{e.name} ({e.id})</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] ${e.status === EmployeeStatus.ONLINE ? "text-emerald-400 bg-emerald-500/10" : e.status === EmployeeStatus.VACATION ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeAdminSubTab === 2 && (
            /* 3. SQLite DB Backup Exporter */
            <div className="space-y-4 text-xs font-sans">
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-850 text-center space-y-3">
                <Terminal className="mx-auto text-emerald-400" size={32} />
                <h4 className="font-bold text-slate-200">wentric_employees.db Zaxiralash Tizimi</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm mx-auto">
                  SQLite ma'lumotlar bazasining barcha jadvallari va yozuvlarini SQL formatda export qilib oling. Ushbu faylni istalgan SQLite ma'lumotlar bazasi muhitida yuklab run qilishingiz mumkin.
                </p>
                <button
                  onClick={handleBackupDb}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} /> SQLite DB DUMP (.sql) Yuklab Olish
                </button>
              </div>
            </div>
          )}

          {activeAdminSubTab === 3 && (
            /* 4. Promotion Tracker */
            <div className="space-y-4 text-xs font-sans">
              <span className="text-slate-400 block text-[11px] mb-3">
                Promotion shartlari: **KPI &gt; 90**, **0 ta Warning**, **Kamida 6 oy ishlagan** (startDate 2026 dan oldin).
              </span>

              <div className="space-y-3">
                {employees.map(e => {
                  const hasGoodKpi = e.kpi >= 90;
                  const hasNoWarning = e.warningCount === 0;
                  // simple check
                  const isEligible = hasGoodKpi && hasNoWarning;

                  return (
                    <div key={e.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200">{e.name} <span className="text-[10px] text-emerald-400 font-mono">({e.grade})</span></h4>
                        <p className="text-[10px] text-slate-400">{e.position}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-[10px] space-y-0.5">
                          <div>KPI: <span className={hasGoodKpi ? "text-emerald-400 font-bold" : "text-rose-400"}>{e.kpi}%</span></div>
                          <div>Warn: <span className={hasNoWarning ? "text-emerald-400" : "text-rose-400 font-bold"}>{e.warningCount}</span></div>
                        </div>

                        {isEligible ? (
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                            ELIGIBLE (Loyiq)
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-900 text-slate-500 text-[10px]">
                            Not Eligible
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeAdminSubTab === 4 && (
            /* 5. Warning Logs Browser */
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <span className="text-rose-400 font-bold block">[ID-001] {new Date().toISOString().split("T")[0]} 10:00</span>
                <p className="text-slate-300">Foydalanuvchi: @malika_coo | Daraja: 1/5 | Sababi: Kunlik hisobot topshirilmagan | Beruvchi: System Admin</p>
              </div>

              {employees.filter(e => e.warningCount > 0).map((e, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-rose-400 font-bold block">[ID-00{idx + 2}] {new Date().toISOString().split("T")[0]} 11:24</span>
                  <p className="text-slate-300">Foydalanuvchi: {e.username} | Daraja: {e.warningCount}/5 | Sababi: Guruh xavfsizligi va qoidalarini buzish | Beruvchi: CTO Office</p>
                </div>
              ))}
            </div>
          )}

          {activeAdminSubTab === 5 && (
            /* 6. Daily Work Reports Console */
            <div className="space-y-4 text-xs font-sans">
              <input
                type="text"
                placeholder="Xodim bo'yicha hisobotlarni qidirish..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
              />

              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Hasanov Ilyos (@hasanov_ilyos)</span>
                    <span className="text-slate-500 font-mono text-[10px]">Bugun 18:00</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    **Bugun nima qilindi**: Guruh nazoratchi botining SQLite bazasini, `/warn` va resident card checklarini ulab yakunladim.<br/>
                    **Ertaga reja**: Gemini AI API tahlil loglarini optimallashtirish va token limits monitoringi.<br/>
                    **Muammolar**: Yo'q. Sarflangan vaqt: 6 soat.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Bekzod Shukurov (@bekzod_support)</span>
                    <span className="text-slate-500 font-mono text-[10px]">Bugun 17:30</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    **Bugun nima qilindi**: Support portalida kelib tushgan jami 12 ta ticketlarni yopdim. KPI 97% ga yetkazildi.<br/>
                    **Ertaga reja**: Tez-tez beriladigan savollar FAQ bot yangilanishlarini ko'rib chiqish.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeAdminSubTab === 6 && (
            /* 7. Salary Payroll Preview */
            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px]">JAMI OYLIK PAYROLL:</span>
                  <span className="text-white text-lg font-bold font-mono">$48,200 / oy</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TARQATILGAN BONUSLAR:</span>
                  <span className="text-amber-400 text-lg font-bold font-mono">
                    ${employees.reduce((acc, curr) => acc + curr.bonus, 0)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">F.I.Sh</th>
                      <th className="py-2 px-3">Grade</th>
                      <th className="py-2 px-3">Tavsiyaviy Oylik</th>
                      <th className="py-2 px-3">Olingan Bonus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {employees.map(e => (
                      <tr key={e.id}>
                        <td className="py-1.5 px-3">{e.id}</td>
                        <td className="py-1.5 px-3 text-white">{e.name}</td>
                        <td className="py-1.5 px-3 text-emerald-400">{e.grade}</td>
                        <td className="py-1.5 px-3 font-semibold">$3,500 – $6,000</td>
                        <td className="py-1.5 px-3 text-amber-400">+${e.bonus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeAdminSubTab === 7 && (
            /* 8. Discord Channels Viewer */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {DISCORD_STRUCTURE.map((cat, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 font-bold block mb-1.5">{cat.category}</span>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    {cat.channels.map((ch, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <span className="text-slate-600">#</span>
                        <span>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAdminSubTab === 8 && (
            /* 9. Mute & Restrictions */
            <div className="space-y-4 text-xs font-sans">
              <form onSubmit={handleMute} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mute qiladigan username (masalan @intruder_x)..."
                  value={muteUser}
                  onChange={(e) => setMuteUser(e.target.value)}
                  className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-lg cursor-pointer">
                  Mute Berish
                </button>
              </form>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <span className="font-bold text-slate-300 block">Muted bo'lganlar ro'yxati (Simulyatsiya):</span>
                {mutes.map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-1 font-mono text-[11px]">
                    <span className="text-rose-400 font-bold">{m.username}</span>
                    <span className="text-slate-500">Mute duration: {m.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAdminSubTab === 9 && (
            /* 10. Incident Response (SOC) */
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block">SECURITY LEVEL:</span>
                  <span className="text-emerald-400 font-bold text-sm">SECURE (Yashil)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">THREAT SCANS:</span>
                  <span className="text-white font-bold text-sm">0 faol kibertahdid</span>
                </div>
              </div>

              <div className="space-y-2 text-[11px]">
                {socLogs.map((log, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex justify-between">
                    <span className="text-rose-400 font-bold">[{log.time}] {log.alert}</span>
                    <span className="text-slate-500">Severity: {log.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAdminSubTab === 10 && (
            /* 11. Pending Approvals Queue */
            <div className="space-y-3 text-xs font-sans">
              {pendingApprovals.length === 0 ? (
                <div className="p-6 bg-slate-950/40 text-center rounded-xl border border-dashed border-slate-850 text-slate-500">
                  Hozirda yangi arizachilar yo'q.
                </div>
              ) : (
                pendingApprovals.map((app, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-200">{app.name} <span className="font-mono text-slate-500">({app.username})</span></h4>
                      <p className="text-[10px] text-slate-400">{app.position} - {app.department}</p>
                    </div>

                    <button
                      onClick={() => handleApproveApplicant(idx, app.name, app.username, app.position, app.department)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Resident ID berish (Approve)
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeAdminSubTab === 11 && (
            /* 12. Weekly PDF Generator */
            <div className="space-y-4 text-xs font-sans text-center">
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                <FileText size={32} className="mx-auto text-emerald-400" />
                <h4 className="font-bold text-white">Haftalik KPI va Davomat PDF Hisoboti</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Barcha xodimlarning choraklik KPI ko'rsatkichlari, warninglar soni va ishtirok etayotgan loyihalarini o'z ichiga olgan chiroyli korporativ PDF hujjatni yaratib yuboring.
                </p>
                <button
                  onClick={() => {
                    addAuditLog("Admin triggered weekly PDF report generation.");
                    alert("PDF hisoboti muvaffaqiyatli generatsiya qilindi va o'zbek tilida admin elektron pochtasiga yuborildi!");
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Play size={12} /> PDF Generatsiya Qilish va Yuborish
                </button>
              </div>
            </div>
          )}

          {activeAdminSubTab === 12 && (
            /* 13. Knowledge Base SOP */
            <div className="space-y-3 text-xs font-sans">
              <input
                type="text"
                placeholder="SOP hujjatlarni kalit so'z orqali qidirish..."
                value={sopQuery}
                onChange={(e) => setSopQuery(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg"
              />

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="font-bold text-slate-200">SOP-01: Kunlik hisobotlar formati (Daily Standup)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Har bir xodim o'z ish kunining oxirida (soat 18:00 gacha) Discord-dagi #daily-reports kanaliga quyidagi formatda hisobot topshiradi: Bugun nima qildim, Ertaga nima qilaman, Qanday muammolar bor.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="font-bold text-slate-200">SOP-02: Guruh xavfsizligi va ID nazorati qoidalari</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Kompaniya chatiga qo'shilgan har qandayIDsiz begonalar 30 soniya ichida adminlar tomonidan tasdiqlanishi kerak. Tasdiqlanmagan holda guruhda yozish qat'iyan taqiqlanadi.
                </p>
              </div>
            </div>
          )}

          {activeAdminSubTab === 13 && (
            /* 14. NDAs & Contracts Tracker */
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                <span>[CONTRACT] Hasanov Ilyos - Employment NDA</span>
                <span className="text-emerald-400 font-bold">SIGNED (Imzolangan)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                <span>[CONTRACT] Sardorbek Rakhmonov - Executive Agreement</span>
                <span className="text-emerald-400 font-bold">SIGNED (Imzolangan)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                <span>[CONTRACT] Sirojov Davron - Pending NDA</span>
                <span className="text-amber-500">PENDING (Kutilmoqda)</span>
              </div>
            </div>
          )}

          {activeAdminSubTab === 14 && (
            /* 15. PMO Project Stats */
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">LOVIHALARNING KPI ULUSHI:</span>
                  <span className="text-white font-bold font-mono">30% Task Completion</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">KPI CHORAK BAHOLASH:</span>
                  <span className="text-emerald-400 font-bold">Outstanding (&gt;95%)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between"><span>Planning:</span> <span className="text-slate-400 font-mono">1 loyiha</span></div>
                <div className="flex justify-between"><span>In Progress:</span> <span className="text-amber-400 font-mono font-bold">1 loyiha</span></div>
                <div className="flex justify-between"><span>Staging / Review:</span> <span className="text-slate-400 font-mono">1 loyiha</span></div>
                <div className="flex justify-between"><span>Production:</span> <span className="text-emerald-400 font-mono font-bold">1 loyiha</span></div>
              </div>
            </div>
          )}

          {activeAdminSubTab === 15 && (
            /* 16. Certifications Registry */
            <div className="space-y-3 text-xs font-sans">
              {employees.map(e => (
                <div key={e.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-200">{e.name}</h4>
                    <span className="text-[10px] text-slate-400">{e.position}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {e.certificates.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono border border-emerald-500/20">
                        {c}
                      </span>
                    ))}
                    {e.certificates.length === 0 && <span className="text-slate-600 font-mono">Hech qanday</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeAdminSubTab === 16 && (
            /* 17. IP Whitelisting Console */
            <div className="space-y-4 text-xs font-mono">
              <form onSubmit={handleAddIp} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Yangi whitelist IP manzil (masalan 195.10.2.10)..."
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                />
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg cursor-pointer">
                  Whitelisting
                </button>
              </form>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <span className="text-slate-400 block text-[10px]">XAVFSIZ IP MANZILLAR WHITELISTI:</span>
                {ipList.map((ip, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-900/40">
                    <span className="text-slate-200">{ip}</span>
                    <span className="text-emerald-400 font-bold">Whitelisted</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAdminSubTab === 17 && (
            /* 18. Gemini AI Settings */
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <span className="font-bold text-slate-200 block">Gemini 3.5 Flash Model Configs:</span>
                
                <div className="space-y-2 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Default Model:</span> <span className="text-slate-200">gemini-3.5-flash</span></div>
                  <div className="flex justify-between"><span>Temperature:</span> <span className="text-slate-200">1.0</span></div>
                  <div className="flex justify-between"><span>Top P:</span> <span className="text-slate-200">0.95</span></div>
                  <div className="flex justify-between"><span>System Prompt size:</span> <span className="text-indigo-400 font-bold">1200 chars</span></div>
                </div>
              </div>
            </div>
          )}

          {activeAdminSubTab === 18 && (
            /* 19. Database Diagnostics */
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 block flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> SQLite Integrity Check: PASS (Tog'ri)
                </span>
                
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Database Engine:</span> <span>SQLite v3.41</span></div>
                  <div className="flex justify-between"><span>Foreign Keys:</span> <span className="text-slate-250">ON</span></div>
                  <div className="flex justify-between"><span>Connected Pools:</span> <span>1 faol</span></div>
                  <div className="flex justify-between"><span>Total Indexes:</span> <span>3 indexes</span></div>
                </div>
              </div>
            </div>
          )}

          {activeAdminSubTab === 19 && (
            /* 20. Audit Logs Registry */
            <div className="space-y-2 text-[11px] font-mono text-slate-400 max-h-[300px] overflow-y-auto bg-slate-950 p-4 border border-slate-850 rounded-xl">
              {auditLogs.map((log, index) => (
                <div key={index} className="hover:text-emerald-400 py-0.5">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info showing status */}
        <div className="pt-4 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-3">
          <span>Administrator: {employees.find(e => e.id === "CEO-001")?.name}</span>
          <span className="flex items-center gap-1"><Wifi size={12} className="text-emerald-400" /> Secure SSL Connection (AES-256)</span>
        </div>
      </div>
    </div>
  );
}
