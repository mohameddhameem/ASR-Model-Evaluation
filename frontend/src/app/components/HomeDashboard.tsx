import { Link } from "react-router";
import { useOutletContext } from "react-router";
import { Mic, ServerCog, GraduationCap, BarChart2, CheckCircle, AlertCircle, Clock, ArrowRight, Activity, Zap, FileAudio, TrendingUp, Users, Timer } from "lucide-react";
import { Card, cn } from "./ui";
import type { AppContextType } from "../../types";
import { DEFAULT_USER_IDENTITY } from "../../types";

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
    color: "primary",
    tag: "Technical"
  },
  {
    to: "/operations",
    icon: ServerCog,
    title: "Batch Processing",
    desc: "Upload multiple files, run them through the ASR pipeline, and export results in bulk.",
    color: "primary",
    tag: "Operations"
  },
  {
    to: "/training",
    icon: GraduationCap,
    title: "Training Pipeline",
    desc: "Verify transcriptions, confirm language IDs, and trigger fine-tuning jobs for your models.",
    color: "primary",
    tag: "Advanced"
  },
  {
    to: "/analytics",
    icon: BarChart2,
    title: "Model Analytics",
    desc: "Compare model performance, track WER trends, and monitor GPU utilization over time.",
    color: "primary",
    tag: "Technical"
  }
];

const colorMap: Record<string, { bg: string; border: string; icon: string; tag: string; hover: string }> = {
  primary: {
    bg: "bg-secondary",
    border: "border-border",
    icon: "text-primary bg-secondary",
    tag: "bg-primary/10 text-primary",
    hover: "hover:border-primary/50"
  },
  neutral: {
    bg: "bg-muted",
    border: "border-border",
    icon: "text-muted-foreground bg-muted",
    tag: "bg-muted-foreground/10 text-muted-foreground",
    hover: "hover:border-border"
  }
};

export function HomeDashboard() {
  const { datasets, userPreferences } = useOutletContext<AppContextType>();
  const verifiedCount = datasets.filter(d => d.transcriptionVerified).length;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-screen-xl mx-auto space-y-8">
      
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-[2px] bg-white dark:bg-card border border-border p-8 text-foreground shadow-sm">
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[10px] font-bold tracking-wider uppercase border",
              userPreferences.mode === 'demo'
                ? "bg-secondary text-primary border-primary/20"
                : "bg-red-50 dark:bg-red-900/30 text-primary border-primary/20"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              {userPreferences.mode} MODE
            </div>
          </div>
          <h2 className="text-3xl font-light mb-1">{greeting}, <span className="font-semibold">{DEFAULT_USER_IDENTITY.name}</span></h2>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {userPreferences.mode === 'demo'
              ? "You're exploring with mock data. Switch to Live Mode in Settings to connect real endpoints."
              : "Connected to production APIs. All processing jobs are using live ASR infrastructure."}
          </p>
        </div>
        {/* Decorative thin red line accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      </div>

      {/* AI Disclaimer Banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-[2px] border border-amber-300/70 bg-amber-50/80 dark:bg-amber-900/15 dark:border-amber-500/30 text-amber-900 dark:text-amber-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 opacity-80"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <p className="text-[11px] leading-relaxed">
          <span className="font-bold uppercase tracking-wide">AI System Disclaimer —</span>{" "}
          Transcriptions, language identifications, and confidence scores are generated by AI models and may contain errors.
          Always review and verify AI-generated output before use in production or decision-making.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Files Processed Today", value: "12", sub: "+3 vs yesterday", icon: FileAudio, color: "text-primary", bg: "bg-secondary" },
          { label: "Avg. Confidence Score", value: "91%", sub: "Across all models", icon: TrendingUp, color: "text-[#16a34a] dark:text-[#4ade80]", bg: "bg-[#f0fdf4] dark:bg-[#052c16]" },
          { label: "Verified Datasets", value: `${verifiedCount}/${datasets.length}`, sub: "Ready for training", icon: CheckCircle, color: "text-[#d97706] dark:text-[#fbbf24]", bg: "bg-[#fffbeb] dark:bg-[#451a03]/20" },
          { label: "Active Models", value: "2", sub: "Whisper V3 + VibeVoice", icon: Activity, color: "text-primary", bg: "bg-secondary" },
        ].map((kpi, i) => (
          <Card key={i} className="p-4 bg-white dark:bg-card border-border flex items-start gap-4 rounded-[2px]">
            <div className={cn("p-2.5 rounded-[2px] shrink-0", kpi.bg)}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{kpi.label}</div>
              <div className="text-2xl font-bold text-foreground mt-0.5">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions — 2/3 width */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em]">What do you want to do?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const c = colorMap[action.color];
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={cn(
                    "group relative flex flex-col gap-3 p-5 rounded-[2px] border bg-white dark:bg-card transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
                    c.border, c.hover
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2.5 rounded-[2px]", c.icon)}>
                      <Icon size={20} />
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wide", c.tag)}>
                      {action.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{action.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                    Open <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity — 1/3 width */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em]">Recent Jobs</h3>
          <Card className="bg-white dark:bg-card border-border divide-y divide-border overflow-hidden rounded-[2px]">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  job.status === "completed" ? "bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-[#f59e0b] animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                )}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{job.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-[2px] font-bold uppercase">{job.lang}</span>
                    <span className="text-[10px] text-muted-foreground">{job.time}</span>
                  </div>
                </div>
                <span className={cn("text-[10px] font-bold", job.status === "completed" ? "text-[#16a34a]" : "text-[#d97706]")}>
                  {job.status === "completed" ? job.confidence : "…"}
                </span>
              </div>
            ))}
            <Link to="/operations" className="flex items-center justify-center gap-1.5 p-3 text-xs font-semibold text-primary hover:bg-secondary transition-colors">
              View all batch jobs <ArrowRight size={12} />
            </Link>
          </Card>

          {/* System Status */}
          <Card className="bg-white dark:bg-card border-border p-4 space-y-3 rounded-[2px]">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Status</h4>
            {[
              { label: "ASR Backend", ok: true },
              { label: "LID Service", ok: true },
              { label: "Translation API", ok: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  {s.ok ? <CheckCircle size={14} className="text-[#22c55e]" /> : <AlertCircle size={14} className="text-primary" />}
                  <span className={cn("text-[10px] font-bold", s.ok ? "text-[#16a34a]" : "text-primary")}>
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
