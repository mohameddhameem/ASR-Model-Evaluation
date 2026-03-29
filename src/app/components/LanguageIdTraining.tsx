import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { Play, Pause, Save, Globe2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, Button, Select, Badge, cn } from "./ui";
import type { AppContextType } from "./Layout";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh", label: "Mandarin" },
  { value: "yue", label: "Cantonese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
];

export function LanguageIdTraining() {
  const { datasets, updateDatasetItem } = useOutletContext<AppContextType>();
  
  // Local state for tracking what is playing
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  // Clean up audio when unmounting
  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      // Pause
      if (activeAudio) activeAudio.pause();
      setPlayingId(null);
    } else {
      // Play new
      if (activeAudio) activeAudio.pause();
      if (url) {
        const audio = new Audio(url);
        audio.onended = () => setPlayingId(null);
        audio.play();
        setActiveAudio(audio);
      }
      setPlayingId(id);
    }
  };

  const handleUpdateVerified = (id: string, val: string) => {
    updateDatasetItem(id, { verifiedLanguage: val, lidVerified: true });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe2 className="text-indigo-600 dark:text-indigo-400" /> Language ID Ground Truth
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and correct auto-detected languages to build robust LID datasets.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-medium">Media Preview</th>
                <th className="py-4 px-6 font-medium">File Name</th>
                <th className="py-4 px-6 font-medium">Duration</th>
                <th className="py-4 px-6 font-medium">Auto-Detected</th>
                <th className="py-4 px-6 font-medium">Verified Language</th>
                <th className="py-4 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm bg-white dark:bg-transparent">
              {datasets.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                  <td className="py-3 px-6">
                    <button 
                      onClick={() => togglePlay(row.id, row.url)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        playingId === row.id 
                          ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {playingId === row.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
                    </button>
                  </td>
                  <td className="py-3 px-6 font-medium text-slate-900 dark:text-slate-300">
                    <span className="block truncate max-w-[200px]" title={row.name}>{row.name}</span>
                  </td>
                  <td className="py-3 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">{row.duration}</td>
                  <td className="py-3 px-6">
                    <Badge variant="default">
                      {LANGUAGES.find(l => l.value === row.detectedLanguage)?.label || row.detectedLanguage || "Unknown"}
                    </Badge>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <Select 
                        className={cn(
                          "w-40", 
                          !row.lidVerified && "border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400/20 dark:ring-amber-500/20"
                        )}
                        value={row.verifiedLanguage || ""}
                        onChange={(e) => handleUpdateVerified(row.id, e.target.value)}
                      >
                        <option value="" disabled>Select language...</option>
                        {LANGUAGES.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </Select>
                      
                      {!row.lidVerified && (
                        <AlertCircle size={16} className="text-amber-500 shrink-0" title="Requires verification" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    {row.lidVerified ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {datasets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No dataset files available. Upload files in the Dataset Manager.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="flex items-center justify-between text-sm text-slate-500 px-2">
        <span>Showing {datasets.length} items</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled>Previous</Button>
          <Button variant="ghost" size="sm" className="bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">Next</Button>
        </div>
      </div>
    </div>
  );
}