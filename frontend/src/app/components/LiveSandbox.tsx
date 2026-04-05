import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, Save, Trash2, Smartphone, Cpu, Cloud, Zap } from "lucide-react";
import { Card, Button, cn } from "./ui";

export function LiveSandbox() {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalTexts, setFinalTexts] = useState<string[]>([]);
  const [visualizerLevel, setVisualizerLevel] = useState(0);
  const timerRef = useRef<any>(null);

  // Simulation of real-time transcription
  useEffect(() => {
    if (isListening) {
      const mockPhrases = [
        "In the next generation of our ASR platform,",
        "we are integrating real-time intelligence",
        "to deliver sub-200 millisecond latency",
        "for conversational AI applications."
      ];
      
      let phraseIdx = 0;
      let charIdx = 0;
      
      timerRef.current = setInterval(() => {
        // Random volume fluctuations for visualizer
        setVisualizerLevel(Math.random() * 100);
        
        // Typing effect simulation
        const currentPhrase = mockPhrases[phraseIdx % mockPhrases.length];
        setInterimText(currentPhrase.substring(0, charIdx + 1));
        
        charIdx++;
        
        if (charIdx >= currentPhrase.length) {
          setFinalTexts(prev => [currentPhrase, ...prev]);
          setInterimText("");
          charIdx = 0;
          phraseIdx++;
        }
      }, 80);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setInterimText("");
      setVisualizerLevel(0);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Speech sandbox</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test real-time transcription with your device microphone. Experience interim result latency and model confidence scores in a live environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Controls & Visualizer */}
        <Card className="p-6 flex flex-col items-center justify-between min-h-[400px] border-primary/10 bg-gradient-to-b from-white to-secondary/10 dark:from-card dark:to-primary/5">
          <div className="w-full flex justify-between items-center mb-8">
            <span className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              isListening ? "bg-red-500/10 text-red-500 animate-pulse border border-red-500/20" : "bg-muted text-muted-foreground border border-border"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-red-500" : "bg-muted-foreground")} />
              {isListening ? "Listening" : "Standby"}
            </span>
            <div className="flex gap-2">
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Clear All">
                  <Trash2 size={16} />
               </Button>
            </div>
          </div>

          {/* Glowing Circular Visualizer */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glows */}
            <div 
              className="absolute w-48 h-48 rounded-full bg-primary/20 blur-3xl transition-all duration-300 transform scale-150" 
              style={{ opacity: isListening ? 0.3 + (visualizerLevel / 200) : 0 }}
            />
            
            {/* Pulsing Rings */}
            <div 
              className={cn(
                "absolute border-2 border-primary/30 rounded-full transition-all duration-150",
                isListening ? "w-40 h-40" : "w-32 h-32"
              )}
              style={{ transform: `scale(${1 + (visualizerLevel / 100) * 0.4})` }}
            />
            <div 
              className={cn(
                "absolute border border-primary/20 rounded-full transition-all duration-300 delay-75",
                isListening ? "w-48 h-48" : "w-32 h-32"
              )}
              style={{ transform: `scale(${1 + (visualizerLevel / 100) * 0.6})` }}
            />

            {/* Central Mic Button */}
            <button 
              onClick={() => setIsListening(!isListening)}
              className={cn(
                "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl overflow-hidden group",
                isListening 
                  ? "bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-500/20" 
                  : "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95"
              )}
            >
               {/* Waveform inside button (simulated) */}
               {isListening && (
                 <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i} 
                        className="w-1 bg-white rounded-full animate-h-bounce-1"
                        style={{ height: `${20 + Math.random() * 40}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                 </div>
               )}
               {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>

          <div className="w-full mt-12 space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5"><Zap size={12} className="text-yellow-500" /> Latency</span>
              <span className="text-foreground font-bold">184ms</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
               <div 
                className="h-full bg-primary transition-all duration-200 ease-out" 
                style={{ width: `${visualizerLevel}%` }}
               />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white dark:bg-card border border-border rounded-[2px] text-center">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Confidence</p>
                    <p className="text-sm font-bold text-primary">98.4%</p>
                </div>
                <div className="p-2 bg-white dark:bg-card border border-border rounded-[2px] text-center">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Language</p>
                    <p className="text-sm font-bold text-primary">EN</p>
                </div>
            </div>
          </div>
        </Card>

        {/* Right: Live Transcript Area */}
        <Card className="md:col-span-2 flex flex-col border-border bg-white dark:bg-card rounded-[2px] shadow-sm overflow-hidden h-full">
           <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-[2px] border border-primary/20">
                    <Cpu size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">VibeVoice V4 [Live]</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary text-foreground px-2.5 py-1 rounded-[2px] border border-border">
                    <Cloud size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">WebSocket</span>
                  </div>
              </div>
              <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5">
                <Save size={14} /> Export Logs
              </Button>
           </div>

           <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px]">
              {/* Interim Text Section - The "Novel" Feature */}
              {interimText && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                      Interim Results
                   </p>
                   <p className="text-xl font-medium text-foreground tracking-tight leading-relaxed opacity-40">
                      {interimText}
                   </p>
                </div>
              )}

              {/* Finalized Results */}
              <div className="space-y-4">
                 {finalTexts.length === 0 && !interimText && (
                   <div className="h-full flex flex-row items-center justify-center p-12 text-center opacity-50 space-x-12 mt-12 bg-muted/20 border-border border ">
                      <div className="flex-1 flex flex-col items-center">
                        <Smartphone size={32} className="mb-4 text-primary" />
                        <h3 className="text-sm font-semibold mb-1">Click to Start</h3>
                        <p className="text-xs text-muted-foreground">Transcribe in real-time from your device</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <Play size={32} className="mb-4 text-primary" />
                        <h3 className="text-sm font-semibold mb-1">Low Latency</h3>
                        <p className="text-xs text-muted-foreground">Experience sub-200ms processing</p>
                      </div>
                   </div>
                 )}
                 {finalTexts.map((text, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "group p-4 bg-muted/20 border border-border rounded-[2px] transition-all hover:border-primary/30",
                      i === 0 ? "scale-[1.01] bg-white dark:bg-card border-primary/20 shadow-sm" : ""
                    )}
                   >
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[9px] font-bold text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded-[1px]">Speaker 0</span>
                         <span className="text-[9px] font-mono text-muted-foreground">{(Date.now() - i * 5000) % 60000}ms</span>
                         <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-[#16a34a] font-bold">99.2% MATCH</span>
                         </div>
                      </div>
                      <p className="text-base text-foreground leading-relaxed">{text}</p>
                   </div>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* Novel Concept: Model Performance Timeline */}
      <Card className="p-1 border-border rounded-[2px] bg-muted overflow-hidden">
        <div className="flex h-12">
            {[...Array(20)].map((_, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "flex-1 border-r border-background/20 last:border-0 relative group",
                        i % 7 === 0 ? "bg-red-500/20" : "bg-primary/20"
                    )}
                >
                    <div 
                        className={cn("absolute bottom-0 left-0 right-0 h-full origin-bottom transition-all duration-1000", i % 7 === 0 ? "bg-red-500/40" : "bg-primary/40")} 
                        style={{ transform: `scaleY(${isListening ? 0.3 + Math.random() * 0.7 : 0.1})` }} 
                    />
                    <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[8px] px-1 rounded border shadow-sm z-20 pointer-events-none whitespace-nowrap">
                        {Math.floor(150 + Math.random() * 100)}ms
                    </div>
                </div>
            ))}
        </div>
        <div className="flex justify-between px-2 py-1 text-[8px] font-mono text-muted-foreground uppercase tracking-widest bg-white/50 dark:bg-black/20">
            <span>Latency History (ms)</span>
            <div className="flex gap-4">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Stable</span>
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Jitter</span>
            </div>
        </div>
      </Card>
    </div>
  );
}
