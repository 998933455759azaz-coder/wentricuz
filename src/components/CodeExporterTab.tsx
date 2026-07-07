import React, { useState } from "react";
import { PYTHON_BOT_CODEBASE } from "../data";
import { 
  FileCode, Copy, Check, Download, AlertCircle, Play, 
  Terminal, ShieldCheck, HelpCircle, FileText, Settings, Database, BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CodeExporterTab() {
  const [selectedFile, setSelectedFile] = useState<string>("bot.py");
  const [copied, setCopied] = useState(false);

  const files = [
    { name: "bot.py", icon: FileCode, type: "Python entrypoint", content: PYTHON_BOT_CODEBASE.bot },
    { name: "database.py", icon: Database, type: "SQLite3 database layer", content: PYTHON_BOT_CODEBASE.database },
    { name: "gemini_analyzer.py", icon: BrainCircuit, type: "Gemini AI SDK client", content: PYTHON_BOT_CODEBASE.analyzer },
    { name: "pdf_generator.py", icon: FileText, type: "ReportLab PDF renderer", content: PYTHON_BOT_CODEBASE.pdf },
    { name: "config.py", icon: Settings, type: "Environment variables loaded", content: PYTHON_BOT_CODEBASE.env_example },
    { name: "requirements.txt", icon: FileText, type: "Library declarations", content: PYTHON_BOT_CODEBASE.requirements },
    { name: "README.md", icon: HelpCircle, type: "Installation guide", content: PYTHON_BOT_CODEBASE.readme }
  ];

  const currentFile = files.find(f => f.name === selectedFile) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to download current file
  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([currentFile.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = currentFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="code-exporter-container" className="space-y-6">
      
      {/* Alert Warning Box explaining GitHub push & local run */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-sans">GitHub va VPS Serverga O'rnatish Qo'llanmasi</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Bu yerdagi barcha fayllar **Python 3.11 / 3.12** hamda **Aiogram 3.x** versiyalariga to'liq mos ravishda professional yozilgan. Fayllarni ko'chirib (yoki yuklab) olib, o'z GitHub-ingizga push qiling va serverga tortib \`python bot.py\` orqali run qiling.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] font-mono text-emerald-400 font-bold uppercase">
            Aiogram 3.x
          </span>
          <span className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] font-mono text-emerald-400 font-bold uppercase">
            Python 3.12
          </span>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: File Explorer List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-3 px-1">📁 Fayllar Strukturasi (Codebase):</span>
          {files.map((f) => {
            const Icon = f.icon;
            const isSelected = f.name === selectedFile;
            
            return (
              <button
                key={f.name}
                onClick={() => setSelectedFile(f.name)}
                className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between group ${
                  isSelected 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-950/40 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isSelected ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-400"} />
                  <div className="text-left">
                    <span className="text-xs font-bold block font-mono">{f.name}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5 block">{f.type}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Code Viewer with syntax highlight layout */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[560px] shadow-2xl">
          
          {/* Header Controls */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode size={16} className="text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-200">{currentFile.name}</span>
              <span className="text-[9px] text-slate-500 font-mono">({currentFile.type})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" /> Ko'chirildi
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Koddan nusxa olish
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadFile}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download size={12} /> Yuklab Olish
              </button>
            </div>
          </div>

          {/* Code Viewer pane */}
          <div className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950">
            <pre className="whitespace-pre">{currentFile.content}</pre>
          </div>
        </div>
      </div>

      {/* Terminal run simulation block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">VPS Serverda ishga tushirish buyruqlari:</span>
        </div>
        
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-emerald-400 text-[11px] font-mono leading-relaxed">
          <div className="text-slate-500"># 1. Repozitoriyani serverga yuklash</div>
          <div>git clone https://github.com/yourusername/wentric-employee-bot.git</div>
          <div>cd wentric-employee-bot</div>
          <br />
          <div className="text-slate-500"># 2. Virtual muhitni faollashtirish va kutubxonalarni o'rnatish</div>
          <div>python3 -m venv venv</div>
          <div>source venv/bin/activate</div>
          <div>pip install -r requirements.txt</div>
          <br />
          <div className="text-slate-500"># 3. .env sozlamalarini kiritish va run qilish</div>
          <div>cp .env.example .env</div>
          <div>nano .env  <span className="text-slate-500"># Tokenlar va Gemini kalitini yozing</span></div>
          <div>python3 bot.py</div>
        </div>
      </div>
    </div>
  );
}
