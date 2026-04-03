import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import { Play, Square, Code, AlignLeft, ListMusic, Database, Info, FileAudio, RotateCcw, FastForward, Timer, RefreshCw, Settings2, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Card, Button, Label, Select, Textarea, cn } from "./ui";
import { AudioWaveform } from "./AudioWaveform";
import type { AppContextType } from "./Layout";

const initialSegments = [
  { id: 1, start: 0.0, end: 2.5, speaker: "Speaker 0", lang: "en", text: "I feel like this is my second home.", originalText: "I feel like this is my second home.", history: [{ model: "vibevoice-v2", lang: "en", text: "I feel like this is my second home.", timestamp: new Date().toISOString() }] },
  { id: 2, start: 2.5, end: 5.1, speaker: "Speaker 1", lang: "en", text: "That's exactly what we wanted to achieve with the new design.", originalText: "That's exactly what we wanted to achieve with the new design.", history: [{ model: "vibevoice-v2", lang: "en", text: "That's exactly what we wanted to achieve with the new design.", timestamp: new Date().toISOString() }] },
  { id: 3, start: 5.1, end: 8.4, speaker: "Speaker 0", lang: "en", text: "It really shows. The latency has improved dramatically since the last update.", originalText: "It really shows. The latency has improved dramatically since the last update.", history: [{ model: "vibevoice-v2", lang: "en", text: "It really shows. The latency has improved dramatically since the last update.", timestamp: new Date().toISOString() }] },
  { id: 4, start: 8.4, end: 11.0, speaker: "Speaker 1", lang: "en", text: "We're aiming for sub-200 milliseconds by Q3.", originalText: "We're aiming for sub-200 milliseconds by Q3.", history: [{ model: "vibevoice-v2", lang: "en", text: "We're aiming for sub-200 milliseconds by Q3.", timestamp: new Date().toISOString() }] },
];

