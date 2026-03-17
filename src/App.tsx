import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Shield, 
  Github, 
  BookOpen, 
  Wrench, 
  AlertTriangle, 
  Copy, 
  Check,
  Cpu,
  ExternalLink,
  ChevronRight,
  Loader2,
  Bug,
  History,
  Cloud,
  Trash2,
  Zap,
  Target,
  Code,
  Layers,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Info,
  Users,
  Flag,
  Globe,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { queryVayu } from './services/geminiService';
import { VayuResponse } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUGGESTIONS = [
  "analyze wordpress security",
  "generate xss payloads for search bar",
  "scan open ports for target.com",
  "discover exposed backups",
  "bug bounty plan for api.example.com",
  "recon workflow for cloud assets"
];

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VayuResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isPuterReady, setIsPuterReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recon' | 'payloads' | 'intel' | 'report'>('all');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize Puter and load history
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const initPuter = async () => {
      const p = (window as any).puter;
      
      if (!p) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initPuter, 500);
          return;
        }
        console.warn("Puter.js not found after retries");
        loadLocalHistory();
        return;
      }

      try {
        const savedHistory = await p.kv.get('vayu_history');
        if (savedHistory) {
          try {
            setHistory(typeof savedHistory === 'string' ? JSON.parse(savedHistory) : savedHistory);
          } catch (e) {
            console.error("Failed to parse history from Puter KV:", e);
            loadLocalHistory();
          }
        } else {
          loadLocalHistory();
        }
        setIsPuterReady(true);
      } catch (err) {
        console.error("Puter.js KV access failed:", err);
        loadLocalHistory();
      }
    };

    const loadLocalHistory = () => {
      try {
        const localHistory = localStorage.getItem('vayu_history');
        if (localHistory) setHistory(JSON.parse(localHistory));
      } catch (e) {
        console.error("Failed to load local history:", e);
      }
    };

    initPuter();
  }, []);

  const saveToHistory = async (newQuery: string) => {
    const updatedHistory = [newQuery, ...history.filter(h => h !== newQuery)].slice(0, 10);
    setHistory(updatedHistory);
    try {
      const p = (window as any).puter;
      if (p) await p.kv.set('vayu_history', JSON.stringify(updatedHistory));
    } catch (err) {
      localStorage.setItem('vayu_history', JSON.stringify(updatedHistory));
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      const p = (window as any).puter;
      if (p) await p.kv.del('vayu_history');
    } catch (err) {
      localStorage.removeItem('vayu_history');
    }
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await queryVayu(activeQuery);
      setResult(data);
      saveToHistory(activeQuery);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Ensure Puter.js is active.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-neon-green/5 blur-[120px] -z-10 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-6 px-4 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 backdrop-blur-md"
        >
          <div className="relative">
            <Activity className="w-4 h-4 text-neon-green animate-pulse" />
            <div className="absolute inset-0 bg-neon-green blur-sm animate-pulse opacity-50" />
          </div>
          <span className="text-[10px] font-mono text-neon-green tracking-[0.3em] uppercase font-bold">Vayu AGI v2.5 Research Agent</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent leading-none"
        >
          VAYU AGI
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-mono tracking-tight"
        >
          Automated Cyber Threat Research & Analysis Agent<br/>
          <span className="text-[10px] opacity-40 uppercase tracking-[0.5em] mt-2 block">Powered by Puter.js • 100% Frontend</span>
        </motion.p>
      </header>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto w-full mb-12">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-neon-green/20 blur-3xl group-hover:bg-neon-green/30 transition-all duration-500 rounded-full opacity-50" />
          <div className="relative flex items-center glass-card p-3 neon-border bg-black/40">
            <Search className="w-7 h-7 ml-4 text-white/40" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Research threat... (e.g., analyze recent Log4j variants)"
              className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-xl font-mono placeholder:text-white/20"
            />
            <button 
              disabled={loading}
              className="cyber-button flex items-center gap-2 mr-2 py-3 px-6"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
              <span className="hidden sm:inline font-bold">RESEARCH</span>
            </button>
          </div>
        </form>

        {/* Puter Cloud Status & History */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <Cloud className={`w-3 h-3 ${isPuterReady ? 'text-neon-green' : 'text-white/20'}`} />
            <span>{isPuterReady ? 'Puter AI & Cloud Active' : 'Initializing Puter...'}</span>
          </div>

          {history.length > 0 && (
            <div className="w-full glass-card p-4 neon-border bg-black/20">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                  <History className="w-3 h-3" />
                  <span>Recent Research Missions</span>
                </div>
                <button 
                  onClick={clearHistory}
                  className="text-[10px] text-red-400/50 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(h); handleSearch(undefined, h); }}
                    className="text-[10px] font-mono px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-neon-green hover:border-neon-green/30 transition-all"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); }}
              className="text-[10px] font-mono uppercase tracking-wider px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-neon-green hover:border-neon-green/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-3xl mx-auto w-full mb-8 p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-4 shadow-2xl"
          >
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="font-mono text-sm">
              <p className="font-bold mb-1">RESEARCH AGENT ERROR</p>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <div ref={resultsRef} className="space-y-8 pb-24">
        {loading && !result && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-green/20 blur-2xl animate-pulse" />
              <Loader2 className="w-16 h-16 text-neon-green animate-spin relative" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-mono text-neon-green text-lg animate-pulse tracking-widest">AGENT DEPLOYED: GATHERING INTEL...</p>
              <p className="text-white/30 text-xs font-mono uppercase">Scanning Global Feeds • Analyzing Impact • Generating Mitigation Roadmap</p>
            </div>
          </div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
              {[
                { id: 'all', label: 'Full Report', icon: Layers },
                { id: 'report', label: 'Threat Analysis', icon: Activity },
                { id: 'recon', label: 'Recon & Commands', icon: Shield },
                { id: 'payloads', label: 'Payload Lab', icon: Code },
                { id: 'intel', label: 'CVE & Intel', icon: Bug }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-mono text-[10px] md:text-xs uppercase tracking-widest transition-all border backdrop-blur-md",
                    activeTab === tab.id 
                      ? 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_25px_rgba(0,255,65,0.2)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Threat Overview & Impact - Visible in All or Report */}
              {(activeTab === 'all' || activeTab === 'report') && (
                <>
                  <div className="md:col-span-3 glass-card p-8 neon-border bg-black/60">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 text-neon-green">
                        <TrendingUp className="w-6 h-6" />
                        <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Threat Severity Trend</h2>
                      </div>
                      <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Historical Projection</div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.charts?.severityTrend}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(str) => str.split('-').slice(1).join('/')}
                          />
                          <YAxis 
                            stroke="#ffffff40" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            domain={[0, 100]}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #00ff41', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#00ff41' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#00ff41" 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="md:col-span-3 glass-card p-8 neon-border bg-black/60">
                    <div className="flex items-center gap-3 mb-6 text-neon-green">
                      <Activity className="w-6 h-6" />
                      <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Threat Intelligence Overview</h2>
                    </div>
                    <div className="p-6 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                      {result.threatOverview}
                    </div>
                  </div>

                  <div className="md:col-span-2 glass-card p-8 neon-border">
                    <div className="flex items-center gap-3 mb-6 text-neon-green">
                      <Shield className="w-6 h-6" />
                      <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Impact Assessment</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h3 className="text-xs font-mono text-neon-green uppercase mb-2">Technical Impact</h3>
                        <p className="text-sm text-white/70 font-mono leading-relaxed">{result.impactAnalysis.technical}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h3 className="text-xs font-mono text-neon-green uppercase mb-2">Business Impact</h3>
                        <p className="text-sm text-white/70 font-mono leading-relaxed">{result.impactAnalysis.business}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-8 neon-border flex flex-col items-center justify-center text-center">
                    <h3 className="text-xs font-mono text-white/40 uppercase mb-4 tracking-widest">Risk Score</h3>
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-white/5"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={364.4}
                          strokeDashoffset={364.4 - (364.4 * result.impactAnalysis.score) / 100}
                          className={cn(
                            "transition-all duration-1000 ease-out",
                            result.impactAnalysis.score > 80 ? "text-red-500" :
                            result.impactAnalysis.score > 50 ? "text-orange-500" : "text-neon-green"
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold font-mono text-white">{result.impactAnalysis.score}</span>
                      </div>
                    </div>
                    <div className={`text-xl font-bold font-mono uppercase tracking-tighter ${
                      result.impactAnalysis.severity === 'Critical' ? 'text-red-500 animate-pulse' :
                      result.impactAnalysis.severity === 'High' ? 'text-orange-500' :
                      result.impactAnalysis.severity === 'Medium' ? 'text-yellow-500' : 'text-neon-green'
                    }`}>
                      {result.impactAnalysis.severity}
                    </div>
                  </div>
                </>
              )}

              {/* Mitigation & Recommendations - Visible in All or Report */}
              {(activeTab === 'all' || activeTab === 'report') && (
                <>
                  <div className="md:col-span-3 glass-card p-8 neon-border bg-gradient-to-br from-black/60 to-blue-500/5 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10" />
                    <div className="flex items-center gap-3 mb-8 text-blue-400">
                      <Shield className="w-7 h-7" />
                      <h2 className="text-xl font-mono uppercase tracking-[0.4em] font-bold">Mitigation Roadmap</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-xs font-mono text-blue-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Immediate Actions
                        </h3>
                        <ul className="space-y-3">
                          {result.mitigationStrategies.immediate.map((action, i) => (
                            <li key={i} className="flex gap-3 text-sm text-white/70 font-mono group">
                              <span className="text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform">▶</span> {action}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-xs font-mono text-blue-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                          <Activity className="w-3 h-3" /> Long-Term Defense
                        </h3>
                        <ul className="space-y-3">
                          {result.mitigationStrategies.longTerm.map((action, i) => (
                            <li key={i} className="flex gap-3 text-sm text-white/70 font-mono group">
                              <span className="text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform">▶</span> {action}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>
                  </div>

                  {/* Technical Deep Dive - New Feature */}
                  <div className="md:col-span-3 glass-card p-8 neon-border bg-black/80">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 text-neon-green">
                        <Code className="w-6 h-6" />
                        <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Technical Deep Dive</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-[10px] font-mono text-neon-green uppercase tracking-widest">Live Analysis</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1 space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <h4 className="text-[10px] font-mono text-white/40 uppercase mb-2">Attack Surface</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Network', 'Application', 'Cloud', 'Endpoint'].map(tag => (
                              <span key={tag} className="text-[8px] font-mono px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <h4 className="text-[10px] font-mono text-white/40 uppercase mb-2">Detection Logic</h4>
                          <p className="text-[10px] text-white/60 font-mono leading-relaxed italic">
                            Analyzing behavioral patterns for anomalous activity detection...
                          </p>
                        </div>
                      </div>
                      <div className="lg:col-span-3">
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 font-mono text-xs">
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-bottom border-white/10">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            </div>
                            <span className="ml-2 text-white/30 text-[10px]">vayu_analysis_kernel.sh</span>
                          </div>
                          <div className="p-6 space-y-2 text-white/70">
                            <p className="text-neon-green/60"># Vayu AGI v2.5 Methodology Analysis</p>
                            <p className="text-blue-400">function analyze_threat() {'{'}</p>
                            <p className="pl-4">echo "Initializing deep packet inspection..."</p>
                            <p className="pl-4">check_vulnerabilities --target "$QUERY"</p>
                            <p className="pl-4">generate_mitigation_roadmap --severity "CRITICAL"</p>
                            <p className="text-blue-400">{'}'}</p>
                            <p className="mt-4 text-white/40 leading-relaxed italic">
                              {result.whyThisWorks}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 glass-card p-8 neon-border">
                    <div className="flex items-center gap-3 mb-6 text-neon-green">
                      <Target className="w-6 h-6" />
                      <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Actionable Recommendations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.actionableRecommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-green/20 transition-all">
                          <div className="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center shrink-0 text-neon-green text-[10px] font-mono">
                            {i + 1}
                          </div>
                          <p className="text-sm text-white/70 font-mono leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Recon Plan - Always Visible in All or Recon */}
              {(activeTab === 'all' || activeTab === 'recon') && (
                <div className="md:col-span-3 glass-card p-8 neon-border bg-black/60">
                  <div className="flex items-center gap-3 mb-6 text-neon-green">
                    <Target className="w-6 h-6" />
                    <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Strategic Recon Plan</h2>
                  </div>
                  <div className="p-6 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {result.reconPlan}
                  </div>
                </div>
              )}

              {/* Commands - Always Visible in All or Recon */}
              {(activeTab === 'all' || activeTab === 'recon') && (
                <div className="md:col-span-2 glass-card p-8 neon-border">
                  <div className="flex items-center gap-3 mb-6 text-neon-green">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Terminal Arsenal</h2>
                  </div>
                  <div className="space-y-4">
                    {result.commands.map((cmd, i) => (
                      <div key={i} className="group relative bg-black/80 rounded-xl p-5 border border-white/10 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 text-[10px] text-white/20 font-mono">
                          <span className="text-neon-green">$</span> terminal_exec --op {i + 1}
                        </div>
                        <code className="text-sm font-mono text-neon-green block pr-12 break-all">{cmd}</code>
                        <button 
                          onClick={() => copyToClipboard(cmd, `cmd-${i}`)}
                          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-neon-green transition-all"
                        >
                          {copiedIndex === `cmd-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Dorks - Visible in All or Recon */}
              {(activeTab === 'all' || activeTab === 'recon') && (
                <div className="glass-card p-8 neon-border">
                  <div className="flex items-center gap-3 mb-6 text-neon-green">
                    <Search className="w-6 h-6" />
                    <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Dork Engine</h2>
                  </div>
                  <div className="space-y-4">
                    {result.googleDorks.map((dork, i) => (
                      <div key={i} className="group relative bg-black/60 rounded-xl p-4 border border-white/5">
                        <code className="text-xs font-mono text-white/60 block pr-10">{dork}</code>
                        <button 
                          onClick={() => copyToClipboard(dork, `dork-${i}`)}
                          className="absolute top-3 right-3 p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-neon-green transition-all"
                        >
                          {copiedIndex === `dork-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payload Lab - Visible in All or Payloads */}
              {(activeTab === 'all' || activeTab === 'payloads') && (
                <div className="md:col-span-3 glass-card p-8 neon-border bg-gradient-to-br from-black/60 to-neon-green/5">
                  <div className="flex items-center gap-3 mb-8 text-neon-green">
                    <Code className="w-7 h-7" />
                    <h2 className="text-xl font-mono uppercase tracking-[0.4em] font-bold">Payload Generation Lab</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.payloads.map((p, i) => (
                      <div key={i} className="glass-card p-6 bg-black/40 border-white/5 hover:border-neon-green/30 transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20 uppercase tracking-widest">
                            {p.type}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(p.payload, `payload-${i}`)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-neon-green transition-all"
                          >
                            {copiedIndex === `payload-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="bg-black/80 p-4 rounded-lg mb-4 border border-white/5">
                          <code className="text-xs font-mono text-white/80 break-all">{p.payload}</code>
                        </div>
                        <p className="text-xs text-white/40 font-mono leading-relaxed italic">
                          // {p.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bug Bounty Tips - Visible in All or Payloads */}
              {(activeTab === 'all' || activeTab === 'payloads') && (
                <div className="md:col-span-3 glass-card p-8 neon-border">
                  <div className="flex items-center gap-3 mb-6 text-neon-green">
                    <Target className="w-6 h-6" />
                    <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Bug Bounty Intelligence</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.bugBountyTips.map((tip, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center shrink-0 text-neon-green text-[10px] font-mono">
                          {i + 1}
                        </div>
                        <p className="text-sm text-white/70 font-mono leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CVE Intelligence - Visible in All or Intel */}
              {(activeTab === 'all' || activeTab === 'intel') && (
                <>
                  <div className="md:col-span-3 glass-card p-8 neon-border bg-black/60">
                    <div className="flex items-center gap-3 mb-8 text-neon-green">
                      <BarChart3 className="w-6 h-6" />
                      <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Vulnerability Severity Distribution</h2>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.charts?.cveSeverityDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #00ff41', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {result.charts?.cveSeverityDistribution?.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name === 'Critical' ? '#ef4444' : 
                                  entry.name === 'High' ? '#f97316' : 
                                  entry.name === 'Medium' ? '#eab308' : '#00ff41'
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="md:col-span-2 glass-card p-8 neon-border">
                    <div className="flex items-center gap-3 mb-6 text-neon-green">
                      <Bug className="w-6 h-6" />
                      <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Vulnerability Intel Feed</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.latestCVEs.map((cve, i) => (
                        <div key={i} className="p-5 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-all group">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-neon-green group-hover:text-red-400 transition-colors">{cve.id}</span>
                            <span className={`text-[10px] px-3 py-1 rounded-full font-mono uppercase ${
                              cve.severity.toLowerCase().includes('high') || cve.severity.toLowerCase().includes('critical')
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {cve.severity}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed font-mono">{cve.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Threat Actor Profiling - New Section */}
                  {result.threatActors && result.threatActors.length > 0 && (
                    <div className="md:col-span-3 glass-card p-8 neon-border bg-gradient-to-br from-black/60 to-red-500/5">
                      <div className="flex items-center gap-3 mb-8 text-red-400">
                        <Users className="w-7 h-7" />
                        <h2 className="text-xl font-mono uppercase tracking-[0.4em] font-bold">Threat Actor Profiling</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-8">
                        {result.threatActors.map((actor, idx) => (
                          <div key={idx} className="glass-card p-6 bg-black/40 border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] -z-10" />
                            <div className="flex flex-col lg:flex-row gap-8">
                              <div className="lg:w-1/3 space-y-4">
                                <div>
                                  <h3 className="text-2xl font-black text-white mb-1">{actor.name}</h3>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-red-400 uppercase tracking-widest">
                                    <Globe className="w-3 h-3" /> {actor.origin || 'Unknown Origin'}
                                  </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                  <h4 className="text-[10px] font-mono text-white/40 uppercase mb-2">Primary Motivation</h4>
                                  <p className="text-xs text-white/70 font-mono leading-relaxed">{actor.motivation}</p>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Typical TTPs</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {actor.ttps.map((ttp, i) => (
                                      <span key={i} className="text-[8px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                        {ttp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Flag className="w-3 h-3" /> Notable Campaigns
                                  </h4>
                                  <div className="space-y-3">
                                    {actor.campaigns.map((camp, i) => (
                                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] font-bold text-white">{camp.name}</span>
                                          <span className="text-[8px] font-mono text-white/30">{camp.year}</span>
                                        </div>
                                        <p className="text-[10px] text-white/50 font-mono leading-relaxed">{camp.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Monitor className="w-3 h-3" /> OS-Specific Arsenal
                                  </h4>
                                  <div className="space-y-3">
                                    {actor.tools.map((tool, i) => (
                                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-neon-green/30 transition-all">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] font-bold text-neon-green">{tool.name}</span>
                                          <span className={cn(
                                            "text-[8px] font-mono px-1.5 py-0.5 rounded",
                                            tool.os === 'Kali' ? 'bg-blue-500/10 text-blue-400' : 
                                            tool.os === 'Parrot' ? 'bg-green-500/10 text-green-400' : 
                                            'bg-purple-500/10 text-purple-400'
                                          )}>
                                            {tool.os}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-white/50 font-mono leading-relaxed">{tool.usage}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* OS Commands Section */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                              <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Tactical Commands (Kali & Parrot)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {actor.commands.map((cmd, i) => (
                                  <div key={i} className="relative bg-black/60 rounded-xl p-4 border border-white/5 group">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className={cn(
                                        "text-[8px] font-mono px-2 py-0.5 rounded uppercase tracking-tighter",
                                        cmd.os === 'Kali' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                                      )}>
                                        {cmd.os} OS
                                      </span>
                                      <button 
                                        onClick={() => copyToClipboard(cmd.command, `actor-cmd-${idx}-${i}`)}
                                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-neon-green transition-all"
                                      >
                                        {copiedIndex === `actor-cmd-${idx}-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                    <code className="text-[10px] font-mono text-white/80 block mb-2 break-all">{cmd.command}</code>
                                    <p className="text-[9px] text-white/30 font-mono italic">// {cmd.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
              {(activeTab === 'all' || activeTab === 'intel') && (
                <div className="glass-card p-8 neon-border">
                  <div className="flex items-center gap-3 mb-6 text-neon-green">
                    <Github className="w-6 h-6" />
                    <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Tool Discovery</h2>
                  </div>
                  <div className="space-y-4">
                    {result.githubProjects.map((repo, i) => (
                      <a 
                        key={i} 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-green/30 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-neon-green transition-colors">{repo.name}</h3>
                          {repo.stars !== undefined && (
                            <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-mono">
                              <span>★</span>
                              <span>{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white/40 line-clamp-2 font-mono leading-relaxed mb-2">{repo.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-neon-green font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          VIEW REPO <ExternalLink className="w-2 h-2" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools - Visible in All */}
              {activeTab === 'all' && (
                <div className="md:col-span-3 glass-card p-8 neon-border">
                  <div className="flex items-center gap-3 mb-6 text-neon-green">
                    <BookOpen className="w-6 h-6" />
                    <h2 className="text-lg font-mono uppercase tracking-[0.3em] font-bold">Recommended Toolset</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {result.tools.map((tool, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <Wrench className="w-5 h-5 text-neon-green mb-3" />
                        <h3 className="text-sm font-bold text-white mb-2">{tool.name}</h3>
                        <p className="text-xs text-white/40 mb-4 font-mono leading-relaxed">{tool.purpose}</p>
                        {tool.link && (
                          <a 
                            href={tool.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-neon-green flex items-center gap-1 hover:underline font-mono"
                          >
                            DOCS <ExternalLink className="w-2 h-2" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation & Learning - Visible in All */}
              {activeTab === 'all' && (
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-8 neon-border bg-black/60">
                    <div className="flex items-center gap-2 mb-6 text-neon-green">
                      <Shield className="w-5 h-5" />
                      <h2 className="text-sm font-mono uppercase tracking-widest font-bold">Methodology Analysis</h2>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed terminal-text whitespace-pre-wrap">{result.whyThisWorks}</p>
                  </div>
                  <div className="glass-card p-8 neon-border bg-black/60">
                    <div className="flex items-center gap-2 mb-6 text-neon-green">
                      <BookOpen className="w-5 h-5" />
                      <h2 className="text-sm font-mono uppercase tracking-widest font-bold">Academic Insights</h2>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed terminal-text whitespace-pre-wrap">{result.learningNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-neon-green/5 blur-[80px] -z-10 pointer-events-none" />
        
        {/* Live Feed Simulation */}
        <div className="max-w-4xl mx-auto mb-12 px-4">
          <div className="glass-card p-4 bg-black/40 border-white/5 text-left overflow-hidden h-32 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/80 z-10 pointer-events-none" />
            <div className="flex items-center gap-2 mb-2 text-[8px] font-mono text-neon-green/40 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Live Intelligence Stream
            </div>
            <div className="space-y-1 font-mono text-[8px] text-white/20 animate-scroll-up">
              <p>[{new Date().toISOString()}] INF: Analyzing global CVE database...</p>
              <p>[{new Date().toISOString()}] INF: New exploit pattern detected in wild: CVE-2026-XXXX</p>
              <p>[{new Date().toISOString()}] WARN: Increased scanning activity from known malicious botnets</p>
              <p>[{new Date().toISOString()}] INF: Updating Vayu AGI v2.5 intelligence core...</p>
              <p>[{new Date().toISOString()}] INF: Correlating threat actors with recent campaigns...</p>
              <p>[{new Date().toISOString()}] INF: Generating mitigation signatures...</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            VAYU CORE ONLINE
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            PUTER SYNC ACTIVE
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            THREAT LEVEL: ELEVATED
          </div>
        </div>
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-4">
          Vayu AGI © 2026 RudraTech Inc • Elite Cybersecurity Intelligence
        </p>
        <div className="flex justify-center gap-4 text-[8px] font-mono text-white/10 uppercase tracking-widest">
          <span>Authorized Research Only</span>
          <span>•</span>
          <span>End-to-End Encryption</span>
          <span>•</span>
          <span>Zero-Knowledge Architecture</span>
        </div>
      </footer>
    </div>
  );
}
