import { useState } from "react";
import { useOutletContext } from "react-router";
import { BrainCircuit, CheckSquare, Square, PlayCircle, Settings2 } from "lucide-react";
import { Card, Button, Badge, cn } from "./ui";
import type { AppContextType } from "./Layout";

export function ModelRetraining() {
  const { datasets } = useOutletContext<AppContextType>();
  const [activeTab, setActiveTab] = useState<"transcription" | "lid">("transcription");
  
  // State for selected datasets
  const [selectedTranscription, setSelectedTranscription] = useState<Set<string>>(new Set());
  const [selectedLid, setSelectedLid] = useState<Set<string>>(new Set());

  // Filter datasets based on what is human verified
  const transcriptionReady = datasets.filter(d => d.transcriptionVerified);
  const lidReady = datasets.filter(d => d.lidVerified);

  const toggleSelection = (id: string, type: "transcription" | "lid") => {
    const set = type === "transcription" ? selectedTranscription : selectedLid;
    const newSet = new Set(set);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    
    if (type === "transcription") setSelectedTranscription(newSet);
    else setSelectedLid(newSet);
  };

  const selectAll = (type: "transcription" | "lid") => {
    if (type === "transcription") {
      if (selectedTranscription.size === transcriptionReady.length) setSelectedTranscription(new Set());
      else setSelectedTranscription(new Set(transcriptionReady.map(d => d.id)));
    } else {
      if (selectedLid.size === lidReady.length) setSelectedLid(new Set());
      else setSelectedLid(new Set(lidReady.map(d => d.id)));
    }
  };

  const currentReady = activeTab === "transcription" ? transcriptionReady : lidReady;
  const currentSelected = activeTab === "transcription" ? selectedTranscription : selectedLid;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600 dark:text-indigo-400" /> Model Retraining Pipeline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select human-verified datasets to initiate fine-tuning jobs for your ASR models.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 px-6" disabled={currentSelected.size === 0}>
          <PlayCircle size={18} className="mr-2" /> Start Retraining Job
        </Button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab("transcription")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "transcription" 
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400" 
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          )}
        >
          Transcription Fine-Tuning
          <Badge className="ml-2 bg-slate-100 dark:bg-slate-800">{transcriptionReady.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab("lid")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "lid" 
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400" 
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          )}
        >
          Language ID Fine-Tuning
          <Badge className="ml-2 bg-slate-100 dark:bg-slate-800">{lidReady.length}</Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => selectAll(activeTab)}
                  className="text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  {currentSelected.size === currentReady.length && currentReady.length > 0 ? (
                    <CheckSquare size={20} className="text-indigo-600" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Select Verified Datasets ({currentSelected.size} selected)
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-slate-800/50 max-h-[500px] overflow-y-auto">
              {currentReady.length === 0 ? (
                <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                  No human-verified datasets available for this task.
                  <br/>Complete evaluations in the Training tabs first.
                </div>
              ) : (
                currentReady.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => toggleSelection(item.id, activeTab)}
                    className={cn(
                      "flex items-center gap-4 p-4 cursor-pointer transition-colors",
                      currentSelected.has(item.id) 
                        ? "bg-indigo-50/50 dark:bg-indigo-900/10" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-900/30"
                    )}
                  >
                    <div className="shrink-0">
                      {currentSelected.has(item.id) ? (
                        <CheckSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{item.name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span>{item.duration}</span>
                        {activeTab === "lid" && item.verifiedLanguage && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified: {item.verifiedLanguage.toUpperCase()}</span>
                        )}
                        {activeTab === "transcription" && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Annotated Segments</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Settings2 size={16} className="text-indigo-500" /> Training Configuration
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">Base Model</label>
                <select className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 shadow-sm text-slate-900 dark:text-slate-100">
                  <option>VibeVoice v2 (Production)</option>
                  <option>Whisper V3 Large</option>
                  <option>Auto-Fast Standard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">Learning Rate</label>
                <select className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 shadow-sm text-slate-900 dark:text-slate-100">
                  <option>1e-5 (Default)</option>
                  <option>5e-6 (Conservative)</option>
                  <option>3e-5 (Aggressive)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">Epochs</label>
                <input 
                  type="number" 
                  defaultValue={3} 
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 shadow-sm text-slate-900 dark:text-slate-100" 
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Selected Audio Data:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    ~{currentSelected.size * 5} mins
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Est. Compute Time:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {currentSelected.size === 0 ? "0 mins" : "~45 mins"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}