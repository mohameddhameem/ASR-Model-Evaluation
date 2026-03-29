import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Mic, Headphones, BarChart2, Globe, Menu, ChevronLeft, Bot, Sun, Moon, Settings as SettingsIcon, User, BrainCircuit, ServerCog, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "./ui";
import { DatasetSidebar } from "./DatasetSidebar";

export type DatasetItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  duration?: string;
  transcriptionVerified: boolean;
  lidVerified: boolean;
  detectedLanguage?: string;
  verifiedLanguage?: string;
  uploadDate: string;
};

export type UserPreferences = {
  asrModel: string;
  lidModel: string;
  contextWords: string;
  enableSampling: boolean;
  temperature: number;
  topP: number;
};

export type AppContextType = {
  datasets: DatasetItem[];
  addDatasetItem: (item: DatasetItem) => void;
  updateDatasetItem: (id: string, updates: Partial<DatasetItem>) => void;
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string) => void;
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: UserPreferences) => void;
};

const navItems = [
  { path: "/", label: "Evaluation Workbench", icon: Mic },
  { path: "/operations", label: "Operations Dashboard", icon: ServerCog },
  { path: "/datasets", label: "Dataset Overview", icon: Database },
  { path: "/training", label: "Speech Training", icon: Headphones },
  { path: "/language-id", label: "Language ID Training", icon: Globe },
  { path: "/retraining", label: "Model Retraining", icon: BrainCircuit },
  { path: "/analytics", label: "Model Analytics", icon: BarChart2 },
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
  topP: 0.95
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(true); 
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Shared global states
  const [datasets, setDatasets] = useState<DatasetItem[]>(INITIAL_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>("ds-001");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [loading, setLoading] = useState(true);

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

  const hideSidebarRoutes = ["/operations", "/datasets"];
  const showDatasetSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans transition-colors duration-200">
      {/* Primary Sidebar (Navigation) */}
      <aside
        className={cn(
          "flex flex-col bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950/50">
          {!collapsed && (
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 px-1 overflow-hidden whitespace-nowrap">
              <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={14} className="text-white" />
              </div>
              <span>ASR Platform</span>
            </div>
          )}
          {collapsed && (
            <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center mx-auto shrink-0 shadow-sm">
              <Bot size={14} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap group relative",
                  isActive
                    ? "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 whitespace-nowrap overflow-hidden bg-white dark:bg-slate-950/50">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              System Online
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-200">
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-slate-50 dark:bg-slate-900/50 backdrop-blur shrink-0">
          <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            {navItems.find((i) => i.path === location.pathname)?.label || 
             (location.pathname === "/settings" && "Global Settings") || 
             "ASR Platform"}
          </h1>
          
          {/* User & Settings Panel */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
            
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Jane Doe</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">AI Researcher</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shadow-sm cursor-pointer">
                <User size={16} />
              </div>
              <button 
                onClick={() => navigate("/settings")}
                className={cn(
                  "p-1.5 transition-colors rounded-md", 
                  location.pathname === "/settings" ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-transparent">
          <Outlet context={{ 
            datasets, 
            addDatasetItem, 
            updateDatasetItem, 
            activeDatasetId, 
            setActiveDatasetId,
            userPreferences,
            updateUserPreferences: setUserPreferences
          } satisfies AppContextType} />
        </div>
      </main>
    </div>
  );
}