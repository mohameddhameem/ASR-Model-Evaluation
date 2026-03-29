import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { UploadCloud, ServerCog, Play, Square, CheckSquare, Layers, Search, Database, FileAudio, Settings2, Filter, AlertCircle, Download, TrendingUp } from "lucide-react";
import { Card, Button, Input, Select, Label, cn, Badge } from "./ui";
import type { AppContextType, DatasetItem } from "./Layout";

type Segment = {
  id: string;
  start: number;
  end: number;
  speaker: string;
  transcription: string;
  translation: string;
};

type StagedFile = {
  id: string;
  file: File;
  name: string;
  size: string;
  status: "idle" | "processing" | "completed" | "error";
  uploadDate: string; // ISO format
  results?: {
    language: string;
    confidence: number;
    duration: string;
    numSpeakers: number;
    segments: Segment[];
  };
};

export function OperationsDashboard() {
  const { addDatasetItem, userPreferences } = useOutletContext<AppContextType>();
  
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedStagedIds, setSelectedStagedIds] = useState<Set<string>>(new Set());
  const [globalStatus, setGlobalStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [backendQueue, setBackendQueue] = useState<any[]>([]);

  // Filters for left column
  const [dateFilter, setDateFilter] = useState("");
  const [langFilter, setLangFilter] = useState("all");

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
      
      // Fallback: use mock data
      const mockQueue = [
        {
          job_id: "job-001",
          filename: "conference-audio-2026-03-15.mp4",
          language: "en",
          duration: "12:45",
          speakers: 3,
          status: "completed",
          confidence: 0.92,
          date: "2026-03-29",
          upload_time: "2026-03-29T10:30:00Z"
        },
        {
          job_id: "job-002",
          filename: "meeting-transcription.wav",
          language: "fr",
          duration: "8:30",
          speakers: 2,
          status: "completed",
          confidence: 0.88,
          date: "2026-03-29",
          upload_time: "2026-03-29T11:15:00Z"
        },
        {
          job_id: "job-003",
          filename: "interview-segment.mp3",
          language: "de",
          duration: "15:20",
          speakers: 2,
          status: "processing",
          confidence: null,
          date: "2026-03-29",
          upload_time: "2026-03-29T12:00:00Z"
        },
        {
          job_id: "job-004",
          filename: "lecture-hall-recording.m4a",
          language: "zh",
          duration: "45:00",
          speakers: 1,
          status: "completed",
          confidence: 0.95,
          date: "2026-03-29",
          upload_time: "2026-03-29T14:30:00Z"
        },
        {
          job_id: "job-005",
          filename: "podcast-episode-42.mp3",
          language: "en",
          duration: "32:15",
          speakers: 2,
          status: "completed",
          confidence: 0.91,
          date: "2026-03-29",
          upload_time: "2026-03-29T16:00:00Z"
        }
      ];
      setBackendQueue(mockQueue);
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
    setStagedFiles(prev => prev.map(f => f.status === "idle" ? { ...f, status: "processing" } : f));

    stagedFiles.forEach((file, index) => {
      if (file.status !== "idle") return;
      
      setTimeout(() => {
        setStagedFiles(prev => {
          const updated = [...prev];
          const fileIndex = updated.findIndex(f => f.id === file.id);
          if (fileIndex > -1) {
            const lang = jobConfig.targetLanguage === "auto" 
              ? ["en", "fr", "de", "zh"][Math.floor(Math.random() * 4)] 
              : jobConfig.targetLanguage;

            const numSpeakers = Math.floor(Math.random() * 3) + 1;
            const mockDurationSecs = Math.floor(Math.random() * 180) + 30; // 30s to 210s
            const formattedDuration = `${Math.floor(mockDurationSecs / 60)}:${(mockDurationSecs % 60).toString().padStart(2, '0')}`;

            // Generate mock segments
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
              status: "completed",
              results: {
                language: lang,
                confidence: 0.85 + (Math.random() * 0.14),
                duration: formattedDuration,
                numSpeakers,
                segments: mockSegments
              }
            };
          }
          
          if (updated.every(f => f.status === "completed" || f.status === "error")) {
            setGlobalStatus("completed");
          }
          return updated;
        });
      }, 1000 + (index * 600)); // fast processing for demo
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
      setSelectedStagedIds(new Set(filteredFiles.map(f => f.id)));
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

  const filteredFiles = stagedFiles.filter(f => {
    // Check Date
    if (dateFilter) {
      const fDate = f.uploadDate.split('T')[0];
      if (fDate !== dateFilter) return false;
    }
    // Check Lang
    if (langFilter !== "all") {
      if (!f.results || f.results.language !== langFilter) return false;
    }
    return true;
  });

  const activeFileData = stagedFiles.find(f => f.id === activeFileId) || 
                         backendQueue.find(j => j.job_id === activeFileId);

  // Combine backend queue with staged files for display
  const allFiles = backendQueue;
  const totalFiles = stagedFiles.length + backendQueue.length;
  const processingFiles = stagedFiles.filter(f => f.status === "processing").length + 
                         backendQueue.filter(j => j.status === "processing").length;
  const completedFiles = stagedFiles.filter(f => f.status === "completed").length + 
                        backendQueue.filter(j => j.status === "completed").length;
  const avgConfidence = backendQueue.filter(j => j.confidence !== null).length > 0
    ? (backendQueue.filter(j => j.confidence !== null).reduce((sum: number, j: any) => sum + j.confidence, 0) / 
       backendQueue.filter(j => j.confidence !== null).length).toFixed(3)
    : "N/A";

  return (
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Total Files</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalFiles}</div>
          <div className="text-xs text-slate-500 mt-1">{stagedFiles.filter(f => f.status === "idle").length} ready</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Processing</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{processingFiles}</div>
          <div className="text-xs text-slate-500 mt-1">{globalStatus === "processing" ? "In progress..." : "Idle"}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Completed</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedFiles}</div>
          <div className="text-xs text-slate-500 mt-1">{totalFiles > 0 ? `${Math.round((completedFiles / totalFiles) * 100)}%` : "0%"}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Avg Confidence</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {avgConfidence === "N/A"
              ? "N/A"
              : `${(parseFloat(avgConfidence as string) * 100).toFixed(0)}%`
            }
          </div>
          <div className="text-xs text-slate-500 mt-1">ASR confidence</div>
        </Card>
      </div>
      {/* Top 20% Panel: Upload & Configuration */}
      <Card className="shrink-0 p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        {/* Upload Area */}
        <div className="flex flex-col gap-2 md:w-1/4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UploadCloud size={16} className="text-indigo-600 dark:text-indigo-400" />
            Media Upload
          </h3>
          <div className="flex gap-2 w-full">
            <input type="file" accept="audio/*,video/*" className="hidden" id="batch-upload" multiple onChange={handleFileUpload} />
            <Button asChild variant="secondary" className="w-full border-dashed border-2 hover:border-indigo-400 bg-slate-50 dark:bg-slate-900/50">
              <label htmlFor="batch-upload" className="cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                Browse Files...
              </label>
            </Button>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800"></div>

        {/* Config Area */}
        <div className="flex-1 flex gap-4 w-full">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs text-slate-500">ASR Model</Label>
            <Select 
              className="h-9 text-sm" 
              value={jobConfig.asrModel}
              onChange={(e) => setJobConfig({...jobConfig, asrModel: e.target.value})}
              disabled={globalStatus === "processing"}
            >
              <option value="auto">Auto-Fast</option>
              <option value="whisper">Whisper V3 Large</option>
              <option value="vibe">VibeVoice</option>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs text-slate-500">Target Language</Label>
            <Select 
              className="h-9 text-sm"
              value={jobConfig.targetLanguage}
              onChange={(e) => setJobConfig({...jobConfig, targetLanguage: e.target.value})}
              disabled={globalStatus === "processing"}
            >
              <option value="auto">Auto-Detect (LID)</option>
              <option value="en">English</option>
              <option value="zh">Mandarin</option>
              <option value="fr">French</option>
            </Select>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800"></div>

        {/* Actions Area */}
        <div className="flex gap-3 md:w-auto w-full md:justify-end shrink-0 pt-5 md:pt-0">
          <Button 
            variant="secondary" 
            disabled={selectedStagedIds.size === 0}
            onClick={handleAddToDataset}
            className="flex-1 md:flex-none border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            <Database size={16} className="mr-2 hidden sm:block" /> Add to Dataset
          </Button>
          <Button 
            variant="secondary" 
            disabled={stagedFiles.filter(f => f.status === "completed").length === 0}
            onClick={handleExportProcessed}
            className="flex-1 md:flex-none border-slate-300 dark:border-slate-600"
          >
            <Download size={16} className="mr-2 hidden sm:block" /> Export
          </Button>
          <Button 
            onClick={handleProcessAll}
            disabled={stagedFiles.length === 0 || globalStatus === "processing"}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 w-32 shadow-md shadow-indigo-600/20"
          >
            {globalStatus === "processing" ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
                Proc...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play size={16} /> Process All
              </span>
            )}
          </Button>
        </div>
      </Card>

      {/* Bottom 80% Panel: Two Columns */}
      <div className="flex gap-4 min-h-0 flex-1">
        
        {/* Left Column: Uploaded Files Table */}
        <Card className="w-[45%] flex flex-col min-h-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers size={16} className="text-slate-500" />
                Processing Queue ({totalFiles})
              </h3>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Filter size={14} className="text-slate-400" />
                </div>
                <Input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-8 h-8 text-xs w-full"
                />
              </div>
              <Select 
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="h-8 text-xs flex-1 py-0"
              >
                <option value="all">All Languages</option>
                <option value="en">English (en)</option>
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
                <option value="zh">Mandarin (zh)</option>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
                <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="p-3 w-10 text-center">
                    <button onClick={toggleAll} className="text-slate-400 hover:text-indigo-600 transition-colors pt-1">
                      {selectedStagedIds.size === filteredFiles.length && filteredFiles.length > 0 ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="p-3 font-medium">File Name</th>
                  <th className="p-3 font-medium">Language</th>
                  <th className="p-3 font-medium">Duration</th>
                  <th className="p-3 font-medium">Speakers</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {/* Combined and Filtered List */}
                {[...backendQueue, ...stagedFiles]
                  .filter(item => {
                    const itemDate = (item.upload_time || item.uploadDate || item.created_at || "").split('T')[0];
                    if (dateFilter && itemDate !== dateFilter) return false;
                    
                    const itemLang = item.language || item.results?.language;
                    if (langFilter !== "all" && itemLang !== langFilter) return false;
                    
                    return true;
                  })
                  .map(item => {
                    const isJob = 'job_id' in item;
                    const id = isJob ? item.job_id : item.id;
                    const name = isJob ? item.filename : item.name;
                    const status = item.status;
                    const language = isJob ? item.language : (item.results?.language || "auto");
                    const duration = isJob ? item.duration : (item.results?.duration || "-");
                    const date = item.upload_time || item.uploadDate || item.created_at 
                      ? new Date(item.upload_time || item.uploadDate || item.created_at).toLocaleDateString()
                      : "Unknown";
                    
                    return (
                      <tr 
                        key={id} 
                        onClick={() => status === "completed" && setActiveFileId(id)}
                        className={cn(
                          "group transition-colors",
                          activeFileId === id ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-900/30",
                          status === "completed" && "cursor-pointer",
                          status !== "completed" && "cursor-default"
                        )}
                      >
                        <td className="p-3 text-center">
                          {!isJob ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSelection(id); }}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {selectedStagedIds.has(id) ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                            </button>
                          ) : (
                            <div className="flex justify-center text-slate-300 dark:text-slate-700">
                              <Square size={16} className="opacity-50" />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[150px]" title={name}>
                            {name}
                          </div>
                          <div className="text-[10px] text-slate-500">{date}</div>
                        </td>
                        <td className="p-3">
                          <span className="uppercase text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {language}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {duration}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {isJob ? (item.speakers || "-") : (item.results?.numSpeakers || "-")}
                        </td>
                        <td className="p-3">
                          {status === "queued" && <Badge className="bg-slate-100 dark:bg-slate-800 text-[10px]">Queued</Badge>}
                          {status === "idle" && <Badge className="bg-slate-100 dark:bg-slate-800 text-[10px]">Ready</Badge>}
                          {status === "processing" && (
                            <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 text-[10px]">
                              {item.progress || 0}%
                            </Badge>
                          )}
                          {status === "completed" && <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-[10px]">Done</Badge>}
                        </td>
                      </tr>
                    );
                  })
                }
                {backendQueue.length === 0 && stagedFiles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                      No files match the current queue or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Audio Output Details Table */}
        <Card className="flex-1 flex flex-col min-h-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {activeFileData && (activeFileData.results || activeFileData.segments) ? (
            <>
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileAudio size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {activeFileData.name || activeFileData.filename}
                  </h3>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-mono text-[10px]">
                    Conf: {activeFileData.results ? (activeFileData.results.confidence * 100).toFixed(0) : (activeFileData.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="p-3 font-medium w-16">Start</th>
                      <th className="p-3 font-medium w-16">End</th>
                      <th className="p-3 font-medium w-16">Dur.</th>
                      <th className="p-3 font-medium w-24">Speaker</th>
                      <th className="p-3 font-medium w-[35%]">Transcribed Content</th>
                      <th className="p-3 font-medium w-[35%]">Translated Content</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {(activeFileData.results?.segments || activeFileData.segments || []).map((seg: any) => (
                      <tr key={seg.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors align-top">
                        <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">{seg.start.toFixed(1)}s</td>
                        <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">{seg.end.toFixed(1)}s</td>
                        <td className="p-3 font-mono text-xs text-slate-500">{(seg.end - seg.start).toFixed(1)}s</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium whitespace-nowrap">
                            {seg.speaker}
                          </span>
                        </td>
                        <td className="p-3 text-slate-900 dark:text-slate-200 text-xs leading-relaxed">
                          {seg.transcription}
                        </td>
                        <td className="p-3 text-indigo-900 dark:text-indigo-200 text-xs leading-relaxed">
                          {seg.translation || "(Not available)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate-500">
              <AlertCircle size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-1">Select a processed file</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Click on any completed file in the queue to view its segment-by-segment transcription and translation breakdown.
              </p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}