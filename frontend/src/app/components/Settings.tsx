import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { Save, Sliders, Cpu, Mic, MessageSquare } from "lucide-react";
import { Card, Button, Label, Select, Textarea, cn } from "./ui";
import type { AppContextType } from "./Layout";

export function Settings() {
  const { userPreferences, updateUserPreferences } = useOutletContext<AppContextType>();
  
  // Local state for the form so we can edit before saving
  const [prefs, setPrefs] = useState(userPreferences);
  const [isSaved, setIsSaved] = useState(false);

  // Sync if context changes unexpectedly
  useEffect(() => {
    setPrefs(userPreferences);
  }, [userPreferences]);

  const handleSave = () => {
    updateUserPreferences(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="text-indigo-600 dark:text-indigo-400" /> Global Preferences
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure default models and generation parameters used across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Preferences */}
        <Card className="p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Cpu size={18} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Model Preferences</h3>
          </div>

          <div className="space-y-1.5">
            <Label>Preferred Speech Recognition (ASR) Model</Label>
            <Select 
              value={prefs.asrModel} 
              onChange={(e) => setPrefs({ ...prefs, asrModel: e.target.value })}
            >
              <option value="auto">Auto-Fast (Default)</option>
              <option value="whisper">Whisper V3 Large</option>
              <option value="vibe">VibeVoice</option>
              <option value="azure">Azure Cognitive Speech</option>
            </Select>
            <p className="text-xs text-slate-500">This model will be selected by default in the Evaluation Workbench.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Preferred Language ID (LID) Model</Label>
            <Select 
              value={prefs.lidModel} 
              onChange={(e) => setPrefs({ ...prefs, lidModel: e.target.value })}
            >
              <option value="whisper-lid">Whisper LID (Zero-shot)</option>
              <option value="speechbrain">SpeechBrain Lang ID</option>
              <option value="vibe-lid">VibeVoice LID</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <MessageSquare size={14} className="text-slate-400" /> Customized Context Words
            </Label>
            <Textarea
              placeholder="Comma-separated keywords, jargon, or names..."
              className="h-24 resize-none text-xs"
              value={prefs.contextWords}
              onChange={(e) => setPrefs({ ...prefs, contextWords: e.target.value })}
            />
            <p className="text-[10px] text-slate-500">These will be globally applied as hints to the ASR models.</p>
          </div>
        </Card>

        {/* Decoding Preferences */}
        <Card className="p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Mic size={18} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Decoding & Sampling</h3>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label className="text-slate-800 dark:text-slate-200">Enable Sampling</Label>
              <p className="text-xs text-slate-500">Use probabilistic decoding globally</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={prefs.enableSampling}
                onChange={(e) => setPrefs({ ...prefs, enableSampling: e.target.checked })} 
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className={cn("space-y-4 transition-opacity", !prefs.enableSampling && "opacity-50 pointer-events-none")}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperature</Label>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{prefs.temperature.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={prefs.temperature}
                onChange={(e) => setPrefs({ ...prefs, temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0 (Deterministic)</span>
                <span>2.0 (Random)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Top-p</Label>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{prefs.topP.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={prefs.topP}
                onChange={(e) => setPrefs({ ...prefs, topP: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0</span>
                <span>1.0</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button onClick={handleSave} className="px-6">
          <Save size={16} className="mr-2" /> Save Preferences
        </Button>
        {isSaved && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Settings saved successfully.
          </span>
        )}
      </div>
    </div>
  );
}