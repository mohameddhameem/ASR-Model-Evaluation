import { useState } from "react";
import { useOutletContext } from "react-router";
import { Headphones, Globe, BrainCircuit, CheckCircle2, XCircle, Play, RefreshCw, ArrowRight, Info } from "lucide-react";
import { Card, Button, Select, Label, cn, Badge } from "./ui";
import type { AppContextType } from "./Layout";

type PipelineTab = "transcription" | "language-id" | "retraining";

const TABS: { id: PipelineTab; label: string; icon: typeof Headphones; step: number; desc: string }[] = [
  {
    id: "transcription",
    label: "Speech Training",
    icon: Headphones,
    step: 1,
    desc: "Listen to audio and verify or correct the ASR-generated transcriptions."
  },
  {
    id: "language-id",
    label: "Language ID Review",
    icon: Globe,
    step: 2,
    desc: "Confirm or override the detected language for each audio file."
  },
  {
    id: "retraining",
    label: "Model Retraining",
    icon: BrainCircuit,
    step: 3,
    desc: "Select verified data and trigger a fine-tuning job to improve model accuracy."
  }
];

export function TrainingPipeline() {
  const { datasets, updateDatasetItem, userPreferences } = useOutletContext<AppContextType>();
  const [activeTab, setActiveTab] = useState<PipelineTab>("transcription");
  const [baseModel, setBaseModel] = useState("vibevoice-v2");
  const [learningRate, setLearningRate] = useState(0.00001);
  const [batchSize, setBatchSize] = useState(8);
  const [epochs, setEpochs] = useState("3");
  const [retrainingStatus, setRetrainingStatus] = useState<"idle" | "running" | "done">("idle");
  const [trainingProgress, setTrainingProgress] = useState(0);

  const transcriptionVerified = datasets.filter(d => d.transcriptionVerified).length;
  const lidVerified = datasets.filter(d => d.lidVerified).length;
  const bothVerified = datasets.filter(d => d.transcriptionVerified && d.lidVerified).length;

  const handleStartRetraining = () => {
    if (bothVerified === 0) return;
    setRetrainingStatus("running");
    setTrainingProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRetrainingStatus("done");
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Pipeline Progress Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Training Pipeline</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A guided 3-step workflow to verify your data and improve ASR model accuracy.
        </p>
      </div>

      {/* Step Tabs */}
      <div className="flex items-center gap-0">
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDone = (tab.id === "transcription" && transcriptionVerified > 0) ||
                         (tab.id === "language-id" && lidVerified > 0) ||
                         (tab.id === "retraining" && retrainingStatus === "done");
          return (
            <div key={tab.id} className="flex items-center flex-1">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  isActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border-2 transition-colors",
                  isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                  isActive ? "bg-indigo-600 border-indigo-600 text-white" :
                  "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500"
                )}>
                  {isDone ? <CheckCircle2 size={14} /> : tab.step}
                </div>
                <div>
                  <div className={cn("text-sm font-bold", isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300")}>
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden sm:block">{tab.desc}</div>
                </div>
              </button>
              {idx < TABS.length - 1 && (
                <ArrowRight size={16} className="text-slate-300 dark:text-slate-700 mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "transcription" && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Transcription Fine-Tuning</h3>
              <p className="text-xs text-slate-500 mt-0.5">{transcriptionVerified}/{datasets.length} verified</p>
            </div>
            <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">Step 1</Badge>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {datasets.map(ds => (
              <div key={ds.id} className="p-4 flex items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className={cn("p-2 rounded-lg", ds.transcriptionVerified ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800")}>
                  <Headphones size={16} className={ds.transcriptionVerified ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-200 truncate">{ds.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ds.duration} · {ds.detectedLanguage?.toUpperCase()}
                  </p>
                </div>
                {ds.transcriptionVerified ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    onClick={() => updateDatasetItem(ds.id, { transcriptionVerified: true })}
                  >
                    <CheckCircle2 size={14} className="mr-1" /> Mark Verified
                  </Button>
                )}
              </div>
            ))}
          </div>
          {transcriptionVerified > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={14} /> {transcriptionVerified} file(s) verified. Proceed to Language ID Review →
              </p>
            </div>
          )}
        </Card>
      )}

      {activeTab === "language-id" && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Language ID Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">{lidVerified}/{datasets.length} confirmed</p>
            </div>
            <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">Step 2</Badge>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {datasets.map(ds => (
              <div key={ds.id} className="p-4 flex items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className={cn("p-2 rounded-lg", ds.lidVerified ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800")}>
                  <Globe size={16} className={ds.lidVerified ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-200 truncate">{ds.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Detected: <span className="font-bold uppercase">{ds.detectedLanguage || "Unknown"}</span>
                    {ds.verifiedLanguage && ds.verifiedLanguage !== ds.detectedLanguage &&
                      <span className="text-amber-500 ml-2">→ Corrected to <span className="font-bold">{ds.verifiedLanguage.toUpperCase()}</span></span>
                    }
                  </p>
                </div>
                {ds.lidVerified ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} /> Confirmed
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    onClick={() => updateDatasetItem(ds.id, { lidVerified: true, verifiedLanguage: ds.detectedLanguage })}
                  >
                    <CheckCircle2 size={14} className="mr-1" /> Confirm
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "retraining" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Ready for Retraining</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{bothVerified} file(s) with both transcription & LID verified</p>
                </div>
                <Badge className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Step 3</Badge>
              </div>
              {bothVerified === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <Info size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No fully verified datasets yet</p>
                  <p className="text-xs text-slate-400 max-w-xs">Complete Steps 1 & 2 to mark files as verified before triggering a retraining job.</p>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab("transcription")} className="mt-2">
                    ← Go to Step 1
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {datasets.filter(d => d.transcriptionVerified && d.lidVerified).map(ds => (
                    <div key={ds.id} className="p-4 flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-200 truncate">{ds.name}</p>
                        <p className="text-[11px] text-slate-500">{ds.duration} · {ds.verifiedLanguage?.toUpperCase() || ds.detectedLanguage?.toUpperCase()}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ds.duration}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Training Configuration</h4>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Base Model</Label>
                <Select value={baseModel} onChange={e => setBaseModel(e.target.value)} className="h-9 text-sm">
                  <option value="vibevoice-v2">VibeVoice v2 (Production)</option>
                  <option value="whisper-v3">Whisper V3 Large</option>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-500">Learning Rate</Label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{learningRate.toExponential(1)}</span>
                </div>
                <input 
                  type="range" min="-6" max="-3" step="0.5" 
                  value={Math.log10(learningRate)}
                  onChange={(e) => setLearningRate(Math.pow(10, parseFloat(e.target.value)))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>1e-6</span>
                  <span>1e-3</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-500">Batch Size</Label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{batchSize}</span>
                </div>
                <input 
                  type="range" min="1" max="64" step="1" 
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>1</span>
                  <span>64</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Epochs</Label>
                <input type="number" min="1" max="20" value={epochs} onChange={e => setEpochs(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="py-2 space-y-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex justify-between"><span>Selected Data</span><span className="text-slate-700 dark:text-slate-300 font-medium">~{bothVerified * 8} mins</span></div>
                <div className="flex justify-between"><span>Est. Compute</span><span className="text-slate-700 dark:text-slate-300 font-medium">{bothVerified * 12} mins</span></div>
              </div>
              <div className="pt-2">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 disabled:opacity-50"
                  disabled={bothVerified === 0 || retrainingStatus === "running"}
                  onClick={handleStartRetraining}
                >
                  {retrainingStatus === "idle" && <><Play size={14} className="mr-2" /> Start Retraining Job</>}
                  {retrainingStatus === "running" && <><RefreshCw size={14} className="mr-2 animate-spin" /> Training...</>}
                  {retrainingStatus === "done" && <><CheckCircle2 size={14} className="mr-2" /> Job Complete!</>}
                </Button>
              </div>

              {retrainingStatus === "running" && (
                <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <span>Training Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{trainingProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer transition-all duration-300 ease-out" 
                      style={{ width: `${trainingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {retrainingStatus === "done" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg animate-in zoom-in-95 duration-300">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 text-center font-medium">Model updated. Check Analytics for new performance metrics.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
