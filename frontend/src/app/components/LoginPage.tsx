import { useState } from "react";
import { useNavigate } from "react-router";
import { Mic, Activity, ShieldCheck, Database, LayoutDashboard, ArrowRight } from "lucide-react";
import { cn } from "./ui";

export function LoginPage() {
  const [mode, setMode] = useState<"live" | "demo">("demo");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticating(true);
    // Save mode preference to localStorage for main app to read
    localStorage.setItem("asr_app_mode", mode);
    
    // Simulate SSO Login
    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background selection:bg-primary/20">
      
      {/* LEFT PILLAR: Branding & Context (Dark/Charcoal for premium feel) */}
      <div className="hidden lg:flex flex-col flex-1 bg-[#1c1c1c] text-white p-16 relative overflow-hidden shrink-0 max-w-[55%]">
        
        {/* Subtle background abstract waveform accents */}
        <div className="absolute top-1/2 left-0 w-full h-[600px] -translate-y-1/2 opacity-[0.03] pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white bottom-1/2 left-0"
              style={{
                left: `${(i / 40) * 100}%`,
                width: '1.5%',
                height: `${Math.max(10, Math.sin(i * 0.4) * 50 + 50)}%`,
                borderTopRightRadius: '2px',
                borderTopLeftRadius: '2px',
                boxShadow: '0 0 20px rgba(255,255,255,0.5)'
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 bg-primary rounded-[2px] flex items-center justify-center shadow-lg">
            <Mic size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wider uppercase">ASR Platform</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-light leading-tight">
            Advanced Acoustic Intelligence <span className="font-bold">Engine</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed font-medium">
            Centralized orchestration, validation, and analytics for global speech recognition models. 
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10 mt-8">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-[2px] bg-white/5 flex items-center justify-center text-primary border border-white/10">
                <Database size={16} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Multi-Model Pipelines</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">Parallel execution across Whisper, Azure, and Vibe models for robust validation.</p>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-[2px] bg-white/5 flex items-center justify-center text-primary border border-white/10">
                <LayoutDashboard size={16} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Executive Analytics</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">Deep-dive WER tracking and transcription performance telemetry.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PILLAR: Authentication Panel */}
      <div className={cn(
        "flex flex-col flex-1 items-center justify-center p-8 transition-colors duration-700 relative",
        mode === "demo" ? "bg-slate-50 dark:bg-[#121212]" : "bg-white dark:bg-[#181818]"
      )}>
        {/* Environment Indicator */}
        <div className="absolute top-8 right-8 flex items-center gap-2">
           <div className={cn(
             "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full border shadow-sm transition-colors duration-500",
             mode === "live" ? "bg-white dark:bg-card border-primary/20 text-primary" : "bg-white dark:bg-card border-border text-muted-foreground"
           )}>
             {mode === "live" ? "Production Gateway" : "Sandbox Gateway"}
           </div>
        </div>

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-foreground">Authentication</h2>
            <p className="text-sm text-muted-foreground font-medium">Select your environment context before authenticating.</p>
          </div>

          {/* ENVIRONMENT TOGGLE */}
          <div className="bg-muted p-1.5 rounded-[4px] border border-border flex relative isolation-auto">
            {/* Sliding strict highlight */}
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-card rounded-[2px] shadow-sm border border-border transition-transform duration-300 ease-in-out z-0"
              style={{
                transform: mode === "live" ? "translateX(0)" : "translateX(calc(100% + 12px))"
              }}
            ></div>

            {/* LIVE OPTION */}
            <button
              onClick={() => setMode("live")}
              className={cn(
                "flex-1 flex flex-col items-center justify-center p-4 relative z-10 transition-colors rounded-[2px]",
                mode === "live" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity size={20} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">Live Mode</span>
              <span className="text-[10px] mt-1 font-medium opacity-80 text-center">Production Infrastructure</span>
            </button>
            
            {/* DEMO OPTION */}
            <button
              onClick={() => setMode("demo")}
              className={cn(
                "flex-1 flex flex-col items-center justify-center p-4 relative z-10 transition-colors rounded-[2px]",
                mode === "demo" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck size={20} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">Demo Mode</span>
              <span className="text-[10px] mt-1 font-medium opacity-80 text-center">Mock Analytical Data</span>
            </button>
          </div>

          <div className={cn(
            "p-5 text-[11px] rounded-[2px] border transition-colors duration-500 space-y-2",
            mode === "live" 
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400" 
              : "bg-white dark:bg-card border-border text-muted-foreground"
          )}>
            <div className="font-bold uppercase tracking-wider">
              {mode === "live" ? "Production Protocol" : "Sandbox Protocol"}
            </div>
            <p className="leading-relaxed">
              {mode === "live" 
                ? "You are activating the live production environment. Executed tasks will consume API credits and modify production metadata. This choice will persist until you sign out." 
                : "Sandbox Mode is active. You are free to explore UI functionalities using simulated APIs and mock datasets. This choice will persist until you sign out."}
            </p>
          </div>

          {/* SSO LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="group w-full flex items-center justify-center gap-3 bg-[#1c1c1c] text-white dark:bg-white dark:text-[#1c1c1c] p-4 rounded-[2px] font-bold uppercase tracking-widest text-xs hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                   <rect x="1" y="1" width="9" height="9"/>
                   <rect x="11" y="1" width="9" height="9"/>
                   <rect x="1" y="11" width="9" height="9"/>
                   <rect x="11" y="11" width="9" height="9"/>
                </svg>
                Authenticate with Microsoft
                <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-8">
            Secured by Microsoft Entra ID
          </p>

        </div>
      </div>
    </div>
  );
}
