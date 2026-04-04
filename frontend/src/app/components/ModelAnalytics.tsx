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

/** Shape of the /api/analytics/performance backend response */
type AnalyticsBackendData = {
  performance_metrics?: {
    average_latency_rtf: number;
    average_wer: number;
    gpu_load_percent: number;
  };
  inference_by_length?: {
    length: string;
    whisper: number;
    conformer: number;
    wav2vec2: number;
  }[];
};

export function ModelAnalytics() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModels, setSelectedModels] = useState({ whisper: true, vibeVoice: true, azure: false });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsBackendData | null>(null);
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
            setInferenceData(
              (backendData.inference_by_length ?? []).map(
                ({ length, whisper, conformer, wav2vec2 }: NonNullable<AnalyticsBackendData['inference_by_length']>[number]) => ({
                  name: length,
                  whisper,
                  vibeVoice: conformer,
                  azure: wav2vec2,
                })
              )
            );
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 border border-border p-4 rounded-[2px] shadow-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Activity className="text-primary" size={20} />
          <h2 className="text-lg font-bold uppercase tracking-wider underline decoration-primary decoration-2 underline-offset-8">Performance Dashboard</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-[2px] px-3 py-1.5 shrink-0">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Models:</span>
            <button 
              onClick={() => setSelectedModels(prev => ({...prev, whisper: !prev.whisper}))}
              className={cn("text-[10px] px-2 py-0.5 rounded-[2px] border transition-colors uppercase font-bold", selectedModels.whisper ? "bg-primary text-white border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted/50")}
            >
              Whisper V3
            </button>
            <button 
              onClick={() => setSelectedModels(prev => ({...prev, vibeVoice: !prev.vibeVoice}))}
              className={cn("text-[10px] px-2 py-0.5 rounded-[2px] border transition-colors uppercase font-bold", selectedModels.vibeVoice ? "bg-primary text-white border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted/50")}
            >
              VibeVoice
            </button>
          </div>
          
          <Select className="w-36 h-8 text-xs py-0 rounded-[2px]" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </Select>

          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleExportReport}
            className="gap-2 rounded-[2px] h-8 border-border uppercase text-[10px] font-bold"
          >
            <Download size={14} /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex flex-col relative overflow-hidden rounded-[2px] shadow-sm border-border bg-white dark:bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted text-primary rounded-[2px] border border-border">
              <Clock size={20} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Average Latency (RTF)</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{performanceMetrics.latency.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground font-mono uppercase">ratio</span>
          </div>
          <div className="mt-4 flex items-center text-[10px] text-[#16a34a] font-bold bg-[#f0fdf4] dark:bg-[#052c16] w-max px-2 py-1 rounded-[2px] uppercase">
            <TrendingDown size={14} className="mr-1" /> -12% Improved
          </div>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden rounded-[2px] shadow-sm border-border bg-white dark:bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted text-primary rounded-[2px] border border-border">
              <Cpu size={20} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity Utilization</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{performanceMetrics.gpu_load.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-mono uppercase">% Load</span>
          </div>
          
          <div className="mt-4 w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{width: `${performanceMetrics.gpu_load}%`}}></div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden rounded-[2px] shadow-sm border-border bg-white dark:bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted text-primary rounded-[2px] border border-border">
              <Zap size={20} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated WER</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{performanceMetrics.wer.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-mono uppercase">% Error</span>
          </div>
          <div className="mt-4 flex items-center text-[10px] text-[#16a34a] font-bold bg-[#f0fdf4] dark:bg-[#052c16] w-max px-2 py-1 rounded-[2px] uppercase">
            <TrendingDown size={14} className="mr-1" /> -0.3% Improved
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6 rounded-[2px] shadow-sm border-border bg-white dark:bg-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Inference Latency Comparison (MS)</h3>
            <p className="text-sm text-muted-foreground mt-1">Benchmarking processing time across audio segments.</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={inferenceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderRadius: '2px', color: chartTooltipText, fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: chartTooltipText }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              {selectedModels.whisper && <Bar dataKey="whisper" name="Whisper V3" fill="#e60000" radius={[0, 0, 0, 0]} barSize={32} />}
              {selectedModels.vibeVoice && <Bar dataKey="vibeVoice" name="VibeVoice PROD" fill="#333333" radius={[0, 0, 0, 0]} barSize={32} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Language-Specific WER Comparison */}
      <Card className="p-6 rounded-[2px] shadow-sm border-border bg-white dark:bg-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Language-Specific Error Rates (%)</h3>
            <p className="text-sm text-muted-foreground mt-1">Linguistic accuracy metrics per dialect.</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={languageData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderRadius: '2px', color: chartTooltipText, fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: chartTooltipText }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              {selectedModels.whisper && <Bar dataKey="whisper" name="Whisper V3" fill="#e60000" radius={[0, 0, 0, 0]} barSize={28} />}
              {selectedModels.vibeVoice && <Bar dataKey="vibeVoice" name="VibeVoice" fill="#333333" radius={[0, 0, 0, 0]} barSize={28} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Time Series Metrics */}
      <Card className="p-6 rounded-[2px] shadow-sm border-border bg-white dark:bg-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">7-Day Latency Drift</h3>
            <p className="text-sm text-muted-foreground mt-1">Inference volatility over time (RTF).</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeSeriesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="day" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderRadius: '2px', color: chartTooltipText, fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: chartTooltipText }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Line type="monotone" dataKey="latency" name="LatencyRTF" stroke="#e60000" strokeWidth={3} connectNulls dot={{ fill: '#e60000', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}