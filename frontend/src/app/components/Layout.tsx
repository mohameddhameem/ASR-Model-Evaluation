import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Mic, BarChart2, Menu, ChevronLeft, Bot, Sun, Moon, Settings as SettingsIcon, User, BrainCircuit, ServerCog, Home, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "./ui";
import { DatasetSidebar } from "./DatasetSidebar";
import type { DatasetItem, UserPreferences, AppContextType } from "../../types";
import { DEFAULT_USER_IDENTITY } from "../../types";

// Types are now canonical in src/types/index.ts — re-export for backwards compat
export type { DatasetItem, UserPreferences, AppContextType } from "../../types";

const navItems = [
  { path: "/app/dashboard", label: "Home", icon: Home, badge: null },
  { path: "/app", label: "Workbench", icon: Mic, badge: "Single" },
  { path: "/app/operations", label: "Batch Ops", icon: ServerCog, badge: "Batch" },
  { path: "/app/training", label: "Training", icon: BrainCircuit, badge: null },
  { path: "/app/live", label: "Live Sandbox", icon: Mic, badge: "New" },
  { path: "/app/analytics", label: "Analytics", icon: BarChart2, badge: null },
];

const INITIAL_DATASETS: DatasetItem[] = [
  { id: "ds-001", name: "interview_session_12.wav", url: "", type: "audio/wav", duration: "14:20", transcriptionVerified: true, lidVerified: true, detectedLanguage: "en", verifiedLanguage: "en", uploadDate: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "ds-002", name: "street_noise_sample_bg.mp3", url: "", type: "audio/mp3", duration: "01:05", transcriptionVerified: false, lidVerified: false, detectedLanguage: "zh", uploadDate: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "ds-003", name: "call_center_fr_992.wav", url: "", type: "audio/wav", duration: "08:14", transcriptionVerified: false, lidVerified: true, detectedLanguage: "fr", verifiedLanguage: "fr", uploadDate: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "ds-004", name: "customer_support_de.mp4", url: "", type: "video/mp4", duration: "02:30", transcriptionVerified: false, lidVerified: false, detectedLanguage: "de", uploadDate: new Date().toISOString() },
];

