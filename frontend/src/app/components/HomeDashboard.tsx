import { Link } from "react-router";
import { useOutletContext } from "react-router";
import { Mic, ServerCog, GraduationCap, BarChart2, CheckCircle, AlertCircle, Clock, ArrowRight, Activity, Zap, FileAudio, TrendingUp, Users, Timer } from "lucide-react";
import { Card, cn } from "./ui";
import type { AppContextType } from "./Layout";

const recentJobs = [
  { id: "job-004", name: "lecture-hall-recording.m4a", lang: "ZH", status: "completed", confidence: "95%", time: "14 mins ago" },
  { id: "job-002", name: "meeting-transcription.wav", lang: "FR", status: "completed", confidence: "88%", time: "1 hr ago" },
  { id: "job-003", name: "interview-segment.mp3", lang: "DE", status: "processing", confidence: "--", time: "2 hrs ago" },
  { id: "job-001", name: "conference-audio-2026-03-15.mp4", lang: "EN", status: "completed", confidence: "92%", time: "3 hrs ago" },
];

const quickActions = [
  {
    to: "/",
    icon: Mic,
    title: "Single File Analysis",
    desc: "Deep-dive into one audio file — edit transcriptions, review segments, inspect waveforms.",
    color: "indigo",
    tag: "Technical"
  },
  {
    to: "/operations",
    icon: ServerCog,
    title: "Batch Processing",
    desc: "Upload multiple files, run them through the ASR pipeline, and export results in bulk.",
    color: "purple",
    tag: "Operations"
  },
  {
    to: "/training",
    icon: GraduationCap,
    title: "Training Pipeline",
    desc: "Verify transcriptions, confirm language IDs, and trigger fine-tuning jobs for your models.",
    color: "emerald",
    tag: "Advanced"
  },
  {
    to: "/analytics",
    icon: BarChart2,
    title: "Model Analytics",
    desc: "Compare model performance, track WER trends, and monitor GPU utilization over time.",
    color: "amber",
    tag: "Technical"
  }
];

const colorMap: Record<string, { bg: string; border: string; icon: string; tag: string; hover: string }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-100 dark:border-indigo-800/50",
    icon: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50",
    tag: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    hover: "hover:border-indigo-300 dark:hover:border-indigo-600"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-100 dark:border-purple-800/50",
    icon: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
    tag: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    hover: "hover:border-purple-300 dark:hover:border-purple-600"
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
    tag: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    hover: "hover:border-emerald-300 dark:hover:border-emerald-600"
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-100 dark:border-amber-800/50",
    icon: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
    tag: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    hover: "hover:border-amber-300 dark:hover:border-amber-600"
  },
};

export function HomeDashboard() {
  const { datasets, userPreferences } = useOutletContext<AppContextType>();
  const verifiedCount = datasets.filter(d => d.transcriptionVerified).length;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-screen-xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white shadow-xl shadow-indigo-900/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDM0di0yaC0ydi0yaC0ydi0yaDJ2LTJoMnYtMmgydjJoMnYyaC0ydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
              userPreferences.mode === 'demo'
                ? "bg-white/20 text-white border-white/30"
                : "bg-rose-500/30 text-rose-100 border-rose-400/30"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
              {userPreferences.mode} MODE
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-1">{greeting}, Jane 👋</h2>
          <p className="text-indigo-200 text-sm">
            {userPreferences.mode === 'demo'
              ? "You're exploring with mock data. Switch to Live Mode in Settings to connect real endpoints."
              : "Connected to production APIs. All processing jobs are using live ASR infrastructure."}
          </p>
        </div>
        {/* Decorative waveform bars */}
        <div className="absolute right-8 bottom-6 flex items-end gap-1 opacity-30">
          {[18, 32, 46, 28, 52, 38, 20, 44, 30, 50, 24, 36, 48, 22, 40].map((h, i) => (
            <div key={i} className="w-1 bg-white rounded-full" style={{ height: h }}></div>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Files Processed Today", value: "12", sub: "+3 vs yesterday", icon: FileAudio, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Avg. Confidence Score", value: "91%", sub: "Across all models", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Verified Datasets", value: `${verifiedCount}/${datasets.length}`, sub: "Ready for training", icon: CheckCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Active Models", value: "2", sub: "Whisper V3 + VibeVoice", icon: Activity, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((kpi, i) => (
          <Card key={i} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className={cn("p-2.5 rounded-xl shrink-0", kpi.bg)}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide truncate">{kpi.label}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{kpi.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions — 2/3 width */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">What do you want to do?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const c = colorMap[action.color];
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={cn(
                    "group relative flex flex-col gap-3 p-5 rounded-xl border-2 bg-white dark:bg-slate-900 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5",
                    c.border, c.hover
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2.5 rounded-xl", c.icon)}>
                      <Icon size={20} />
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", c.tag)}>
                      {action.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-inherit">{action.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{action.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-indigo-500 transition-colors mt-auto">
                    Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity — 1/3 width */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Recent Jobs</h3>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  job.status === "completed" ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                )}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">{job.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">{job.lang}</span>
                    <span className="text-[10px] text-slate-400">{job.time}</span>
                  </div>
                </div>
                <span className={cn("text-[10px] font-bold", job.status === "completed" ? "text-emerald-600" : "text-amber-500")}>
                  {job.status === "completed" ? job.confidence : "…"}
                </span>
              </div>
            ))}
            <Link to="/operations" className="flex items-center justify-center gap-1.5 p-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              View all batch jobs <ArrowRight size={12} />
            </Link>
          </Card>

          {/* System Status */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Status</h4>
            {[
              { label: "ASR Backend", ok: true },
              { label: "LID Service", ok: true },
              { label: "Translation API", ok: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  {s.ok ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                  <span className={cn("text-[10px] font-bold", s.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {s.ok ? "Online" : "Degraded"}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
