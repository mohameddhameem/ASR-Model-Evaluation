import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from './ui';

interface Segment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  text: string;
}

interface AudioWaveformProps {
  duration: number;
  currentTime: number;
  segments: Segment[];
  onSeek?: (time: number) => void;
  className?: string;
  activeSegmentId?: number | null;
  zoom?: number; // 1 to 10
  showSentiment?: boolean;
}

export function AudioWaveform({
  duration,
  currentTime,
  segments,
  onSeek,
  className,
  activeSegmentId,
  zoom = 1,
  showSentiment = true,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverX, setHoverX] = useState(0);

  // Generate mock waveform data based on duration
  const peaks = useMemo(() => {
    const numPoints = 1000;
    const data = [];
    for (let i = 0; i < numPoints; i++) {
      // Create some pseudo-random but somewhat continuous peaks
      const val = 0.2 + 0.6 * Math.abs(Math.sin(i * 0.05) * Math.cos(i * 0.01) + Math.random() * 0.2);
      data.push(Math.min(val, 1));
    }
    return data;
  }, []);
  
  const sentimentData = useMemo(() => {
    const numPoints = 100;
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        // Mock sentiment: 0.5 is neutral, 1.0 is positive, 0.0 is negative
        const val = 0.5 + 0.3 * Math.sin(i * 0.15) + (Math.random() - 0.5) * 0.1;
        data.push(Math.max(0, Math.min(1, val)));
    }
    return data;
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);

    const barWidth = 2;
    const gap = 1;
    const totalBars = Math.floor(width / (barWidth + gap));
    
    // Draw background segments/regions
    segments.forEach((seg) => {
      const startX = (seg.start / duration) * width;
      const endX = (seg.end / duration) * width;
      const isActive = seg.id === activeSegmentId;

      const getSpeakerColor = (speakerName: string, active: boolean) => {
          let alphaBg = active ? '0.2' : '0.08';
          let alphaBorder = active ? '0.5' : '0.2';
          if (speakerName.includes("0")) return { bg: `rgba(79, 70, 229, ${alphaBg})`, border: `rgba(79, 70, 229, ${alphaBorder})`, label: '#6366f1' }; // Indigo
          if (speakerName.includes("1")) return { bg: `rgba(16, 185, 129, ${alphaBg})`, border: `rgba(16, 185, 129, ${alphaBorder})`, label: '#10b981' }; // Emerald
          if (speakerName.includes("2")) return { bg: `rgba(245, 158, 11, ${alphaBg})`, border: `rgba(245, 158, 11, ${alphaBorder})`, label: '#f59e0b' }; // Amber
          return { bg: `rgba(148, 163, 184, ${alphaBg})`, border: `rgba(148, 163, 184, ${alphaBorder})`, label: '#94a3b8' }; // Slate
      }

      const colors = getSpeakerColor(seg.speaker, isActive);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(startX, 0, endX - startX, height);
      
      // Draw segment borders
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();

      // Draw Speaker Label
      // We'll draw it near the top left of each segment region
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = colors.label;
      const labelText = seg.speaker.replace('peaker ', 'PK').toUpperCase();
      // only draw if the segment is wide enough to fit the text
      if (endX - startX > 30) {
          ctx.fillText(labelText, startX + 4, 14);
      }
    });

    // Draw waveform bars
    for (let i = 0; i < totalBars; i++) {
        const peakIndex = Math.floor((i / totalBars) * peaks.length);
        const peak = peaks[peakIndex];
        const barHeight = peak * (height * 0.8);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const progress = (currentTime / duration) * width;
        const isPlayed = x < progress;

        if (isPlayed) {
            ctx.fillStyle = '#6366f1'; // Indigo-500
        } else {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'; // Slate-400 with opacity
        }

        // Rounded rect for bars
        const radius = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#6366f1';
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(playheadX - 1, 0, 2, height);
    ctx.shadowBlur = 0;

    // Draw hover indicator
    if (isHovering) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fillRect(hoverX - 0.5, 0, 1, height);
        
        const hoverTime = (hoverX / width) * duration;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText(hoverTime.toFixed(2) + 's', hoverX + 5, 12);
    }

    // Draw sentiment line
    if (showSentiment) {
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)'; // Positive/Neutral green-ish
        
        const points = sentimentData;
        const step = width / (points.length - 1);
        
        for (let i = 0; i < points.length; i++) {
            const x = i * step;
            // Map sentiment 0-1 to height range (top part of waveform)
            const y = (height * 0.2) + (1 - points[i]) * (height * 0.3);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Label for sentiment
        ctx.font = '700 8px sans-serif';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.fillText('SENTIMENT OVERLAY', 4, height - 18);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [peaks, currentTime, duration, segments, activeSegmentId, isHovering, hoverX]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setHoverX(e.clientX - rect.left);
      setIsHovering(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && onSeek) {
      const clickX = e.clientX - rect.left;
      onSeek((clickX / rect.width) * duration);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-32 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-crosshair group shadow-inner",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
      
      {/* Timeline Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex items-center px-1 pointer-events-none">
        <div className="flex justify-between w-full px-2 text-[8px] font-mono text-slate-400 uppercase tracking-tighter">
            <span>0.0s</span>
            <span>{(duration / 4).toFixed(1)}s</span>
            <span>{(duration / 2).toFixed(1)}s</span>
            <span>{(duration * 0.75).toFixed(1)}s</span>
            <span>{duration.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}
