import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router";
import { UploadCloud, ServerCog, Play, Square, CheckSquare, Layers, Search, Database, FileAudio, Settings2, Filter, AlertCircle, Download, TrendingUp, RefreshCw } from "lucide-react";
import { Card, Button, Input, Select, Label, cn, Badge } from "./ui";
import type { AppContextType, DatasetItem } from "../../types";
import { MOCK_PROCESSING_QUEUE } from "../../constants/mockData";
import type { MockProcessingJob } from "../../constants/mockData";

type Segment = {
  id: string;
  start: number;
  end: number;
  speaker: string;
  transcription: string;
  translation: string;
};

type ProcessingStage = "idle" | "ingesting" | "acoustic-analysis" | "language-id" | "diarization" | "transcription" | "completed" | "error";

type StagedFile = {
  id: string;
  file: File;
  name: string;
  size: string;
  status: ProcessingStage;
  progress: number;
  uploadDate: string; // ISO format
  results?: {
    language: string;
    confidence: number;
    duration: string;
    numSpeakers: number;
    segments: Segment[];
    snr?: string;
    rtf?: string;
  };
};

/** Narrowing helper: returns true when the item came from the backend queue */
function isBackendJob(item: StagedFile | MockProcessingJob): item is MockProcessingJob {
  return 'job_id' in item;
}

