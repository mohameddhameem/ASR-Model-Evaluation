import { useState } from "react";
import { Search, Filter, UploadCloud, FileAudio, CheckCircle2, Circle } from "lucide-react";
import { Input, Select, cn } from "./ui";
import type { DatasetItem } from "../../types";

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
          uploadDate: new Date().toISOString(),
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
      className="flex flex-col w-72 lg:w-80 bg-background dark:bg-[#181818] border-r border-border shrink-0 z-10 relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileUpload}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 dark:bg-primary/20 border-2 border-dashed border-primary flex flex-col items-center justify-center backdrop-blur-sm">
          <UploadCloud size={48} className="text-primary mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">Drop audio files here</h3>
          <p className="text-sm text-primary">Add to Dataset Manager</p>
        </div>
      )}

      {/* Header & Filters */}
      <div className="p-4 border-b border-border space-y-3 shrink-0 bg-white dark:bg-[#181818]">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Dataset Manager</h2>
        
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-8 h-9 text-xs rounded-[2px]" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <Select 
            className="h-8 text-xs py-0 rounded-[2px]" 
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
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-background dark:bg-[#181818]">
        {filteredDatasets.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground mt-4">
            No files match your filters.
          </div>
        ) : (
          filteredDatasets.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveDatasetId(item.id)}
              className={cn(
                "w-full text-left p-3 rounded-[2px] flex gap-3 transition-colors border",
                activeDatasetId === item.id
                  ? "bg-secondary border-primary/30 shadow-sm"
                  : "bg-white dark:bg-[#202020] border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="shrink-0 mt-0.5">
                <FileAudio size={16} className={activeDatasetId === item.id ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  activeDatasetId === item.id ? "text-primary font-semibold" : "text-foreground/80"
                )}>
                  {item.name}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px]">
                  <div className="flex items-center gap-1" title="Language ID Status">
                    <span className="text-muted-foreground font-semibold">LID</span>
                    {item.lidVerified ? <CheckCircle2 size={12} className="text-[#10b981]" /> : <Circle size={12} className="text-muted-foreground/30" />}
                  </div>
                  <div className="flex items-center gap-1" title="Transcription Status">
                    <span className="text-muted-foreground font-semibold">TRN</span>
                    {item.transcriptionVerified ? <CheckCircle2 size={12} className="text-[#10b981]" /> : <Circle size={12} className="text-muted-foreground/30" />}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Upload Footer */}
      <div className="p-3 border-t border-border shrink-0 bg-white dark:bg-[#181818]">
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
          className="flex items-center justify-center w-full gap-2 p-2 rounded-[2px] border border-dashed border-border text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
        >
          <UploadCloud size={14} /> Upload New Media
        </label>
      </div>
    </aside>
  );
}