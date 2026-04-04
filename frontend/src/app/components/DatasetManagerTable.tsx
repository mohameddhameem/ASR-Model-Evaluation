import { useState } from "react";
import { useOutletContext } from "react-router";
import { Database, FileAudio, CheckCircle2, Circle, Play, Pause, Search, Download, Trash2, Copy } from "lucide-react";
import { Card, Button, Badge, Input, cn } from "./ui";
import type { AppContextType } from "../../types";

export function DatasetManagerTable() {
  const { datasets } = useOutletContext<AppContextType>();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "date" | "duration">("date");

  const filteredDatasets = datasets
    .filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesDate = dateFilter ? d.uploadDate.startsWith(dateFilter) : true;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date") return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      return 0;
    });

  const stats = {
    total: datasets.length,
    transcriptionVerified: datasets.filter(d => d.transcriptionVerified).length,
    lidVerified: datasets.filter(d => d.lidVerified).length,
    totalDuration: datasets.reduce((sum, d) => {
      const parts = d.duration?.split(':') || ['0', '0'];
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return sum + (mins * 60 + secs);
    }, 0)
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDatasets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDatasets.map(d => d.id)));
    }
  };

  const handleExport = () => {
    const csvData = filteredDatasets.map(d => ({
      'File Name': d.name,
      'Type': d.type,
      'Duration': d.duration || 'N/A',
      'Upload Date': new Date(d.uploadDate).toLocaleDateString(),
      'Language': d.verifiedLanguage || d.detectedLanguage || 'Unknown',
      'LID Status': d.lidVerified ? 'Verified' : 'Pending',
      'Transcription Status': d.transcriptionVerified ? 'Verified' : 'Pending'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Total Files</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">{Math.floor(stats.totalDuration / 60)}m {stats.totalDuration % 60}s</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">LID Verified</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.lidVerified}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.lidVerified / stats.total) * 100) : 0}%</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Transcription Verified</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.transcriptionVerified}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.transcriptionVerified / stats.total) * 100) : 0}%</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Both Verified</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {datasets.filter(d => d.lidVerified && d.transcriptionVerified).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Fully processed</div>
        </Card>
      </div>

      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="text-indigo-600 dark:text-indigo-400" /> Dataset Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete list of all media files currently loaded in your workspace.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <Input 
              placeholder="Search dataset..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm"
              title="Filter by Upload Date"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="date">Sort: Date</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {selectedIds.size} file{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-700 dark:text-slate-300"
            >
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="select-all"
              checked={selectedIds.size === filteredDatasets.length && filteredDatasets.length > 0}
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
            onClick={handleExport}
            className="flex items-center gap-2"
            disabled={filteredDatasets.length === 0}
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6 font-medium w-12">Select</th>
                <th className="py-4 px-6 font-medium w-16">Play</th>
                <th className="py-4 px-6 font-medium">File Name</th>
                <th className="py-4 px-6 font-medium">Type</th>
                <th className="py-4 px-6 font-medium">Upload Date</th>
                <th className="py-4 px-6 font-medium">Duration</th>
                <th className="py-4 px-6 font-medium">Language ID Status</th>
                <th className="py-4 px-6 font-medium">Transcription Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm bg-white dark:bg-transparent">
              {filteredDatasets.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                  <td className="py-3 px-6">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-6">
                    <button 
                      onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        playingId === item.id 
                          ? "bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {playingId === item.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
                    </button>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <FileAudio size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-300 truncate max-w-[300px] block" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-slate-500 dark:text-slate-400 text-xs">
                    {item.type.split('/')[1]?.toUpperCase() || 'Audio'}
                  </td>
                  <td className="py-3 px-6 text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(item.uploadDate).toLocaleDateString()} {new Date(item.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {item.duration}
                  </td>
                  <td className="py-3 px-6">
                    {item.lidVerified ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex w-max items-center gap-1.5 font-medium">
                        <CheckCircle2 size={12} /> Verified ({item.verifiedLanguage?.toUpperCase()})
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex w-max items-center gap-1.5 border-slate-200 dark:border-slate-700">
                        <Circle size={12} /> Pending (Auto: {item.detectedLanguage?.toUpperCase()})
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {item.transcriptionVerified ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex w-max items-center gap-1.5 font-medium">
                        <CheckCircle2 size={12} /> Annotated
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex w-max items-center gap-1.5 border-slate-200 dark:border-slate-700">
                        <Circle size={12} /> Unverified
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDatasets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Database size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                    No files found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filteredDatasets.length} total entries</span>
      </div>
    </div>
  );
}