export function OperationsDashboard() {
  const { addDatasetItem, userPreferences } = useOutletContext<AppContextType>();
  
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedStagedIds, setSelectedStagedIds] = useState<Set<string>>(new Set());
  const [globalStatus, setGlobalStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"details" | "summary">("details");
  const [backendQueue, setBackendQueue] = useState<MockProcessingJob[]>([]);

  // Filters for left column
  const [dateFilter, setDateFilter] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Job specific configuration
  const [jobConfig, setJobConfig] = useState({
    asrModel: userPreferences.asrModel,
    lidModel: userPreferences.lidModel,
    targetLanguage: "auto"
  });

  // Fetch processing queue from backend with mock fallback
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/operations/queue");
        if (response.ok) {
          const data = await response.json();
          setBackendQueue(data);
          return;
        }
      } catch (error) {
        console.warn("Failed to fetch processing queue from backend:", error);
      }
      
      // Fallback: use shared mock constant
      setBackendQueue(MOCK_PROCESSING_QUEUE);
    };
    
    fetchQueue();
  }, []);

  // Sync if global preferences change while idle
  useEffect(() => {
    if (globalStatus === "idle") {
      setJobConfig(prev => ({
        ...prev,
        asrModel: userPreferences.asrModel,
        lidModel: userPreferences.lidModel
      }));
    }
  }, [userPreferences, globalStatus]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;

    if (files && files.length > 0) {
      const newFiles: StagedFile[] = Array.from(files).map(file => ({
        id: `stage-${Math.random().toString(36).substring(7)}`,
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        status: "idle",
        progress: 0,
        uploadDate: new Date().toISOString()
      }));
      setStagedFiles(prev => [...prev, ...newFiles]);
      setGlobalStatus("idle");
    }
    // reset input
    e.target.value = "";
  };

  const handleProcessAll = () => {
    setGlobalStatus("processing");
    
    stagedFiles.forEach((file, index) => {
      if (file.status !== "idle") return;
      
      const stages: ProcessingStage[] = [
        "ingesting", 
        "acoustic-analysis", 
        "language-id", 
        "diarization", 
        "transcription", 
        "completed"
      ];
      
      let stageIndex = 0;
      
      const processNextStage = () => {
        if (stageIndex >= stages.length) return;
        
        const nextStage = stages[stageIndex];
        const progress = Math.round(((stageIndex + 1) / stages.length) * 100);
        
        setStagedFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: nextStage, progress } : f
        ));
        
        stageIndex++;
        
        if (nextStage === "completed") {
          // Finalize results
          setStagedFiles(prev => {
            const updated = [...prev];
            const fileIndex = updated.findIndex(f => f.id === file.id);
            if (fileIndex > -1) {
              const lang = jobConfig.targetLanguage === "auto" 
                ? ["en", "fr", "de", "zh"][Math.floor(Math.random() * 4)] 
                : jobConfig.targetLanguage;

              const numSpeakers = Math.floor(Math.random() * 3) + 1;
              const mockDurationSecs = Math.floor(Math.random() * 180) + 30;
              const formattedDuration = `${Math.floor(mockDurationSecs / 60)}:${(mockDurationSecs % 60).toString().padStart(2, '0')}`;

              const mockSegments: Segment[] = [];
              let currentTime = 0;
              for (let i = 0; i < 6; i++) {
                const dur = Math.random() * 4 + 2; 
                mockSegments.push({
                  id: `seg-${Math.random().toString(36).substring(7)}`,
                  start: currentTime,
                  end: currentTime + dur,
                  speaker: `Speaker ${Math.floor(Math.random() * numSpeakers)}`,
                  transcription: `This is a mock transcribed sentence number ${i + 1} for the uploaded media.`,
                  translation: `Ceci est une phrase traduite fictive numéro ${i + 1} pour le média téléchargé.`
                });
                currentTime += dur + (Math.random() * 0.5);
              }

              updated[fileIndex] = {
                ...updated[fileIndex],
                results: {
                  language: lang,
                  confidence: 0.85 + (Math.random() * 0.14),
                  duration: formattedDuration,
                  numSpeakers,
                  segments: mockSegments,
                  snr: (25 + Math.random() * 10).toFixed(1),
                  rtf: (0.05 + Math.random() * 0.05).toFixed(3)
                }
              };
            }
            
            if (updated.every(f => f.status === "completed" || f.status === "error")) {
              setGlobalStatus("completed");
            }
            return updated;
          });
        } else {
          setTimeout(processNextStage, 800 + Math.random() * 1200);
        }
      };
      
      processNextStage();
    });
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedStagedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStagedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedStagedIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedStagedIds(new Set());
    } else {
      // Only staged files (not backend jobs) have selectable ids
      const selectableIds = filteredFiles
        .filter((f): f is StagedFile => !isBackendJob(f))
        .map(f => f.id);
      setSelectedStagedIds(new Set(selectableIds));
    }
  };

  const handleExportProcessed = () => {
    const processed = stagedFiles.filter(f => f.status === "completed");
    
    if (processed.length === 0) {
      alert("No processed files to export");
      return;
    }

    const csvData = processed.map(f => {
      const results = f.results;
      return {
        'File Name': f.name,
        'Duration': results?.duration || 'N/A',
        'Language': results?.language || 'N/A',
        'Confidence': results ? `${(results.confidence * 100).toFixed(1)}%` : 'N/A',
        'Speakers': results?.numSpeakers || 'N/A',
        'Segments': results?.segments?.length || 0
      };
    });

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asr-processing-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSingleFileDownload = (file: StagedFile | MockProcessingJob | undefined) => {
    if (!file) return;
    const isJob = isBackendJob(file);
    const data = {
      filename: isJob ? file.filename : file.name,
      results: !isJob && file.results
        ? file.results
        : {
            language: isJob ? file.language : undefined,
            confidence: isJob ? file.confidence : undefined,
            duration: isJob ? file.duration : undefined,
            segments: isJob ? file.segments : undefined,
          },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asr-result-${data.filename.split('.')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToDataset = () => {
    const filesToAdd = stagedFiles.filter(f => selectedStagedIds.has(f.id));
    
    filesToAdd.forEach(f => {
      const url = URL.createObjectURL(f.file);
      addDatasetItem({
        id: `ds-${f.id.split('-')[1]}`,
        name: f.name,
        url: url,
        type: f.file.type,
        duration: f.results?.duration || "Unknown",
        transcriptionVerified: false,
        lidVerified: false,
        detectedLanguage: f.results?.language || "auto",
        uploadDate: new Date().toISOString()
      });
    });

    setStagedFiles(prev => prev.filter(f => !selectedStagedIds.has(f.id)));
    setSelectedStagedIds(new Set());
    
    if (activeFileId && selectedStagedIds.has(activeFileId)) {
      setActiveFileId(null);
    }
  };

  const filteredFiles: (StagedFile | MockProcessingJob)[] = [...backendQueue, ...stagedFiles].filter(item => {
    // Check Date
    if (dateFilter) {
      const itemDate = isBackendJob(item)
        ? (item.upload_time || "").split('T')[0]
        : (item.uploadDate || "").split('T')[0];
      if (itemDate !== dateFilter) return false;
    }
    // Check Lang
    if (langFilter !== "all") {
      const itemLang = isBackendJob(item) ? item.language : item.results?.language;
      if (itemLang !== langFilter) return false;
    }
    // Check Status
    if (statusFilter !== "all") {
      if (item.status !== statusFilter) return false;
    }
    return true;
  });

  const activeFileData = stagedFiles.find(f => f.id === activeFileId) || 
                         backendQueue.find(j => j.job_id === activeFileId);

  // Memoized mock summary for selected file
  const activeFileSummary = useMemo(() => {
    if (!activeFileData) return null;
    const name = isBackendJob(activeFileData) ? activeFileData.filename : activeFileData.name;
    return {
      overview: `The audio file "${name}" predominantly contains a professional dialogue focused on technical coordination. The speakers exhibit high clarity with minimal background noise, resulting in a strong confidence score.`,
      keyPoints: [
        "Discussion of system architecture and latency targets.",
        "Verification of new design elements in the user interface.",
        "Coordination of Q3 milestones and performance benchmarks."
      ],
      keywords: ["Latency", "Architecture", "Design", "Q3 Goals", "Performance", "Optimization"]
    };
  }, [activeFileId, stagedFiles, backendQueue]);

  // Combine backend queue with staged files for display
  const totalFiles = stagedFiles.length + backendQueue.length;
  const processingFiles = stagedFiles.filter(f => f.status !== "idle" && f.status !== "completed" && f.status !== "error").length + 
                         backendQueue.filter(j => j.status === "processing").length;
  const completedFiles = stagedFiles.filter(f => f.status === "completed").length + 
                        backendQueue.filter(j => j.status === "completed").length;
  const jobsWithConfidence = backendQueue.filter(j => j.confidence !== null);
  const avgConfidence = jobsWithConfidence.length > 0
    ? (jobsWithConfidence.reduce((sum, j) => sum + (j.confidence ?? 0), 0) / jobsWithConfidence.length).toFixed(3)
    : "N/A";

  return (
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 bg-white dark:bg-card border-border rounded-[2px] shadow-sm">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2">Inventory Total</div>
          <div className="text-2xl font-bold text-foreground">{totalFiles}</div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{stagedFiles.filter(f => f.status === "idle").length} Staged</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-card border-border rounded-[2px] shadow-sm">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2">Process Queue</div>
          <div className="text-2xl font-bold text-primary">{processingFiles}</div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{globalStatus === "processing" ? "Active Job" : "Idle State"}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-card border-border rounded-[2px] shadow-sm">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2">Throughput</div>
          <div className="text-2xl font-bold text-[#16a34a]">{completedFiles}</div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{totalFiles > 0 ? `${Math.round((completedFiles / totalFiles) * 100)}%` : "0%"} yield</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-card border-border rounded-[2px] shadow-sm">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2">Confidence Index</div>
          <div className="text-2xl font-bold text-foreground">
            {avgConfidence === "N/A"
              ? "N/A"
              : `${(parseFloat(avgConfidence as string) * 100).toFixed(0)}%`
            }
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">Avg ASR precision</div>
        </Card>
      </div>
      {/* Top Bar: Upload & Configuration */}
      <Card className="shrink-0 p-4 bg-white dark:bg-card border-border shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between rounded-[2px]">
        {/* Upload Area */}
        <div className="flex flex-col gap-2 md:w-1/4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <UploadCloud size={16} className="text-primary" />
            Media Ingestion
          </h3>
          <div className="flex gap-2 w-full">
            <input type="file" accept="audio/*,video/*" className="hidden" id="batch-upload" multiple onChange={handleFileUpload} />
            <Button asChild variant="secondary" className="w-full border-dashed border bg-muted/20 hover:border-primary/50 text-muted-foreground font-bold uppercase text-[10px] rounded-[2px] h-9">
              <label htmlFor="batch-upload" className="cursor-pointer">
                Select Source Files
              </label>
            </Button>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-border"></div>

        {/* Filters */}
        <div className="flex-1 flex gap-3 w-full">
          <div className="space-y-1.5 flex-1">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Process Flow</Label>
            <Select 
              className="h-9 text-[11px] rounded-[2px] bg-white dark:bg-card" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Cumulative Queue</option>
              <option value="completed">Production Ready</option>
              <option value="processing">In-Transit</option>
              <option value="queued">Pending Review</option>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Dialect Filter</Label>
            <Select 
              className="h-9 text-[11px] rounded-[2px] bg-white dark:bg-card"
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
            >
              <option value="all">Universal View</option>
              <option value="en">English (EN)</option>
              <option value="zh">Mandarin (ZH)</option>
              <option value="fr">French (FR)</option>
            </Select>
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-border"></div>

        {/* Actions Area */}
        <div className="flex gap-3 md:w-auto w-full md:justify-end shrink-0 md:pt-0 pt-4">
          <Button 
            variant="secondary" 
            disabled={selectedStagedIds.size === 0}
            onClick={handleAddToDataset}
            className="flex-1 md:flex-none border-border text-primary hover:bg-muted/50 rounded-[2px] uppercase text-[10px] font-bold h-9 px-6 bg-white dark:bg-card"
          >
            <Database size={14} className="mr-2" /> Commit to Dataset
          </Button>
          <Button 
            variant="secondary" 
            disabled={stagedFiles.filter(f => f.status === "completed").length === 0}
            onClick={handleExportProcessed}
            className="flex-1 md:flex-none border-border text-foreground hover:bg-muted font-bold text-[10px] uppercase rounded-[2px] h-9 px-6 bg-white dark:bg-card"
          >
            <Download size={14} className="mr-2" /> Export
          </Button>
          <Button 
            onClick={handleProcessAll}
            disabled={stagedFiles.length === 0 || globalStatus === "processing"}
            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-[2px] h-9 px-10 uppercase text-[10px] font-bold tracking-widest shadow-sm"
          >
            {globalStatus === "processing" ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                INITIATING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play size={14} /> Run Analytics
              </span>
            )}
          </Button>
        </div>
      </Card>

      {/* Bottom 80% Panel: Two Columns */}
      <div className="flex gap-4 min-h-0 flex-1">
        
        {/* Left Column: Uploaded Files Table */}
        <Card className="w-[45%] flex flex-col min-h-0 border-border bg-white dark:bg-card shadow-sm overflow-hidden rounded-[2px]">
          <div className="p-3 border-b border-border bg-muted/30 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                <Layers size={14} className="text-primary" />
                Active Inventory ({totalFiles})
              </h3>
            </div>
            
            {/* Date Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search size={14} className="text-muted-foreground" />
                </div>
                <Input 
                  type="text" 
                  placeholder="Query by nomenclature..."
                  className="pl-8 h-8 text-[11px] w-full rounded-[2px] bg-white dark:bg-card border-border"
                />
              </div>
              <div className="relative w-32 shrink-0">
                <Input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-8 text-[11px] w-full rounded-[2px] bg-white dark:bg-card border-border px-2"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-md border-b border-border z-10">
                <tr className="text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground">
                  <th className="p-3 w-10 text-center">
                    <button onClick={toggleAll} className="text-muted-foreground hover:text-primary transition-colors">
                      {selectedStagedIds.size === filteredFiles.length && filteredFiles.length > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="p-3">Core Identity</th>
                  <th className="p-3">Dialect</th>
                  <th className="p-3">Runtime</th>
                  <th className="p-3">Entities</th>
                  <th className="p-3 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFiles.map(item => {
                    const isJob = isBackendJob(item);
                    const id = isJob ? item.job_id : item.id;
                    const name = isJob ? item.filename : item.name;
                    const status = item.status;
                    const language = isJob ? item.language : (item.results?.language || "auto");
                    const duration = isJob ? item.duration : (item.results?.duration || "-");
                    const rawDate = isJob ? item.upload_time : item.uploadDate;
                    const date = rawDate ? new Date(rawDate).toLocaleDateString() : "Unknown";
                    
                    return (
                      <tr 
                        key={id} 
                        onClick={() => status === "completed" && setActiveFileId(id)}
                        className={cn(
                          "group transition-colors text-[11px]",
                          activeFileId === id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/20",
                          status === "completed" && "cursor-pointer",
                          status !== "completed" && "cursor-default"
                        )}
                      >
                        <td className="p-3 text-center">
                          {!isJob ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSelection(id); }}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {selectedStagedIds.has(id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                            </button>
                          ) : (
                            <div className="flex justify-center text-muted-foreground/30">
                              <Square size={16} />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground truncate max-w-[150px] uppercase font-mono" title={name}>
                            {name}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="uppercase text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-[2px] text-foreground border border-border">
                            {language}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] font-bold text-muted-foreground">
                          {duration}
                        </td>
                        <td className="p-3 text-muted-foreground font-bold">
                          {isJob ? (item.speakers || "-") : (item.results?.numSpeakers || "-")}
                        </td>
                        <td className="p-3 text-right pr-6">
                          {status === "queued" && <Badge variant="secondary" className="text-[9px] uppercase font-bold rounded-[2px]">Queued</Badge>}
                          {status === "idle" && <Badge variant="secondary" className="text-[9px] uppercase font-bold rounded-[2px] bg-slate-100 text-slate-600">Staged</Badge>}
                          {status !== "idle" && status !== "completed" && status !== "error" && status !== "queued" && (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5 justify-end">
                                <RefreshCw size={10} className="animate-spin text-primary" />
                                <span className="text-[9px] font-bold text-primary uppercase leading-none">
                                  {status.replace('-', ' ')} {isJob ? '' : `${item.progress}%`}
                                </span>
                              </div>
                              <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${isJob ? 100 : item.progress}%` }}></div>
                              </div>
                            </div>
                          )}
                          {status === "completed" && <Badge className="bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]/20 text-[9px] uppercase font-bold rounded-[2px]">Validated</Badge>}
                        </td>
                      </tr>
                    );
                  })
                }
                {backendQueue.length === 0 && stagedFiles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground text-[11px] uppercase tracking-widest italic opacity-50">
                      Empty Management Console
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Audio Output Details Table */}
        <Card className="flex-1 flex flex-col min-h-0 border-border bg-white dark:bg-card shadow-sm overflow-hidden rounded-[2px]">
          {(() => {
            // Narrow activeFileData once before JSX
            const activeIsJob = activeFileData ? isBackendJob(activeFileData) : false;
            const activeName = activeFileData
              ? (activeIsJob ? (activeFileData as import('../../constants/mockData').MockProcessingJob).filename : (activeFileData as StagedFile).name)
              : '';
            const activeResults = !activeIsJob && activeFileData ? (activeFileData as StagedFile).results : undefined;
            const activeSegments = activeIsJob && activeFileData ? (activeFileData as import('../../constants/mockData').MockProcessingJob).segments : undefined;
            const activeConf = activeResults ? activeResults.confidence
              : activeIsJob && activeFileData ? ((activeFileData as import('../../constants/mockData').MockProcessingJob).confidence ?? 0) : 0;
            const activeSpeakers = activeResults?.numSpeakers
              ?? (activeIsJob && activeFileData ? (activeFileData as import('../../constants/mockData').MockProcessingJob).speakers : 2);
            const hasData = activeFileData && (activeResults || activeSegments);
            return hasData ? (
            <>
              <div className="p-3 border-b border-border bg-muted/30 shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileAudio size={18} className="text-primary shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground truncate">
                      {activeName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-[2px]"
                      onClick={() => handleSingleFileDownload(activeFileData)}
                      title="Download JSON Report"
                    >
                      <Download size={14} />
                    </Button>
                    <Badge variant="success" className="font-mono text-[9px] px-2 py-1">
                      CONF: {(activeConf * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex p-0.5 bg-muted rounded-[2px] w-fit border border-border">
                  <button
                    onClick={() => setActiveResultTab("details")}
                    className={cn(
                      "px-6 py-1.5 text-[10px] font-bold rounded-[2px] transition-all uppercase tracking-widest",
                      activeResultTab === "details"
                        ? "bg-white dark:bg-card text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Granular Segments
                  </button>
                  <button
                    onClick={() => setActiveResultTab("summary")}
                    className={cn(
                      "px-6 py-1.5 text-[10px] font-bold rounded-[2px] transition-all uppercase tracking-widest",
                      activeResultTab === "summary"
                        ? "bg-white dark:bg-card text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Executive Summary
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeResultTab === "details" ? (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-md border-b border-border z-10 shadow-sm">
                      <tr className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <th className="p-3 w-16">Start</th>
                        <th className="p-3 w-16">End</th>
                        <th className="p-3 w-16 text-center">Δ</th>
                        <th className="p-3 w-24">Entity</th>
                        <th className="p-3 w-[35%]">Transcription</th>
                        <th className="p-3 w-[35%]">Internal Translation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(activeResults?.segments || activeSegments || []).map((seg) => (
                        <tr key={seg.id} className="hover:bg-muted/10 transition-colors align-top text-[11px]">
                          <td className="p-3 font-mono font-bold text-muted-foreground">{seg.start.toFixed(1)}s</td>
                          <td className="p-3 font-mono font-bold text-muted-foreground">{seg.end.toFixed(1)}s</td>
                          <td className="p-3 font-mono text-muted-foreground/60 text-center">{(seg.end - seg.start).toFixed(1)}s</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-[2px] bg-muted text-foreground text-[10px] font-bold uppercase border border-border">
                              {seg.speaker}
                            </span>
                          </td>
                          <td className="p-3 text-foreground leading-relaxed font-medium">
                            {seg.transcription}
                          </td>
                          <td className="p-3 text-primary leading-relaxed opacity-80 font-medium">
                            {seg.translation || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4 border-l-2 border-primary pl-3">Acoustic Intelligence Overview</h4>
                      <p className="text-[13px] text-foreground leading-relaxed bg-muted/20 p-5 rounded-[2px] border border-border italic">
                        "{activeFileSummary?.overview}"
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4 border-l-2 border-primary pl-3">Calculated Milestones</h4>
                      <ul className="space-y-3">
                        {activeFileSummary?.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-4 text-[12px] text-muted-foreground items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                            <span className="font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 border border-border rounded-[2px]">
                        <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Signal-to-Noise Ratio</h4>
                        <div className="text-xl font-bold text-foreground">
                          {activeResults?.snr || (28.4 + Math.random()).toFixed(1)} <span className="text-xs text-muted-foreground font-mono">dB</span>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 border border-border rounded-[2px]">
                        <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Real-Time Factor</h4>
                        <div className="text-xl font-bold text-foreground">
                          {activeResults?.rtf || (0.082).toFixed(3)} <span className="text-xs text-muted-foreground font-mono">RTF</span>
                        </div>
                      </div>
                    </section>

                    <section className="pt-6 border-t border-border">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4">Engagement Distribution</h4>
                      <div className="space-y-4">
                        {Array.from({length: activeSpeakers ?? 2}).map((_, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              <span>Entity {i}</span>
                              <span className="text-primary font-mono">{Math.floor(Math.random() * 40 + 20)}%</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{width: `${Math.floor(Math.random() * 40 + 20)}%`}}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </>
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/10 opacity-70">
              <div className="bg-white dark:bg-card p-10 rounded-[2px] shadow-sm border border-border max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-muted text-primary rounded-[2px] flex items-center justify-center mb-6 mx-auto border border-border">
                  <Play size={24} className="ml-1" />
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-2">Protocol Initialization</h3>
                <p className="text-[11px] text-muted-foreground mb-8 font-medium">Follow the prescribed workflow to ingest and analyze media inventory:</p>
                
                <div className="space-y-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-[2px] bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 border border-border uppercase">01</div>
                    <div>
                      <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Inventory Loading</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">Stage media files for high-precision ASR processing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-[2px] bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 border border-border uppercase">02</div>
                    <div>
                      <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Execute Optimization</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">Trigger the parallel analytic pipeline for chosen dialects.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-[2px] bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 border border-border uppercase">03</div>
                    <div>
                      <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Validation</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">Review granular segments and commit to production datasets.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
        </Card>

      </div>
    </div>
  );
}