const INITIAL_PREFERENCES: UserPreferences = {
  asrModel: "auto",
  lidModel: "whisper-lid",
  contextWords: "",
  enableSampling: true,
  temperature: 0.2,
  topP: 0.95,
  mode: 'demo'
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(true); 
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Shared global states
  const [datasets, setDatasets] = useState<DatasetItem[]>(INITIAL_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>("ds-001");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const savedMode = localStorage.getItem("asr_app_mode");
    return {
      ...INITIAL_PREFERENCES,
      mode: (savedMode === "live" || savedMode === "demo") ? savedMode : INITIAL_PREFERENCES.mode
    };
  });
  const [loading, setLoading] = useState(true);

  // Sync primary color based on mode
  useEffect(() => {
    const root = document.documentElement;
    if (userPreferences.mode === 'demo') {
      root.style.setProperty('--primary-mode', 'var(--primary-demo)');
    } else {
      root.style.setProperty('--primary-mode', 'var(--primary-live)');
    }
  }, [userPreferences.mode]);

  // Enforce Login flow if no mode is selected
  useEffect(() => {
    if (!localStorage.getItem("asr_app_mode")) {
      navigate("/");
    }
  }, [navigate]);


  // Fetch datasets from backend on mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/datasets");
        if (response.ok) {
          const backendDatasets = await response.json();
          const mappedDatasets = backendDatasets.map((ds: any, index: number) => ({
            id: `ds-${index + 1}`,
            name: ds.name || `Dataset ${index + 1}`,
            url: "",
            type: "audio",
            duration: ds.duration || "unknown",
            transcriptionVerified: false,
            lidVerified: false,
            detectedLanguage: ds.language || "unknown",
            uploadDate: new Date().toISOString()
          }));
          setDatasets(mappedDatasets);
          setActiveDatasetId(mappedDatasets[0]?.id || null);
        }
      } catch (error) {
        console.warn("Failed to fetch datasets from backend, using local data:", error);
        // Fall back to initial data
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatasets();
  }, []);
  
  const addDatasetItem = (item: DatasetItem) => {
    setDatasets((prev) => [item, ...prev]);
  };

  const updateDatasetItem = (id: string, updates: Partial<DatasetItem>) => {
    setDatasets((prev) => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const hideSidebarRoutes = ["/app/operations", "/app/datasets", "/app/analytics", "/app/retraining", "/app/language-id", "/app/settings", "/app/dashboard", "/app/training"];
  const showDatasetSidebar = location.pathname === "/app" || location.pathname === "/app/";

  const handleLogout = () => {
    localStorage.removeItem("asr_app_mode");
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full bg-background dark:bg-background text-foreground overflow-hidden font-sans transition-colors duration-200">
      {/* Primary Sidebar (Navigation) */}
      <aside
        className={cn(
          "flex flex-col bg-white dark:bg-[#181818] border-r border-border transition-all duration-300 z-20 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0 bg-white dark:bg-[#181818]">
          {!collapsed && (
            <div className="flex items-center gap-2 font-semibold text-foreground px-1 overflow-hidden whitespace-nowrap">
              <div className="h-6 w-6 bg-primary rounded-[2px] flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={14} className="text-white" />
              </div>
              <span>ASR Platform</span>
            </div>
          )}
          {collapsed && (
            <div className="h-6 w-6 bg-primary rounded-[2px] flex items-center justify-center mx-auto shrink-0 shadow-sm">
              <Bot size={14} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-[2px] text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 transition-colors hidden md:block"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname === "/dashboard");
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-colors whitespace-nowrap group relative",
                  isActive
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon size={22} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-muted-foreground/10 text-muted-foreground font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border text-[10px] uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap overflow-hidden bg-white dark:bg-[#181818]">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.6)]"></div>
              Service Terminal active
            </div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mx-auto shadow-[0_0_8px_rgba(22,163,74,0.6)]"></div>
          )}
        </div>
      </aside>

      {/* Secondary Sidebar (Dataset Manager) */}
      {showDatasetSidebar && (
        <DatasetSidebar 
          datasets={datasets} 
          addDatasetItem={addDatasetItem} 
          activeDatasetId={activeDatasetId} 
          setActiveDatasetId={setActiveDatasetId} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background transition-colors duration-200">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white dark:bg-[#1c1c1c] backdrop-blur shrink-0">
          <h1 className="text-lg font-medium text-foreground">
            {navItems.find((i) => i.path === location.pathname)?.label || 
             (location.pathname === "/settings" && "Global Settings") || 
             (location.pathname === "/dashboard" && "Home") ||
             "ASR Platform"}
          </h1>
          
          {/* User & Settings Panel */}
          <div className="flex items-center gap-4">
              {/* Mode Indicator — now read-only */}
            <div
              className={cn(
                "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-[10px] font-bold tracking-[0.1em] uppercase border shadow-sm",
                userPreferences.mode === 'demo' 
                  ? "bg-secondary text-primary border-primary/20" 
                  : "bg-red-50 dark:bg-red-900/30 text-primary border-primary/20"
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              {userPreferences.mode} MODE
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-[2px] bg-muted hover:bg-border/50 text-muted-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="h-6 w-px bg-border mx-1"></div>
            
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold text-foreground">{DEFAULT_USER_IDENTITY.name}</span>
                <span className="text-xs text-muted-foreground">{DEFAULT_USER_IDENTITY.role}</span>
              </div>
              <div className="w-8 h-8 rounded-[2px] bg-secondary border border-border flex items-center justify-center text-primary shadow-sm cursor-pointer">
                <User size={16} />
              </div>
              <button 
                onClick={() => navigate("/app/settings")}
                className={cn(
                  "p-1.5 transition-colors rounded-[2px]", 
                  location.pathname === "/app/settings" ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground"
                )}
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-[2px]"
                title="Log Out & Switch Mode"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet context={{ 
            datasets, 
            addDatasetItem, 
            updateDatasetItem, 
            activeDatasetId, 
            setActiveDatasetId,
            userPreferences,
            updateUserPreferences: setUserPreferences,
            onLogout: handleLogout
          } satisfies AppContextType} />
        </div>
      </main>
    </div>
  );
}