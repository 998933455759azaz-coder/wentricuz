import React, { useState } from "react";
import { Employee, EmployeeStatus, ChatMessage } from "../types";
import { 
  Send, Bot, AlertTriangle, ShieldCheck, Database, RefreshCw, 
  Sparkles, ShieldAlert, Cpu, Terminal, List, Download, FileText, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export default function BotSimulatorTab({ employees, setEmployees }: Props) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      senderName: "Sardorbek Rakhmonov",
      senderUsername: "@sardor_ceo",
      senderId: "CEO-001",
      text: "Hamma guruhga kirdimi? Bugun backend integratsiyasi bo'yicha yakuniy testlarni boshlashimiz kerak.",
      timestamp: "10:15",
      isUnregistered: false
    },
    {
      id: "m2",
      senderName: "Javoxirjon To'rayev",
      senderUsername: "@javoxir_cto",
      senderId: "CTO-002",
      text: "Ha, Sardorbek. @hasanov_ilyos backend bot kodini va SQLite bazasi modelini tayyorladi. Hozir batafsil ma'lumot beradi.",
      timestamp: "10:17",
      isUnregistered: false
    },
    {
      id: "m3",
      senderName: "Hasanov Ilyos",
      senderUsername: "@hasanov_ilyos",
      senderId: "DEV-004",
      text: "Assalomu alaykum! Bot to'liq tayyor. SQLite bazasida barcha xodimlar IDlari saqlanadi. Guruhga IDsiz yozganlar darhol aniqlanadi.",
      timestamp: "10:18",
      isUnregistered: false
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedSenderType, setSelectedSenderType] = useState<"DEV-004" | "CEO-001" | "UNREGISTERED">("DEV-004");
  
  // Custom unregistered name
  const [unregName, setUnregName] = useState("Begona Shaxs");
  const [unregUsername, setUnregUsername] = useState("@intruder_x");

  // AI analysis state
  const [aiReport, setAiReport] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // DB Browser table view state
  const [dbTable, setDbTable] = useState<"employees" | "warning_logs" | "chat_logs">("employees");

  // Function to send simulated message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    let senderName = "";
    let senderUsername = "";
    let senderId: string | undefined = undefined;
    let isUnregistered = false;

    if (selectedSenderType === "CEO-001") {
      const emp = employees.find(x => x.id === "CEO-001")!;
      senderName = emp.name;
      senderUsername = emp.username;
      senderId = emp.id;
    } else if (selectedSenderType === "DEV-004") {
      const emp = employees.find(x => x.id === "DEV-004")!;
      senderName = emp.name;
      senderUsername = emp.username;
      senderId = emp.id;
    } else {
      senderName = unregName;
      senderUsername = unregUsername.startsWith("@") ? unregUsername : `@${unregUsername}`;
      isUnregistered = true;
    }

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderName,
      senderUsername,
      senderId,
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUnregistered
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage("");

    // Automatically trigger Bot intercept response after 1 second
    setTimeout(() => {
      triggerBotResponse(newMsg);
    }, 800);
  };

  // Bot response generator logic
  const triggerBotResponse = (userMsg: ChatMessage) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 1. Unregistered User Intercept Rule
    if (userMsg.isUnregistered) {
      const botAlert: ChatMessage = {
        id: `bot_${Date.now()}`,
        senderName: "Wentric Employee Bot",
        senderUsername: "@WentricEmployeeBot",
        text: `⚠️ SHAXS TASDIQLANMADI!
Foydalanuvchi: ${userMsg.senderName} (${userMsg.senderUsername}) Wentric xodimlar bazasidan topilmadi!

🚨 Tizimda faol 'Wentric Resident Card' mavjud emas. Xavfsizlik bo'yicha guruhni 30 soniyada tark etishingiz so'raladi.
Adminlar tasdiqlashi (Approve) kutilmoqda. Aks holda bot orqali avtomatik chiqarib yuborilasiz (Kick/Mute).`,
        timestamp,
        isUnregistered: false
      };
      setChatMessages(prev => [...prev, botAlert]);
      return;
    }

    // 2. Commands simulator
    const txt = userMsg.text.trim();
    if (txt.startsWith("/")) {
      const parts = txt.split(" ");
      const cmd = parts[0].toLowerCase();

      let botReplyText = "";

      if (cmd === "/start") {
        botReplyText = `👋 Wentric Employee Management System Bot v1.0 faol holatda.
Guruh monitoringi yoqilgan. Ma'lumotlar bazasi: SQLite3 (wentric_employees.db).`;
      } else if (cmd === "/check") {
        botReplyText = `🔍 Barcha resident xodimlar tekshirildi. Jami guruhda 4 ta tasdiqlangan xodim va 1 ta noma'lum faoliyat aniqlandi.`;
      } else if (cmd === "/status") {
        botReplyText = `📊 Wentric Server Status:
🟢 Active Uptime: 14 kundan beri faol
🗄 SQLite3: 7.2 KB (OK)
🤖 AI Engine: Gemini 3.5 Flash tayyor
👥 Tasdiqlangan resident xodimlar: ${employees.length} ta`;
      } else if (cmd === "/pdf") {
        botReplyText = `📄 Haftalik KPI va Davomat hisoboti PDF formatda generatsiya qilindi va yuborishga tayyorlandi! [Yuklab olish uchun Admin Panelga o'ting]`;
      } else if (cmd === "/warn") {
        const target = parts[1] || "@hasanov_ilyos";
        const reason = parts.slice(2).join(" ") || "Etika qoidalari buzilishi";
        
        // Find employee
        const targetEmp = employees.find(e => e.username.toLowerCase() === target.toLowerCase());
        if (targetEmp) {
          botReplyText = `🚨 OGOHLANTIRISH (Warn) yuborildi!
Target: ${targetEmp.name} (${target})
Daraja: ${targetEmp.warningCount + 1}/5
Sababi: ${reason}
Tizim oqibati: KPI 5 ballga kamayadi va ogohlantirish saqlanadi.`;
          
          // Apply changes to the shared state
          setEmployees(prev => prev.map(e => {
            if (e.id === targetEmp.id) {
              const newWarn = Math.min(5, e.warningCount + 1);
              return { 
                ...e, 
                warningCount: newWarn,
                kpi: Math.max(0, e.kpi - 5),
                status: newWarn === 5 ? EmployeeStatus.FIRED : e.status
              };
            }
            return e;
          }));
        } else {
          botReplyText = `❌ Xatolik: Foydalanuvchi '${target}' topilmadi!`;
        }
      } else {
        botReplyText = `🤖 Wentric Bot: Noma'lum buyruq. Buyruqlar: /start, /check, /status, /pdf, /warn @username.`;
      }

      const botReply: ChatMessage = {
        id: `bot_${Date.now()}`,
        senderName: "Wentric Employee Bot",
        senderUsername: "@WentricEmployeeBot",
        text: botReplyText,
        timestamp,
        isUnregistered: false
      };
      setChatMessages(prev => [...prev, botReply]);
    }
  };

  // Call the real Express API with Gemini API inside
  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiReport("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages })
      });
      const data = await response.json();
      if (data.report) {
        setAiReport(data.report);
      } else if (data.error) {
        setAiReport(`Xatolik: ${data.error}`);
      }
    } catch (err: any) {
      setAiReport(`Server integratsiya xatosi: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Approve unregistered user and add them to the database
  const handleApproveUnregistered = (msg: ChatMessage) => {
    // Generate simple ID
    const randomId = `DEV-${Math.floor(100 + Math.random() * 900)}`;
    const newEmployee: Employee = {
      id: randomId,
      name: msg.senderName,
      username: msg.senderUsername,
      position: "Resident Intern",
      grade: "G7",
      department: "Engineering",
      team: "Backend Team",
      manager: "CTO",
      startDate: new Date().toISOString().split("T")[0],
      status: EmployeeStatus.ONLINE,
      kpi: 100,
      okr: "Onboarding tugatish, guruhga integratsiya bo'lish.",
      bonus: 0,
      warningCount: 0,
      vacationDays: 12,
      skills: ["Git", "Python fundamentals"],
      certificates: [],
      completedProjects: [],
      permissions: ["View Platform"]
    };

    setEmployees(prev => [newEmployee, ...prev]);
    
    // Add success message in chat
    const systemSuccess: ChatMessage = {
      id: `sys_${Date.now()}`,
      senderName: "Wentric Employee Bot",
      senderUsername: "@WentricEmployeeBot",
      text: `✅ RUXSAT BERILDI!
Foydalanuvchi ${msg.senderName} (${msg.senderUsername}) adminlar tomonidan tasdiqlandi.
Yangi xodim ID: ${randomId} kodi bilan ma'lumotlar bazasiga (SQLite3) saqlandi. Xush kelibsiz!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUnregistered: false
    };
    setChatMessages(prev => [...prev, systemSuccess]);
  };

  // Kick unregistered
  const handleKickUnregistered = (msg: ChatMessage) => {
    const systemKick: ChatMessage = {
      id: `sys_${Date.now()}`,
      senderName: "Wentric Employee Bot",
      senderUsername: "@WentricEmployeeBot",
      text: `❌ KICK QILINDI!
Foydalanuvchi ${msg.senderName} (${msg.senderUsername}) resident emasligi sababli guruhdan chiqarildi!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUnregistered: false
    };
    setChatMessages(prev => [...prev, systemKick]);
  };

  return (
    <div id="bot-simulator-tab-container" className="space-y-6">
      
      {/* Grid: Simulator & Control panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Simulator Pane (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[580px] shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Wentric Corporation (Guruh Chat) <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">🤖 Wentric Employee Bot monitoringi faol</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1 border border-slate-800 rounded-lg">
              <Database size={12} className="text-emerald-400" /> sqlite3: ONLINE
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/25">
            {chatMessages.map((msg) => {
              const isBot = msg.senderUsername === "@WentricEmployeeBot";
              
              return (
                <div key={msg.id} className={`flex flex-col ${isBot ? "items-center" : "items-start"}`}>
                  
                  {/* Message Bubble wrapper */}
                  <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                    isBot 
                      ? "bg-slate-900 border border-indigo-500/20 text-indigo-100 shadow-md shadow-indigo-500/2" 
                      : msg.isUnregistered
                        ? "bg-slate-900/60 border border-rose-500/30 text-rose-100"
                        : "bg-slate-900/40 border border-slate-800/80 text-slate-100"
                  }`}>
                    
                    {/* Username line */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${isBot ? "text-indigo-400" : "text-emerald-400"}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.senderUsername}</span>
                      {msg.senderId && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-850">
                          {msg.senderId}
                        </span>
                      )}
                    </div>

                    {/* Text Body */}
                    <p className="text-xs whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>

                    {/* Interactive quick action buttons if unregistered warning is active */}
                    {isBot && msg.text.includes("SHAXS TASDIQLANMADI") && (
                      <div className="mt-3 pt-3 border-t border-slate-850 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleApproveUnregistered(chatMessages[chatMessages.length - 2])}
                          className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                          Approve (Resident Card berish)
                        </button>
                        <button
                          onClick={() => handleKickUnregistered(chatMessages[chatMessages.length - 2])}
                          className="px-2.5 py-1 rounded bg-rose-500 text-slate-950 text-[10px] font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          Kick (Chiqarish)
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-slate-600 font-mono mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}
          </div>

          {/* Chat input controls */}
          <div className="bg-slate-950 p-3.5 border-t border-slate-850 space-y-3">
            
            {/* Sender Selection */}
            <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900/50 p-2 rounded-xl border border-slate-850">
              <span className="text-slate-400 font-medium">Xabar yozuvchi shaxs:</span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSenderType("DEV-004")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    selectedSenderType === "DEV-004" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400"
                  }`}
                >
                  DEV-004 (Ilyos)
                </button>
                <button
                  onClick={() => setSelectedSenderType("CEO-001")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    selectedSenderType === "CEO-001" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400"
                  }`}
                >
                  CEO-001 (Sardor)
                </button>
                <button
                  onClick={() => setSelectedSenderType("UNREGISTERED")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    selectedSenderType === "UNREGISTERED" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400"
                  }`}
                >
                  IDsiz Begona Shaxs
                </button>
              </div>
            </div>

            {/* Custom Unregistered identity inputs */}
            {selectedSenderType === "UNREGISTERED" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-3 p-2 bg-rose-950/10 border border-rose-950/25 rounded-xl text-[11px]"
              >
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">IDsiz Ismi:</label>
                  <input
                    type="text"
                    value={unregName}
                    onChange={(e) => setUnregName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-rose-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">IDsiz Username:</label>
                  <input
                    type="text"
                    value={unregUsername}
                    onChange={(e) => setUnregUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-rose-200 text-xs focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Main Form input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Guruhga xabar yozing (Masalan: /status, /pdf, /check yoki oddiy xabar)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* AI Analyzer Controller & Quick Commands */}
        <div className="space-y-6">
          
          {/* AI Log Analyzer Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={18} />
              <h3 className="text-sm font-bold text-white">AI Group Chat Analyzer</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Bot guruhdagi barcha suhbatlar tarixini SQLite'da to'playdi. Sun'iy intellekt (Gemini 3.5 Flash) loglarni tahlil qilib, 1 kunlik va 1 haftalik kpi hamda xavfsizlik xulosasini generatsiya qiladi.
            </p>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="animate-spin" size={14} /> AI loglarni tahlil qilmoqda...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Gemini AI orqali Tahlil Qilish
                </>
              )}
            </button>

            {/* Quick simulated command buttons */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2 font-mono">⚙️ KO'P ISHLATILADIGAN BUYRUQLAR:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button
                  onClick={() => { setInputMessage("/status"); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded border border-slate-850 text-slate-300 text-left flex items-center gap-1 transition-colors"
                >
                  <Cpu size={10} /> /status
                </button>
                <button
                  onClick={() => { setInputMessage("/check"); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded border border-slate-850 text-slate-300 text-left flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck size={10} /> /check
                </button>
                <button
                  onClick={() => { setInputMessage("/pdf"); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded border border-slate-850 text-slate-300 text-left flex items-center gap-1 transition-colors"
                >
                  <FileText size={10} /> /pdf
                </button>
                <button
                  onClick={() => { setInputMessage("/warn @hasanov_ilyos Xatolar bo'yicha ogohlantirish"); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded border border-slate-850 text-slate-300 text-left flex items-center gap-1 transition-colors"
                >
                  <ShieldAlert size={10} /> /warn @username
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel: Real-time report from Gemini AI */}
      <AnimatePresence>
        {aiReport && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400" size={18} />
                <h4 className="text-sm font-bold text-slate-100 font-mono">GEMINI AI TAHLILIY HISOBOTI</h4>
              </div>
              <button 
                onClick={() => setAiReport("")}
                className="p-1 hover:bg-slate-850 rounded text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Render response output as pre-wrap markdown styled text */}
            <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-3 whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-2">
              {aiReport}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SQLITE DATABASE BROWSER (Simulated) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-850 pb-4">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">SQLite3 Baza Haqiqiy Vaqtidagi Simulyatori</h3>
              <p className="text-[10px] text-slate-500 font-mono">wentric_employees.db jadvallari ko'rinishi</p>
            </div>
          </div>

          {/* Table select toggle */}
          <div className="flex gap-2">
            {["employees", "warning_logs", "chat_logs"].map((tbl) => (
              <button
                key={tbl}
                onClick={() => setDbTable(tbl as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                  dbTable === tbl 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                {tbl === "employees" && "employees (Xodimlar)"}
                {tbl === "warning_logs" && "warning_logs (Warn loglar)"}
                {tbl === "chat_logs" && "chat_logs (AI tahlil logs)"}
              </button>
            ))}
          </div>
        </div>

        {/* Database table content renderer */}
        <div className="overflow-x-auto">
          {dbTable === "employees" && (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
                  <th className="py-2.5 px-3">id (PK)</th>
                  <th className="py-2.5 px-3">name</th>
                  <th className="py-2.5 px-3">username</th>
                  <th className="py-2.5 px-3">position</th>
                  <th className="py-2.5 px-3">kpi</th>
                  <th className="py-2.5 px-3">warnings</th>
                  <th className="py-2.5 px-3">bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/10">
                    <td className="py-2 px-3 text-emerald-400 font-bold">{e.id}</td>
                    <td className="py-2 px-3 text-slate-200">{e.name}</td>
                    <td className="py-2 px-3">{e.username}</td>
                    <td className="py-2 px-3 text-slate-400">{e.position}</td>
                    <td className="py-2 px-3">{e.kpi}%</td>
                    <td className="py-2 px-3 text-rose-400 font-bold">{e.warningCount}</td>
                    <td className="py-2 px-3 text-amber-400">${e.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {dbTable === "warning_logs" && (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
                  <th className="py-2.5 px-3">id (AI)</th>
                  <th className="py-2.5 px-3">timestamp</th>
                  <th className="py-2.5 px-3">username</th>
                  <th className="py-2.5 px-3">reason</th>
                  <th className="py-2.5 px-3">level</th>
                  <th className="py-2.5 px-3">issuer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                <tr>
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3 text-slate-500">{new Date().toISOString().split("T")[0]} 10:00</td>
                  <td className="py-2 px-3 text-emerald-400">@malika_coo</td>
                  <td className="py-2 px-3">Kunlik hisobot topshirilmagan</td>
                  <td className="py-2 px-3 font-bold text-rose-400">1</td>
                  <td className="py-2 px-3">System Admin</td>
                </tr>
                {employees.filter(e => e.warningCount > 0).map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    <td className="py-2 px-3">{idx + 2}</td>
                    <td className="py-2 px-3 text-slate-500">{new Date().toISOString().split("T")[0]} 11:24</td>
                    <td className="py-2 px-3 text-emerald-400">{e.username}</td>
                    <td className="py-2 px-3">Guruh qoidalari buzilishi (Simulyator)</td>
                    <td className="py-2 px-3 font-bold text-rose-400">{e.warningCount}</td>
                    <td className="py-2 px-3">CTO Office</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {dbTable === "chat_logs" && (
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400 p-3 bg-slate-950 border border-slate-850 rounded-xl max-h-[160px] overflow-y-auto">
              {chatMessages.map((msg, index) => (
                <div key={index} className="hover:bg-slate-900/40 py-0.5">
                  <span className="text-slate-600">[{msg.timestamp}]</span>{" "}
                  <span className="text-emerald-400">{msg.senderUsername || "system"}</span>:{" "}
                  <span className="text-slate-300">{msg.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
