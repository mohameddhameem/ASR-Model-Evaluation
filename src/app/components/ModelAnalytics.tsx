import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Clock, Cpu, Filter, Zap, TrendingDown } from "lucide-react";
import { Card, Select, Badge } from "./ui";
import { useTheme } from "next-themes";

const data = [
  { name: "Audio < 10s", whisper: 450, vibeVoice: 120 },
  { name: "Audio 10s-30s", whisper: 1200, vibeVoice: 350 },
  { name: "Audio 30s-1m", whisper: 2500, vibeVoice: 800 },
  { name: "Audio 1m-5m", whisper: 8400, vibeVoice: 2100 },
  { name: "Audio > 5m", whisper: 15600, vibeVoice: 4200 },
];

export function ModelAnalytics() {
  const { theme } = useTheme();
  
  // Adapt chart colors based on current theme
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const chartAxisColor = isDark ? '#64748b' : '#94a3b8';
  const chartGridColor = isDark ? '#1e293b' : '#e2e8f0';
  const chartTooltipBg = isDark ? '#0f172a' : '#ffffff';
  const chartTooltipBorder = isDark ? '#1e293b' : '#e2e8f0';
  const chartTooltipText = isDark ? '#e2e8f0' : '#0f172a';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar / Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
          <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h2 className="text-lg font-semibold">Performance Dashboard</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5">
            <Filter size={14} className="text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Models:</span>
            <Badge variant="default" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">Whisper V3</Badge>
            <Badge variant="default" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">VibeVoice</Badge>
          </div>
          
          <Select className="w-36 h-8 text-xs py-0">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </Select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Latency (RTF)</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">0.08</span>
            <span className="text-sm text-slate-500 font-medium">x Real-Time</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-900/20 w-max px-2 py-1 rounded">
            <TrendingDown size={14} className="mr-1" /> -12% vs last week
          </div>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-500/20">
              <Cpu size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">System Utilization</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">74.2</span>
            <span className="text-sm text-slate-500 font-medium">% GPU Load</span>
          </div>
          
          <div className="mt-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full w-[74.2%]"></div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-500/20">
              <Zap size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Estimated WER</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">4.1</span>
            <span className="text-sm text-slate-500 font-medium">% Error Rate</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-900/20 w-max px-2 py-1 rounded">
            <TrendingDown size={14} className="mr-1" /> -0.3% vs last week
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">Inference Time Comparison (ms)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Comparing processing duration across audio length buckets.</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderRadius: '8px', color: chartTooltipText }}
                itemStyle={{ color: chartTooltipText }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="whisper" name="Whisper V3 Large" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="vibeVoice" name="VibeVoice" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}