export function EvaluationWorkbench() {
  const { datasets, activeDatasetId, userPreferences } = useOutletContext<AppContextType>();
  const [activeTab, setActiveTab] = useState<"raw" | "segments" | "translation">("segments");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const [segments, setSegments] = useState(initialSegments);
  
  // Retrigger & Verification states
  const [isRetriggerPanelOpen, setIsRetriggerPanelOpen] = useState(false);
  const [retriggerModel, setRetriggerModel] = useState("whisper");
  const [retriggerLang, setRetriggerLang] = useState("en");
  const [isLidVerified, setIsLidVerified] = useState(false);
  
  // Local state initialized with user preferences
  const [model, setModel] = useState(userPreferences.asrModel);
  const [contextWords, setContextWords] = useState(userPreferences.contextWords);
  const [enableSampling, setEnableSampling] = useState(userPreferences.enableSampling);
  const [temperature, setTemperature] = useState(userPreferences.temperature);
  const [topP, setTopP] = useState(userPreferences.topP);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(11.0); // Mock duration
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);


  // Sync if global preferences change
  useEffect(() => {
    setModel(userPreferences.asrModel);
    setContextWords(userPreferences.contextWords);
    setEnableSampling(userPreferences.enableSampling);
    setTemperature(userPreferences.temperature);
    setTopP(userPreferences.topP);
  }, [userPreferences]);

  // Handle audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Update active segment based on time
      const currentSegment = segments.find(
        seg => audio.currentTime >= seg.start && audio.currentTime <= seg.end
      );
      setActiveSegmentId(currentSegment?.id || null);
    };

    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleSegmentTextChange = (id: number, newText: string) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, text: newText } : seg
    ));
  };
  
  const handleSegmentLangChange = (id: number, newLang: string) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, lang: newLang } : seg
    ));
  };
  
  const selectedFile = datasets.find(d => d.id === activeDatasetId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Panel - Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Selected Media Info */}
        <Card className="p-5 flex flex-col h-full bg-white dark:bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Database size={16} className="text-primary" />
              Active Media Source
            </h3>
          </div>
          
          {selectedFile ? (
            <div className="flex flex-col flex-1 justify-center items-center text-center p-4 border border-border rounded-[2px] bg-white dark:bg-card shadow-sm">
              <div className="w-12 h-12 rounded-[2px] bg-secondary flex items-center justify-center mb-3 text-primary">
                <FileAudio size={24} />
              </div>
              <p className="font-medium text-foreground mb-1 break-all line-clamp-2">
                {selectedFile.name}
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                <span>{selectedFile.duration}</span>
                <span>•</span>
                <span>{selectedFile.type.split('/')[1]?.toUpperCase() || 'Audio'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 justify-center items-center text-center p-4 border border-dashed border-border rounded-[2px] bg-muted">
              <Info size={24} className="text-muted-foreground mb-2" />
              <p className="text-sm text-foreground">No media selected.</p>
              <p className="text-xs text-muted-foreground mt-1">Select or upload a file from the Dataset Manager sidebar.</p>
            </div>
          )}
        </Card>

        {/* Card 2: Model & Context */}
        <Card className="p-5 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ListMusic size={16} className="text-primary" />
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
                className="h-20 resize-none text-xs rounded-[2px]"
                value={contextWords}
                onChange={(e) => setContextWords(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Sampling Controls */}
        <Card className="p-5 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlignLeft size={16} className="text-primary" />
            Sampling Controls
          </h3>
          <div className="space-y-5 flex-1">
            <div className="flex items-center justify-between p-3 bg-muted rounded-[2px] border border-border">
              <div className="space-y-0.5">
                <Label className="text-foreground">Enable Sampling</Label>
                <p className="text-xs text-muted-foreground">Use probabilistic decoding</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={enableSampling}
                  onChange={(e) => setEnableSampling(e.target.checked)} 
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className={cn("space-y-4 transition-opacity", !enableSampling && "opacity-50 pointer-events-none")}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-xs text-primary font-medium">{temperature.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-[2px] appearance-none cursor-pointer" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top-p</Label>
                  <span className="text-xs text-primary font-medium">{topP.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-[2px] appearance-none cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-2 sticky top-0 z-10 transition-all">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-card border border-border rounded-[2px] shadow-sm">
          <Button 
            className="flex-1 sm:flex-none sm:w-48 text-base shadow-primary/10 shadow-lg rounded-[2px]"
            onClick={() => {
              setIsTranscribing(true);
              setIsLidVerified(false);
              setTimeout(() => { setIsTranscribing(false); setHasResults(true); setIsRetriggerPanelOpen(true); }, 1500);
            }}
            disabled={isTranscribing || !selectedFile}
          >
          {isTranscribing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play size={18} />
              Transcribe
            </span>
          )}
        </Button>
        
        <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={togglePlayback}
            disabled={!hasResults}
            className="shrink-0 rounded-[2px]"
          >
            {isPlaying ? <Square size={14} className="mr-1.5" fill="currentColor" /> : <Play size={14} className="mr-1.5" fill="currentColor" />}
            {isPlaying ? "Pause" : "Listen"}
          </Button>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-[2px] border border-border shrink-0">
            <Timer size={14} className="ml-1 text-muted-foreground" />
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded-[2px] transition-colors",
                  playbackSpeed === speed 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => handleSeek(0)} disabled={!hasResults} className="shrink-0 rounded-[2px]">
            <RotateCcw size={14} className="mr-1.5" /> Reset
          </Button>
        </div>

          {hasResults && !isTranscribing && (
            <div className="ml-auto flex items-center gap-3 bg-muted/30 p-1.5 pl-3 border border-border rounded-[2px]">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Auto-Detected</span>
                <span className="text-xs font-bold text-foreground">EN (98%)</span>
              </div>
              <div className="w-px h-6 bg-border mx-1"></div>
              {isLidVerified ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] dark:bg-[#052c16] border border-[#16a34a]/30 rounded-[2px]">
                  <CheckCircle size={14} className="text-[#16a34a]" />
                  <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wider">Verified</span>
                </div>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="h-7 text-[10px] uppercase font-bold"
                    onClick={() => setIsLidVerified(true)}
                  >
                    Confirm
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className={cn(
                      "h-7 text-[10px] uppercase font-bold flex items-center gap-1",
                      isRetriggerPanelOpen ? "bg-muted" : ""
                    )}
                    onClick={() => setIsRetriggerPanelOpen(!isRetriggerPanelOpen)}
                  >
                    Refine <Settings2 size={12} className="ml-1" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Retrigger Panel */}
        {hasResults && !isTranscribing && isRetriggerPanelOpen && !isLidVerified && (
          <div className="p-4 bg-white dark:bg-card border border-border rounded-[2px] shadow-sm animate-in slide-in-from-top-2 flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="space-y-1.5 flex-1">
              <Label>Force Dialect Override</Label>
              <Select value={retriggerLang} onChange={(e) => setRetriggerLang(e.target.value)} className="h-8 text-xs border-primary/20">
                <option value="en">English (EN)</option>
                <option value="zh">Mandarin (ZH)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1">
              <Label>Fallback Model Selection</Label>
              <Select value={retriggerModel} onChange={(e) => setRetriggerModel(e.target.value)} className="h-8 text-xs border-primary/20">
                <option value="whisper">Whisper V3 Large</option>
                <option value="vibe">VibeVoice</option>
                <option value="azure">Azure Cognitive</option>
              </Select>
            </div>
            <Button 
              className="w-full md:w-auto h-8 px-6 bg-primary text-white hover:bg-primary/90 rounded-[2px] uppercase tracking-widest text-[10px]"
              onClick={() => {
                setIsRetriggerPanelOpen(false);
                setIsTranscribing(true);
                setTimeout(() => { setIsTranscribing(false); setHasResults(true); setIsLidVerified(true); }, 2000);
              }}
            >
              <RefreshCw size={12} className="mr-2" /> Re-Run Transcription
            </Button>
          </div>
        )}
      </div>

      {/* Waveform Area */}
      {hasResults && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
          <AudioWaveform
            duration={duration}
            currentTime={currentTime}
            segments={segments}
            onSeek={handleSeek}
            activeSegmentId={activeSegmentId}
          />
          <audio 
            ref={audioRef}
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            className="hidden"
          />
        </div>
      )}

      {/* Results Area */}
      {hasResults && (
        <Card className="min-h-[400px] flex flex-col rounded-[2px]">
          <div className="border-b border-border bg-muted flex overflow-x-auto p-1 rounded-t-[2px]">
            <button
              onClick={() => setActiveTab("raw")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-[2px] flex items-center gap-2 transition-all",
                activeTab === "raw" ? "bg-white dark:bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <Code size={16} /> Raw Output
            </button>
            <button
              onClick={() => setActiveTab("segments")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-[2px] flex items-center gap-2 transition-all",
                activeTab === "segments" ? "bg-white dark:bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <ListMusic size={16} /> Audio Segments
            </button>
            <button
              onClick={() => setActiveTab("translation")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-[2px] flex items-center gap-2 transition-all",
                activeTab === "translation" ? "bg-white dark:bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <AlignLeft size={16} /> Translation & Summary
            </button>
          </div>

          <div className="p-4 flex-1 bg-white dark:bg-card rounded-b-[2px]">
            {activeTab === "raw" && (
              <pre className="p-4 bg-muted rounded-[2px] text-xs font-mono text-primary overflow-auto border border-border max-h-[500px]">
                {JSON.stringify({ model: model, duration: 11.0, language: "en", confidence: 0.98, segments: segments }, null, 2)}
              </pre>
            )}

            {activeTab === "segments" && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {segments.map((seg) => (
                  <div 
                    key={seg.id} 
                    className={cn(
                        "bg-white dark:bg-card border rounded-[2px] p-4 transition-all hover:border-primary/50 flex flex-col sm:flex-row gap-4 cursor-pointer group/seg",
                        activeSegmentId === seg.id ? "border-primary ring-1 ring-primary/20 bg-primary/[0.02]" : "border-border"
                    )}
                    onClick={() => handleSeek(seg.start)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                            "px-2 py-0.5 rounded-[2px] text-xs font-medium border transition-colors",
                            activeSegmentId === seg.id 
                                ? "bg-primary text-white border-primary shadow-sm" 
                                : "bg-secondary text-primary border-border"
                        )}>
                          {seg.speaker}
                        </span>
                        
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-muted text-muted-foreground text-[10px] font-bold border border-border uppercase tracking-wider">
                          {seg.lang}
                        </span>

                        <span className="text-xs text-muted-foreground font-mono">
                          {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s
                        </span>

                        {seg.text !== seg.originalText && (
                          <span className="text-[10px] font-semibold text-[#16a34a] dark:text-[#4ade80] flex items-center gap-1 bg-[#f0fdf4] dark:bg-[#052c16] px-1.5 py-0.5 rounded-[2px] border border-[#bbf7d0]/50">
                            Modified
                          </span>
                        )}

                        {activeSegmentId === seg.id && isPlaying && (
                            <div className="flex gap-0.5 h-3 items-end ml-1">
                                <div className="w-0.5 bg-primary animate-h-bounce-1"></div>
                                <div className="w-0.5 bg-primary animate-h-bounce-2"></div>
                                <div className="w-0.5 bg-primary animate-h-bounce-3"></div>
                            </div>
                        )}
                      </div>
                      
                      {activeSegmentId === seg.id ? (
                        <div className="relative group/edit">
                          <Textarea 
                            value={seg.text}
                            onChange={(e) => handleSegmentTextChange(seg.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm leading-relaxed min-h-[60px] bg-white dark:bg-card border-primary/30 focus:border-primary shadow-sm rounded-[2px]"
                            placeholder="Edit transcription..."
                          />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 bg-white dark:bg-card border border-border rounded-[2px] shadow-sm h-7">
                              <Select 
                                className="h-6 text-[10px] py-0 pl-2 pr-6 border-0 bg-transparent focus:ring-0" 
                                value={seg.lang}
                                onChange={(e) => handleSegmentLangChange(seg.id, e.target.value)}
                              >
                                <option value="auto">Auto</option>
                                <option value="en">EN</option>
                                <option value="zh">ZH</option>
                                <option value="yue">YUE</option>
                                <option value="de">DE</option>
                                <option value="fr">FR</option>
                                <option value="it">IT</option>
                              </Select>
                              <div className="w-px h-4 bg-border"></div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 hover:bg-secondary text-muted-foreground hover:text-primary rounded-l-none"
                                title="Retry Language Detection & Transcription"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSegmentTextChange(seg.id, "(Retrying...)");
                                  setTimeout(() => {
                                    setSegments(prev => prev.map(s => {
                                      if (s.id === seg.id) {
                                        const newText = `${s.originalText} (Retried [${s.lang}] via ${model})`;
                                        const newHistory = [...(s.history || []), {
                                          model: model,
                                          lang: s.lang,
                                          text: newText,
                                          timestamp: new Date().toISOString()
                                        }];
                                        return { ...s, text: newText, history: newHistory };
                                      }
                                      return s;
                                    }));
                                  }, 1000);
                                }}
                              >
                                <RefreshCw size={12} />
                              </Button>
                            </div>
                            {seg.text !== seg.originalText && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground bg-white dark:bg-card border border-border shadow-sm rounded-[2px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSegmentTextChange(seg.id, seg.originalText);
                                }}
                              >
                                Revert
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className={cn(
                          "text-sm leading-relaxed transition-colors",
                          activeSegmentId === seg.id ? "text-foreground" : "text-foreground/80"
                        )}>{seg.text}</p>
                      )}
                    </div>
                    <div className="sm:w-auto shrink-0 flex items-center gap-1.5">
                      <div className="flex items-center justify-center bg-white dark:bg-card rounded-[2px] border border-border p-2 group-hover/seg:border-primary/50 transition-colors">
                        <Play size={16} className={cn(activeSegmentId === seg.id && isPlaying ? "text-primary fill-primary" : "text-muted-foreground")} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "translation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
                <div className="flex flex-col">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Line-by-Line Translation</h4>
                  <div className="flex-1 bg-muted border border-border rounded-[2px] p-4 space-y-4 overflow-y-auto">
                    {segments.map((seg, i) => (
                      <div key={i} className="space-y-1 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <p className="text-sm text-foreground/80">{seg.text}</p>
                        <p className="text-sm text-primary font-medium">{"[Translated content mock based on input language to target]"}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Summary</h4>
                  <div className="flex-1 bg-muted border border-border rounded-[2px] p-5 prose prose-slate dark:prose-invert prose-sm max-w-none">
                    <h3 className="text-foreground mt-0">Conversation Overview</h3>
                    <p className="text-foreground/80">
                      The speakers discussed their satisfaction with the current iteration of the system design, highlighting that it feels like a "second home". 
                    </p>
                    <ul className="text-foreground/80 marker:text-primary">
                      <li>Latency improvements recognized by Speaker 0.</li>
                      <li>Speaker 1 outlined a goal for <strong>sub-200ms</strong> latency by Q3.</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">Generated via abstractive summarization.</p>
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