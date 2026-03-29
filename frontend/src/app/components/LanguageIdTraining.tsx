import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { Play, Pause, Save, Globe2, AlertCircle, CheckCircle2, Download, RotateCcw, Check } from "lucide-react";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [verificationStats, setVerificationStats] = useState({
    total: datasets.length,
    verified: datasets.filter(d => d.lidVerified).length,
    pending: datasets.filter(d => !d.lidVerified).length
  });

  // Update statistics when datasets change
  useEffect(() => {
    setVerificationStats({
      total: datasets.length,
      verified: datasets.filter(d => d.lidVerified).length,
      pending: datasets.filter(d => !d.lidVerified).length
    });
  }, [datasets]);

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

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === datasets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(datasets.map(d => d.id)));
    }
  };

  const handleVerifyAllSelected = () => {
    selectedIds.forEach(id => {
      const dataset = datasets.find(d => d.id === id);
      if (dataset && !dataset.lidVerified && dataset.verifiedLanguage) {
        updateDatasetItem(id, { lidVerified: true });
      }
    });
    setSelectedIds(new Set());
  };

  const handleResetSelected = () => {
    selectedIds.forEach(id => {
      updateDatasetItem(id, { verifiedLanguage: "", lidVerified: false });
    });
    setSelectedIds(new Set());
  };

  const handleExportResults = () => {
    const csvData = datasets.map(d => ({
      'File Name': d.name,
      'Duration': d.duration || 'N/A',
      'Auto-Detected': LANGUAGES.find(l => l.value === d.detectedLanguage)?.label || d.detectedLanguage,
      'Verified Language': LANGUAGES.find(l => l.value === d.verifiedLanguage)?.label || d.verifiedLanguage || 'Pending',
      'Status': d.lidVerified ? 'Verified' : 'Pending'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `language-id-verification-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe2 className="text-indigo-600 dark:text-indigo-400" /> Language ID Ground Truth
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and correct auto-detected languages to build robust LID datasets.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Total Files</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{verificationStats.total}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Verified</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verificationStats.verified}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Pending</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{verificationStats.pending}</div>
        </Card>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {selectedIds.size} file{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleVerifyAllSelected}
              className="text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              <Check size={14} className="mr-1" /> Verify All
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleResetSelected}
              className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
            >
              <RotateCcw size={14} className="mr-1" /> Reset
            </Button>
          </div>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="select-all"
              checked={selectedIds.size === datasets.length && datasets.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
            />
            <label htmlFor="select-all" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Select All
            </label>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleExportResults}
            className="flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-medium w-12">Select</th>
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
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelection(row.id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                  </td>
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
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No dataset files available. Upload files in the Dataset Manager.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}