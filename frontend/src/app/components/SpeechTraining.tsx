import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import { Play, Pause, Check, X, Save, FileAudio, RotateCcw, Info, Keyboard, CheckCheck, XCircle } from "lucide-react";
import { Card, Button, Textarea, cn } from "./ui";
import type { AppContextType } from "../../types";

const mockSegments = [
  { id: 1, start: 0.0, end: 2.5, speaker: "Speaker 0", text: "I feel like this is my second home." },
  { id: 2, start: 2.5, end: 5.1, speaker: "Speaker 1", text: "That's exactly what we wanted to achieve with the new design." },
  { id: 3, start: 5.1, end: 8.4, speaker: "Speaker 0", text: "It really shows. The latency has improved dramatically since the last update." },
  { id: 4, start: 8.4, end: 11.0, speaker: "Speaker 1", text: "We're aiming for sub-200 milliseconds by Q3." },
  { id: 5, start: 11.0, end: 14.2, speaker: "Speaker 0", text: "That sounds ambitious but doable." },
];

export function SpeechTraining() {
  const { datasets, updateDatasetItem, activeDatasetId } = useOutletContext<AppContextType>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(14.5);
  const [segments, setSegments] = useState(mockSegments);
  const [statuses, setStatuses] = useState<Record<number, "accepted" | "rejected" | null>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentDataset = datasets.find(f => f.id === activeDatasetId);
  const currentAudioSource = currentDataset?.url;

  // Audio elements hookup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 14.5);
    const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeDatasetId]);

  // Simulation fallback if no real audio is loaded
  useEffect(() => {
    if (!audioRef.current || !audioRef.current.src) {
      let interval: number;
      if (isPlaying) {
        interval = window.setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= duration) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 0.1;
          });
        }, 100);
      }
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSegmentPlay = (start: number) => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = start;
      audioRef.current.play();
    }
    setCurrentTime(start);
    setIsPlaying(true);
  };

  const handleStatus = (id: number, status: "accepted" | "rejected") => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const updateSegmentText = (id: number, text: string) => {
    setSegments(segments.map(s => s.id === id ? { ...s, text } : s));
  };

  const handleSaveDataset = () => {
    if (activeDatasetId) {
      updateDatasetItem(activeDatasetId, { transcriptionVerified: true });
      alert("Dataset annotations saved and marked as human-verified.");
    }
  };

  const handleBulkAcceptAll = () => {
    const newStatuses: Record<number, "accepted" | "rejected" | null> = {};
    segments.forEach(seg => {
      newStatuses[seg.id] = "accepted";
    });
    setStatuses(newStatuses);
  };

  const handleBulkRejectAll = () => {
    const newStatuses: Record<number, "accepted" | "rejected" | null> = {};
    segments.forEach(seg => {
      newStatuses[seg.id] = "rejected";
    });
    setStatuses(newStatuses);
  };

  const handleResetAll = () => {
    setStatuses({});
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Space: Toggle play
      if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      // Ctrl/Cmd + R: Reset
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        setCurrentTime(0);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDataset();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, activeDatasetId]);

  // Generate mock waveform bars
  const waveformBars = Array.from({ length: 150 }).map((_, i) => Math.random() * 80 + 20);
  const progressPercentage = (currentTime / duration) * 100 || 0;

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Info size={48} className="mb-4 text-slate-400" />
        <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">No Active File</h2>
        <p>Please select an audio file from the Dataset Manager on the left.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
            <FileAudio size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-none">Annotation Workspace</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Reviewing: <span className="font-medium text-indigo-600 dark:text-indigo-400">{currentDataset.name}</span>
              </p>
              {currentDataset.transcriptionVerified && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentAudioSource && <audio ref={audioRef} src={currentAudioSource} className="hidden" />}

      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Top Half: Waveform & Master Player */}
        <div className="h-48 shrink-0 bg-slate-50 dark:bg-slate-950 flex flex-col border-b border-slate-200 dark:border-slate-800 relative">
          {/* Toolbar */}
          <div className="h-12 flex items-center px-4 justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="w-8 h-8 p-0" onClick={togglePlay}>
                {isPlaying ? <Pause size={16} className="text-indigo-600 dark:text-indigo-400" /> : <Play size={16} className="text-indigo-600 dark:text-indigo-400" />}
              </Button>
              <Button variant="ghost" className="w-8 h-8 p-0" onClick={() => { 
                setCurrentTime(0); 
                setIsPlaying(false);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
              }}>
                <RotateCcw size={16} />
              </Button>
              <span className="font-mono text-sm text-slate-600 dark:text-slate-400 ml-2 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">Zoom: 1x</span>
            </div>
          </div>
          
          {/* Waveform Area */}
          <div className="flex-1 relative overflow-hidden group px-4 py-6 cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;
            const newTime = pct * duration;
            setCurrentTime(newTime);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
            }
          }}>
            <div className="absolute inset-x-4 top-6 bottom-6 flex items-center gap-[2px]">
              {waveformBars.map((height, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-full transition-colors duration-75",
                    (i / waveformBars.length) * 100 < progressPercentage ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
                  )} 
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
            
            {/* Segments Overlays */}
            {segments.map((seg) => {
              const left = (seg.start / duration) * 100;
              const width = ((seg.end - seg.start) / duration) * 100;
              return (
                <div 
                  key={seg.id}
                  className="absolute top-0 bottom-0 border-l border-r border-slate-400/20 dark:border-slate-500/20 bg-slate-400/5 dark:bg-slate-500/5 pointer-events-none"
                  style={{ left: `calc(1rem + ${left}%)`, width: `${width}%` }}
                >
                  <div className="absolute top-0 left-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {seg.id}
                  </div>
                </div>
              );
            })}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
              style={{ left: `calc(1rem + ${progressPercentage}%)` }}
            >
              <div className="absolute -top-2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            </div>
          </div>
        </div>

        {/* Bottom Half: Segment Editor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900 custom-scrollbar">
          {segments.map((seg) => {
            const status = statuses[seg.id];
            const isCurrent = currentTime >= seg.start && currentTime <= seg.end;

            return (
              <div 
                key={seg.id} 
                className={cn(
                  "flex gap-4 p-3 rounded-lg border transition-colors",
                  isCurrent ? "bg-indigo-50/50 dark:bg-slate-800/80 border-indigo-300 dark:border-indigo-500/50 shadow-sm" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                  status === "accepted" && "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10",
                  status === "rejected" && "border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/10"
                )}
              >
                {/* Play/Time Info */}
                <div className="w-32 shrink-0 flex flex-col gap-2">
                  <div className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-center">
                    {seg.start.toFixed(2)} - {seg.end.toFixed(2)}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 w-full text-xs"
                    onClick={() => handleSegmentPlay(seg.start)}
                  >
                    <Play size={12} className="mr-1" /> Play
                  </Button>
                  <div className="text-[10px] uppercase font-bold text-slate-500 text-center mt-auto pb-1 tracking-wider">
                    {seg.speaker}
                  </div>
                </div>

                {/* Editable Textarea */}
                <div className="flex-1 flex flex-col relative">
                  <Textarea 
                    className={cn(
                      "flex-1 min-h-[60px] resize-none font-medium leading-relaxed bg-white dark:bg-slate-950",
                      status === "accepted" ? "text-emerald-700 dark:text-emerald-100 focus-visible:ring-emerald-500" : 
                      status === "rejected" ? "text-red-700 dark:text-red-100 focus-visible:ring-red-500 line-through opacity-70" : "text-slate-900 dark:text-slate-200"
                    )}
                    value={seg.text}
                    onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                  />
                  {status && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur bg-white/80 dark:bg-slate-900/80 shadow-sm border border-slate-200 dark:border-slate-700">
                      {status === "accepted" ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={10} /> Validated</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1"><X size={10} /> Discarded</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="w-12 shrink-0 flex flex-col gap-2 justify-center">
                  <button 
                    onClick={() => handleStatus(seg.id, "accepted")}
                    className={cn(
                      "flex-1 flex items-center justify-center rounded-md border transition-all",
                      status === "accepted" 
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-inner" 
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    )}
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => handleStatus(seg.id, "rejected")}
                    className={cn(
                      "flex-1 flex items-center justify-center rounded-md border transition-all",
                      status === "rejected" 
                        ? "bg-red-600 border-red-500 text-white shadow-inner" 
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    )}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 shrink-0">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32">Progress</div>
            <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${segments.length > 0 ? ((Object.values(statuses).filter(s => s !== null).length / segments.length) * 100) : 0}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-20 text-right">
              {Object.values(statuses).filter(s => s !== null).length}/{segments.length}
            </span>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-4">
              <span><span className="font-semibold text-slate-900 dark:text-slate-200">{segments.length}</span> segments</span>
              <span><span className="text-emerald-600 dark:text-emerald-400 font-medium">{Object.values(statuses).filter(s => s === 'accepted').length}</span> Accepted</span>
              <span><span className="text-red-600 dark:text-red-400 font-medium">{Object.values(statuses).filter(s => s === 'rejected').length}</span> Rejected</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleBulkAcceptAll}
                className="text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                title="Ctrl+Cmd+A: Accept all segments"
              >
                <CheckCheck size={14} className="mr-1" /> Accept All
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleBulkRejectAll}
                className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                title="Ctrl+Cmd+R: Reject all segments"
              >
                <XCircle size={14} className="mr-1" /> Reject All
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleResetAll}
                className="text-slate-700 dark:text-slate-300"
              >
                <RotateCcw size={14} className="mr-1" /> Reset
              </Button>
              <Button 
                className="px-6 gap-2" 
                onClick={handleSaveDataset}
                title="Ctrl+Cmd+S: Save dataset"
              >
                <Save size={16} /> Save & Verify
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            <Keyboard size={12} className="inline mr-1" /> Shortcuts: Ctrl+Space (Play/Pause) | Ctrl+R (Reset) | Ctrl+S (Save)
          </div>
        </div>
      </div>
    </div>
  );
}