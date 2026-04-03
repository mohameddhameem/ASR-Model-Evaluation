import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, Clock, Cpu, Filter, Zap, TrendingDown, TrendingUp, Download } from "lucide-react";
import { Card, Select, Badge, Button, cn } from "./ui";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const data = [
  { name: "Audio < 10s", whisper: 450, vibeVoice: 120 },
  { name: "Audio 10s-30s", whisper: 1200, vibeVoice: 350 },
  { name: "Audio 30s-1m", whisper: 2500, vibeVoice: 800 },
  { name: "Audio 1m-5m", whisper: 8400, vibeVoice: 2100 },
  { name: "Audio > 5m", whisper: 15600, vibeVoice: 4200 },
];

const languageData = [
  { name: "English", whisper: 3.2, vibeVoice: 4.1, azure: 2.8 },
  { name: "Mandarin", whisper: 5.1, vibeVoice: 6.2, azure: 4.5 },
  { name: "French", whisper: 2.8, vibeVoice: 3.5, azure: 2.4 },
  { name: "Spanish", whisper: 3.0, vibeVoice: 3.8, azure: 2.7 },
  { name: "German", whisper: 2.6, vibeVoice: 3.2, azure: 2.3 },
];

const timeSeriesData = [
  { day: "Mon", latency: 0.085, utilization: 68, wer: 4.2 },
  { day: "Tue", latency: 0.082, utilization: 71, wer: 4.0 },
  { day: "Wed", latency: 0.079, utilization: 74, wer: 3.9 },
  { day: "Thu", latency: 0.081, utilization: 72, wer: 4.1 },
  { day: "Fri", latency: 0.078, utilization: 76, wer: 3.8 },
  { day: "Sat", latency: 0.075, utilization: 62, wer: 3.7 },
  { day: "Sun", latency: 0.080, utilization: 65, wer: 3.9 },
];

export function ModelAnalytics() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModels, setSelectedModels] = useState({ whisper: true, vibeVoice: true, azure: false });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [inferenceData, setInferenceData] = useState(data);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    latency: 0.082, wer: 4.1, gpu_load: 74.2
  });

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/analytics/performance");
        if (response.ok) {
          const backendData = await response.json();
          setAnalyticsData(backendData);
          
          // Update performance metrics
          if (backendData.performance_metrics) {
            setPerformanceMetrics({
              latency: backendData.performance_metrics.average_latency_rtf,
              wer: backendData.performance_metrics.average_wer,
              gpu_load: backendData.performance_metrics.gpu_load_percent
            });
          }
          
          // Update inference data
          if (backendData.inference_by_length) {
            setInferenceData(backendData.inference_by_length.map((item: any) => ({
              name: item.length,
              whisper: item.whisper,
              vibeVoice: item.conformer,
              azure: item.wav2vec2
            })));
          }
        }
      } catch (error) {
        console.warn("Failed to fetch analytics from backend, using local data:", error);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  // Adapt chart colors based on current theme
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const chartAxisColor = isDark ? '#64748b' : '#94a3b8';
  const chartGridColor = isDark ? '#1e293b' : '#e2e8f0';
  const chartTooltipBg = isDark ? '#0f172a' : '#ffffff';
  const chartTooltipBorder = isDark ? '#1e293b' : '#e2e8f0';
  const chartTooltipText = isDark ? '#e2e8f0' : '#0f172a';

  const handleExportReport = () => {
    const report = `ASR Model Analytics Report - ${new Date().toISOString().split('T')[0]}
================================================================================

SUMMARY METRICS:
- Average Latency (RTF): 0.08x Real-Time
- System Utilization: 74.2% GPU Load
- Estimated WER: 4.1% Error Rate

TIME PERIOD: ${timeRange}

INFERENCE TIME BY AUDIO LENGTH:
${data.map(d => `${d.name}: Whisper=${d.whisper}ms, VibeVoice=${d.vibeVoice}ms`).join('\n')}

LANGUAGE-SPECIFIC WER:
${languageData.map(d => `${d.name}: Whisper=${d.whisper}%, VibeVoice=${d.vibeVoice}%, Azure=${d.azure}%`).join('\n')}

Generated on: ${new Date().toISOString()}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asr-analytics-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar / Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
          <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h2 className="text-lg font-semibold">Performance Dashboard</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 shrink-0">
            <Filter size={14} className="text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Models:</span>
            <button 
              onClick={() => setSelectedModels(prev => ({...prev, whisper: !prev.whisper}))}
              className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors", selectedModels.whisper ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold" : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800")}
            >
              Whisper V3
            </button>
            <button 
              onClick={() => setSelectedModels(prev => ({...prev, vibeVoice: !prev.vibeVoice}))}
              className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors", selectedModels.vibeVoice ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold" : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800")}
            >
              VibeVoice
            </button>
            <button 
              onClick={() => setSelectedModels(prev => ({...prev, azure: !prev.azure}))}
              className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors", selectedModels.azure ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold" : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800")}
            >
              Azure
            </button>
          </div>
          
          <Select className="w-36 h-8 text-xs py-0" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </Select>

          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleExportReport}
            className="gap-2"
          >
            <Download size={14} /> Export
          </Button>
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
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{performanceMetrics.latency.toFixed(2)}</span>
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
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{performanceMetrics.gpu_load.toFixed(1)}</span>
            <span className="text-sm text-slate-500 font-medium">% GPU Load</span>
          </div>
          
          <div className="mt-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${performanceMetrics.gpu_load}%`}}></div>
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
            <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{performanceMetrics.wer.toFixed(1)}</span>
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
              data={inferenceData}
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
              {selectedModels.whisper && <Bar dataKey="whisper" name="Whisper V3 Large" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />}
              {selectedModels.vibeVoice && <Bar dataKey="vibeVoice" name="VibeVoice" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />}
              {selectedModels.azure && <Bar dataKey="azure" name="Azure" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Language-Specific WER Comparison */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">Word Error Rate by Language (%)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Performance across different languages and dialects.</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={languageData}
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
              {selectedModels.whisper && <Bar dataKey="whisper" name="Whisper V3" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={35} />}
              {selectedModels.vibeVoice && <Bar dataKey="vibeVoice" name="VibeVoice" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} />}
              {selectedModels.azure && <Bar dataKey="azure" name="Azure" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={35} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Time Series Metrics */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">7-Day Performance Trend</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Latency trend (RTF) over the past week.</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeSeriesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="day" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderRadius: '8px', color: chartTooltipText }}
                itemStyle={{ color: chartTooltipText }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="latency" name="Latency (RTF)" stroke="#6366f1" strokeWidth={2} connectNulls dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}