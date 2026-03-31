import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import { Play, Square, Code, AlignLeft, ListMusic, Database, Info, FileAudio, RotateCcw, FastForward, Timer } from "lucide-react";
import { Card, Button, Label, Select, Textarea, cn } from "./ui";
import { AudioWaveform } from "./AudioWaveform";
import type { AppContextType } from "./Layout";

const initialSegments = [
  { id: 1, start: 0.0, end: 2.5, speaker: "Speaker 0", lang: "en", text: "I feel like this is my second home.", originalText: "I feel like this is my second home." },
  { id: 2, start: 2.5, end: 5.1, speaker: "Speaker 1", lang: "en", text: "That's exactly what we wanted to achieve with the new design.", originalText: "That's exactly what we wanted to achieve with the new design." },
  { id: 3, start: 5.1, end: 8.4, speaker: "Speaker 0", lang: "en", text: "It really shows. The latency has improved dramatically since the last update.", originalText: "It really shows. The latency has improved dramatically since the last update." },
  { id: 4, start: 8.4, end: 11.0, speaker: "Speaker 1", lang: "en", text: "We're aiming for sub-200 milliseconds by Q3.", originalText: "We're aiming for sub-200 milliseconds by Q3." },
];

export function EvaluationWorkbench() {
  const { datasets, activeDatasetId, userPreferences } = useOutletContext<AppContextType>();
  const [activeTab, setActiveTab] = useState<"raw" | "segments" | "translation">("segments");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const [segments, setSegments] = useState(initialSegments);
  
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
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sticky top-0 z-10 shadow-sm dark:shadow-black/20">
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
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={togglePlayback}
            disabled={!hasResults}
            className="shrink-0"
          >
            {isPlaying ? <Square size={14} className="mr-1.5" fill="currentColor" /> : <Play size={14} className="mr-1.5" fill="currentColor" />}
            {isPlaying ? "Pause" : "Listen"}
          </Button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
            <Timer size={14} className="ml-1 text-slate-400" />
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded transition-colors",
                  playbackSpeed === speed 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => handleSeek(0)} disabled={!hasResults} className="shrink-0">
            <RotateCcw size={14} className="mr-1.5" /> Reset
          </Button>
        </div>

        {hasResults && !isTranscribing && (
          <div className="ml-auto text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-medium bg-emerald-100 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Analysis Complete (1.2s)
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
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Using a real test MP3 for playback
            className="hidden"
          />
        </div>
      )}

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
                {JSON.stringify({ model: model, duration: 11.0, language: "en", confidence: 0.98, segments: segments }, null, 2)}
              </pre>
            )}

            {activeTab === "segments" && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {segments.map((seg) => (
                  <div 
                    key={seg.id} 
                    className={cn(
                        "bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col sm:flex-row gap-4 cursor-pointer group/seg",
                        activeSegmentId === seg.id ? "border-indigo-500 dark:border-indigo-600 ring-1 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-slate-200 dark:border-slate-800"
                    )}
                    onClick={() => handleSeek(seg.start)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium border transition-colors",
                            activeSegmentId === seg.id 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                                : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30"
                        )}>
                          {seg.speaker}
                        </span>
                        
                        <span className="px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-300 dark:border-slate-700 uppercase tracking-wider">
                          {seg.lang}
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s
                        </span>

                        {seg.text !== seg.originalText && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                            Modified
                          </span>
                        )}

                        {activeSegmentId === seg.id && isPlaying && (
                            <div className="flex gap-0.5 h-3 items-end ml-1">
                                <div className="w-0.5 bg-indigo-500 animate-h-bounce-1"></div>
                                <div className="w-0.5 bg-indigo-500 animate-h-bounce-2"></div>
                                <div className="w-0.5 bg-indigo-500 animate-h-bounce-3"></div>
                            </div>
                        )}
                      </div>
                      
                      {activeSegmentId === seg.id ? (
                        <div className="relative group/edit">
                          <Textarea 
                            value={seg.text}
                            onChange={(e) => handleSegmentTextChange(seg.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm leading-relaxed min-h-[60px] bg-white dark:bg-slate-950 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 dark:focus:border-indigo-600 shadow-sm"
                            placeholder="Edit transcription..."
                          />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                            {seg.text !== seg.originalText && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-2 text-[10px] text-slate-500 hover:text-slate-900"
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
                          activeSegmentId === seg.id ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-200"
                        )}>{seg.text}</p>
                      )}
                    </div>
                    <div className="sm:w-12 shrink-0 flex items-center justify-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-2 group-hover/seg:border-indigo-300 dark:group-hover/seg:border-indigo-700 transition-colors">
                      <Play size={16} className={cn(activeSegmentId === seg.id && isPlaying ? "text-indigo-600 fill-indigo-600" : "text-slate-400")} />
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
                    {segments.map((seg, i) => (
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