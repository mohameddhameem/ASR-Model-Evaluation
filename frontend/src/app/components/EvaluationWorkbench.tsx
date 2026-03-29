import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { Play, Square, Code, AlignLeft, ListMusic, Database, Info, FileAudio } from "lucide-react";
import { Card, Button, Label, Select, Textarea, cn } from "./ui";
import type { AppContextType } from "./Layout";

const mockSegments = [
  { id: 1, start: 0.0, end: 2.5, speaker: "Speaker 0", text: "I feel like this is my second home." },
  { id: 2, start: 2.5, end: 5.1, speaker: "Speaker 1", text: "That's exactly what we wanted to achieve with the new design." },
  { id: 3, start: 5.1, end: 8.4, speaker: "Speaker 0", text: "It really shows. The latency has improved dramatically since the last update." },
  { id: 4, start: 8.4, end: 11.0, speaker: "Speaker 1", text: "We're aiming for sub-200 milliseconds by Q3." },
];

export function EvaluationWorkbench() {
  const { datasets, activeDatasetId, userPreferences } = useOutletContext<AppContextType>();
  const [activeTab, setActiveTab] = useState<"raw" | "segments" | "translation">("segments");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  
  // Local state initialized with user preferences
  const [model, setModel] = useState(userPreferences.asrModel);
  const [contextWords, setContextWords] = useState(userPreferences.contextWords);
  const [enableSampling, setEnableSampling] = useState(userPreferences.enableSampling);
  const [temperature, setTemperature] = useState(userPreferences.temperature);
  const [topP, setTopP] = useState(userPreferences.topP);

  // Sync when global preferences change
  useEffect(() => {
    setModel(userPreferences.asrModel);
    setContextWords(userPreferences.contextWords);
    setEnableSampling(userPreferences.enableSampling);
    setTemperature(userPreferences.temperature);
    setTopP(userPreferences.topP);
  }, [userPreferences]);
  
  const selectedFile = datasets.find(d => d.id === activeDatasetId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Panel - Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Selected Media Info */}
        <Card className="p-5 flex flex-col h-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database size={16} className="text-indigo-600 dark:text-indigo-400" />
              Active Media Source
            </h3>
          </div>
          
          {selectedFile ? (
            <div className="flex flex-col flex-1 justify-center items-center text-center p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                <FileAudio size={24} />
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1 break-all line-clamp-2">
                {selectedFile.name}
              </p>
              <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span>{selectedFile.duration}</span>
                <span>•</span>
                <span>{selectedFile.type.split('/')[1]?.toUpperCase() || 'Audio'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 justify-center items-center text-center p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <Info size={24} className="text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">No media selected.</p>
              <p className="text-xs text-slate-500 mt-1">Select or upload a file from the Dataset Manager sidebar.</p>
            </div>
          )}
        </Card>

        {/* Card 2: Model & Context */}
        <Card className="p-5 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ListMusic size={16} className="text-indigo-600 dark:text-indigo-400" />
            Model & Context
          </h3>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="auto">Auto-Fast</option>
                  <option value="whisper">Whisper V3 Large</option>
                  <option value="vibe">VibeVoice</option>
                  <option value="azure">Azure</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <option value="auto">Auto-Detect</option>
                  <option value="en">English</option>
                  <option value="zh">Mandarin</option>
                  <option value="yue">Cantonese</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="it">Italian</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5 mt-auto pt-2">
              <Label>Customized Context Words</Label>
              <Textarea
                placeholder="Comma-separated keywords, jargon, or names..."
                className="h-20 resize-none text-xs"
                value={contextWords}
                onChange={(e) => setContextWords(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Sampling Controls */}
        <Card className="p-5 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlignLeft size={16} className="text-indigo-600 dark:text-indigo-400" />
            Sampling Controls
          </h3>
          <div className="space-y-5 flex-1">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label className="text-slate-800 dark:text-slate-200">Enable Sampling</Label>
                <p className="text-xs text-slate-500">Use probabilistic decoding</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={enableSampling}
                  onChange={(e) => setEnableSampling(e.target.checked)} 
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className={cn("space-y-4 transition-opacity", !enableSampling && "opacity-50 pointer-events-none")}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{temperature.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top-p</Label>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{topP.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sticky top-0 z-10 shadow-sm dark:shadow-black/20">
        <Button 
          className="flex-1 sm:flex-none sm:w-48 text-base shadow-indigo-600/20 shadow-lg"
          onClick={() => {
            setIsTranscribing(true);
            setTimeout(() => { setIsTranscribing(false); setHasResults(true); }, 1500);
          }}
          disabled={isTranscribing || !selectedFile}
        >
          {isTranscribing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play size={18} />
              Transcribe
            </span>
          )}
        </Button>
        <Button variant="danger" className="px-6" disabled={!isTranscribing}>
          <Square size={16} className="mr-2" fill="currentColor" /> Stop
        </Button>
        {hasResults && !isTranscribing && (
          <div className="ml-auto text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-medium bg-emerald-100 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Analysis Complete (1.2s)
          </div>
        )}
      </div>

      {/* Results Area */}
      {hasResults && (
        <Card className="min-h-[400px] flex flex-col">
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex overflow-x-auto p-1 rounded-t-xl">
            <button
              onClick={() => setActiveTab("raw")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "raw" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <Code size={16} /> Raw Output
            </button>
            <button
              onClick={() => setActiveTab("segments")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "segments" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <ListMusic size={16} /> Audio Segments
            </button>
            <button
              onClick={() => setActiveTab("translation")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "translation" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <AlignLeft size={16} /> Translation & Summary
            </button>
          </div>

          <div className="p-4 flex-1 bg-white dark:bg-slate-950 rounded-b-xl">
            {activeTab === "raw" && (
              <pre className="p-4 bg-slate-50 dark:bg-[#0d1117] rounded-lg text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-auto border border-slate-200 dark:border-slate-800 max-h-[500px]">
                {JSON.stringify({ model: model, duration: 11.0, language: "en", confidence: 0.98, segments: mockSegments }, null, 2)}
              </pre>
            )}

            {activeTab === "segments" && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {mockSegments.map((seg) => (
                  <div key={seg.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-500/30">
                          {seg.speaker}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                          {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{seg.text}</p>
                    </div>
                    <div className="sm:w-64 shrink-0 flex items-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                      <audio controls className="w-full h-8 max-w-full" src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU5LjI3LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwBRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVF">
                        {/* Mock audio */}
                      </audio>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "translation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                <div className="flex flex-col">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Line-by-Line Translation</h4>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4 overflow-y-auto">
                    {mockSegments.map((seg, i) => (
                      <div key={i} className="space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800/50 last:border-0 last:pb-0">
                        <p className="text-sm text-slate-700 dark:text-slate-400">{seg.text}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">{"[Translated content mock based on input language to target]"}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Summary</h4>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 prose prose-slate dark:prose-invert prose-sm max-w-none">
                    <h3 className="text-slate-900 dark:text-slate-200 mt-0">Conversation Overview</h3>
                    <p className="text-slate-700 dark:text-slate-400">
                      The speakers discussed their satisfaction with the current iteration of the system design, highlighting that it feels like a "second home". 
                    </p>
                    <ul className="text-slate-700 dark:text-slate-400 marker:text-indigo-600 dark:marker:text-indigo-400">
                      <li>Latency improvements recognized by Speaker 0.</li>
                      <li>Speaker 1 outlined a goal for <strong>sub-200ms</strong> latency by Q3.</li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">Generated via abstractive summarization.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}