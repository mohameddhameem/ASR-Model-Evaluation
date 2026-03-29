import { useState } from "react";
import { Search, Filter, UploadCloud, FileAudio, CheckCircle2, Circle } from "lucide-react";
import { Input, Select, cn } from "./ui";
import type { DatasetItem } from "./Layout";

interface DatasetSidebarProps {
  datasets: DatasetItem[];
  addDatasetItem: (item: DatasetItem) => void;
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string) => void;
}

export function DatasetSidebar({ datasets, addDatasetItem, activeDatasetId, setActiveDatasetId }: DatasetSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    let files: FileList | null = null;
    
    if ('dataTransfer' in e) {
      files = e.dataTransfer.files;
    } else if ('target' in e) {
      files = (e.target as HTMLInputElement).files;
    }

    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        const newId = `ds-${Math.random().toString(36).substring(7)}`;
        addDatasetItem({
          id: newId,
          name: file.name,
          url: url,
          type: file.type,
          duration: "Unknown", 
          transcriptionVerified: false,
          lidVerified: false,
          detectedLanguage: "auto",
        });
        
        // Auto-select if it's the first file uploaded
        if (!activeDatasetId) setActiveDatasetId(newId);
      });
    }
  };

  const filteredDatasets = datasets.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "verified") return d.transcriptionVerified && d.lidVerified;
    if (filter === "pending_trans") return !d.transcriptionVerified;
    if (filter === "pending_lid") return !d.lidVerified;
    return true;
  });

  return (
    <aside 
      className="flex flex-col w-72 lg:w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 z-10 relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileUpload}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-50/90 dark:bg-indigo-900/90 border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center backdrop-blur-sm">
          <UploadCloud size={48} className="text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Drop audio files here</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">Add to Dataset Manager</p>
        </div>
      )}

      {/* Header & Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0 bg-white dark:bg-slate-950/50">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Dataset Manager</h2>
        
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <Input 
            placeholder="Search files..." 
            className="pl-8 h-9 text-xs" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <Select 
            className="h-8 text-xs py-0" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Files</option>
            <option value="verified">Fully Verified</option>
            <option value="pending_trans">Pending Transcription</option>
            <option value="pending_lid">Pending Language ID</option>
          </Select>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
        {filteredDatasets.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 mt-4">
            No files match your filters.
          </div>
        ) : (
          filteredDatasets.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveDatasetId(item.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg flex gap-3 transition-colors border",
                activeDatasetId === item.id
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <div className="shrink-0 mt-0.5">
                <FileAudio size={16} className={activeDatasetId === item.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  activeDatasetId === item.id ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300"
                )}>
                  {item.name}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px]">
                  <div className="flex items-center gap-1" title="Language ID Status">
                    <span className="text-slate-500 font-semibold">LID</span>
                    {item.lidVerified ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Circle size={12} className="text-slate-300 dark:text-slate-600" />}
                  </div>
                  <div className="flex items-center gap-1" title="Transcription Status">
                    <span className="text-slate-500 font-semibold">TRN</span>
                    {item.transcriptionVerified ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Circle size={12} className="text-slate-300 dark:text-slate-600" />}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Upload Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950/50">
        <input 
          type="file" 
          accept="audio/*,video/*" 
          className="hidden" 
          id="sidebar-upload" 
          multiple
          onChange={handleFileUpload} 
        />
        <label 
          htmlFor="sidebar-upload"
          className="flex items-center justify-center w-full gap-2 p-2 rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
          <UploadCloud size={14} /> Upload New Media
        </label>
      </div>
    </aside>
  );
}