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
        <h2 className="text-lg font-bold text-foreground mb-1 uppercase tracking-wider underline decoration-primary decoration-2 underline-offset-8">Training Pipeline</h2>
        <p className="text-sm text-muted-foreground mt-4">
          A guided high-precision workflow to verify transcriptions and confirm language identifiers before model optimization.
        </p>
      </div>

      {/* Step Tabs */}
      <div className="flex items-center gap-0">
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDone = (tab.id === "transcription" && transcriptionVerified === datasets.length) ||
                         (tab.id === "language-id" && lidVerified === datasets.length) ||
                         (tab.id === "retraining" && retrainingStatus === "done");
          return (
            <div key={tab.id} className="flex items-center flex-1">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-4 rounded-[2px] border transition-all text-left relative",
                  isActive
                    ? "border-primary bg-white dark:bg-card shadow-sm"
                    : "border-border bg-muted/30 hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0 text-sm font-bold border transition-colors",
                  isDone ? "bg-[#16a34a] border-[#16a34a] text-white" :
                  isActive ? "bg-primary border-primary text-white" :
                  "bg-muted border-border text-muted-foreground"
                )}>
                  {isDone ? <CheckCircle2 size={14} /> : tab.step}
                </div>
                <div>
                  <div className={cn("text-sm font-bold", isActive ? "text-primary" : "text-muted-foreground")}>
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground hidden sm:block opacity-70">{tab.desc}</div>
                </div>
                {isActive && <div className="absolute top-0 left-0 w-full h-[2px] bg-primary"></div>}
              </button>
              {idx < TABS.length - 1 && (
                <div className="w-8 flex justify-center shrink-0">
                  <ArrowRight size={14} className="text-muted-foreground/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "transcription" && (
        <Card className="bg-white dark:bg-card border-border overflow-hidden rounded-[2px] shadow-sm">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Speech Training Review</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{transcriptionVerified}/{datasets.length} files verified</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-[2px]">Step 1</Badge>
          </div>
          <div className="divide-y divide-border">
            {datasets.map(ds => (
              <div key={ds.id} className="p-4 flex items-center gap-4 group hover:bg-muted/30 transition-colors">
                <div className={cn("p-2 rounded-[2px]", ds.transcriptionVerified ? "bg-[#f0fdf4] dark:bg-[#052c16]" : "bg-muted")}>
                  <Headphones size={16} className={ds.transcriptionVerified ? "text-[#16a34a]" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{ds.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {ds.duration} · {ds.verifiedLanguage?.toUpperCase() || ds.detectedLanguage?.toUpperCase()}
                  </p>
                </div>
                {ds.transcriptionVerified ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16a34a]">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity border-border text-primary rounded-[2px]"
                    onClick={() => updateDatasetItem(ds.id, { transcriptionVerified: true })}
                  >
                    <CheckCircle2 size={14} className="mr-1" /> Mark Verified
                  </Button>
                )}
              </div>
            ))}
          </div>
          {transcriptionVerified > 0 && transcriptionVerified === datasets.length && (
            <div className="p-4 border-t border-border bg-[#f0fdf4]/50 dark:bg-[#052c16]/10">
              <p className="text-xs text-[#16a34a] flex items-center gap-2 font-medium">
                <CheckCircle2 size={14} /> All files verified. Proceed to Step 2: Language ID Review →
              </p>
            </div>
          )}
        </Card>
      )}

      {activeTab === "language-id" && (
        <Card className="bg-white dark:bg-card border-border overflow-hidden rounded-[2px] shadow-sm">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Language ID Review</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{lidVerified}/{datasets.length} files confirmed</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-[2px]">Step 2</Badge>
          </div>
          <div className="divide-y divide-border">
            {datasets.map(ds => (
              <div key={ds.id} className="p-4 flex items-center gap-4 group hover:bg-muted/30 transition-colors">
                <div className={cn("p-2 rounded-[2px]", ds.lidVerified ? "bg-[#f0fdf4] dark:bg-[#052c16]" : "bg-muted")}>
                  <Globe size={16} className={ds.lidVerified ? "text-[#16a34a]" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{ds.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-[2px] font-bold uppercase border border-border">
                      Auto: {ds.detectedLanguage || "Unknown"}
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <Label className="text-[11px] text-muted-foreground">Verify as:</Label>
                        <Select 
                            value={ds.verifiedLanguage || ds.detectedLanguage} 
                            onChange={(e) => updateDatasetItem(ds.id, { verifiedLanguage: e.target.value })}
                            className="h-7 text-[10px] py-0 rounded-[2px] min-w-[100px]"
                            disabled={ds.lidVerified}
                        >
                            <option value="en">English</option>
                            <option value="zh">Mandarin</option>
                            <option value="yue">Cantonese</option>
                            <option value="de">German</option>
                            <option value="fr">French</option>
                            <option value="it">Italian</option>
                        </Select>
                    </div>
                  </div>
                </div>
                {ds.lidVerified ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16a34a]">
                    <CheckCircle2 size={14} /> Confirmed
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    className="border-primary text-white rounded-[2px] px-6"
                    onClick={() => updateDatasetItem(ds.id, { lidVerified: true, verifiedLanguage: ds.verifiedLanguage || ds.detectedLanguage })}
                  >
                    Confirm
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
            <Card className="bg-white dark:bg-card border-border overflow-hidden rounded-[2px] shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Retraining Candidate Set</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{bothVerified} file(s) fully verified</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-[2px]">Step 3</Badge>
              </div>
              {bothVerified === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-[2px] bg-muted flex items-center justify-center text-muted-foreground mb-2">
                    <Info size={24} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No fully verified datasets yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Complete both transcription verification and language identification to mark files as ready for training.</p>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab("transcription")} className="mt-4 rounded-[2px]">
                    ← Return to Step 1
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {datasets.filter(d => d.transcriptionVerified && d.lidVerified).map(ds => (
                    <div key={ds.id} className="p-4 flex items-center gap-4">
                      <div className="p-2 rounded-[2px] bg-[#f0fdf4] dark:bg-[#052c16]">
                        <CheckCircle2 size={16} className="text-[#16a34a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{ds.name}</p>
                        <p className="text-[11px] text-muted-foreground">{ds.duration} · {ds.verifiedLanguage?.toUpperCase() || ds.detectedLanguage?.toUpperCase()}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded-[2px] border border-border">{ds.duration}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white dark:bg-card border-border p-5 space-y-4 rounded-[2px] shadow-sm">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Training Configuration</h4>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Target Architecture</Label>
                <Select value={baseModel} onChange={e => setBaseModel(e.target.value)} className="h-9 text-sm rounded-[2px]">
                  <option value="vibevoice-v2">UBS VibeVoice v2 (PROD)</option>
                  <option value="whisper-v3">Whisper V3 Large</option>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Learning Rate</Label>
                  <span className="text-[10px] font-mono text-primary font-bold">{learningRate.toExponential(1)}</span>
                </div>
                <input 
                  type="range" min="-6" max="-3" step="0.5" 
                  value={Math.log10(learningRate)}
                  onChange={(e) => setLearningRate(Math.pow(10, parseFloat(e.target.value)))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-[2px] appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                  <span>1E-6</span>
                  <span>1E-3</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Batch Size</Label>
                  <span className="text-[10px] font-mono text-primary font-bold">{batchSize}</span>
                </div>
                <input 
                  type="range" min="1" max="64" step="1" 
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-[2px] appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                  <span>1</span>
                  <span>64</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Epochs</Label>
                <input type="number" min="1" max="20" value={epochs} onChange={e => setEpochs(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-[2px] border border-border bg-white dark:bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="py-3 space-y-1 border-t border-border text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Selected Training Data</span><span className="text-foreground font-medium">~{bothVerified * 8} mins</span></div>
                <div className="flex justify-between"><span>Estimated Compute</span><span className="text-foreground font-medium">{bothVerified * 12} mins</span></div>
              </div>
              <div className="pt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm disabled:opacity-50 rounded-[2px] h-10 uppercase text-xs font-bold tracking-widest"
                  disabled={bothVerified === 0 || retrainingStatus === "running"}
                  onClick={handleStartRetraining}
                >
                  {retrainingStatus === "idle" && <><Play size={14} className="mr-2" /> Start Optimization</>}
                  {retrainingStatus === "running" && <><RefreshCw size={14} className="mr-2 animate-spin" /> Processing...</>}
                  {retrainingStatus === "done" && <><CheckCircle2 size={14} className="mr-2" /> Optimization Complete</>}
                </Button>
              </div>

              {retrainingStatus === "running" && (
                <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <span>Training Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{trainingProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out" 
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
