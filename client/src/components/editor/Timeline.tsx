import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Scissors, Trash2, Plus } from "lucide-react";
import { useEditorState } from "@/hooks/use-editor-state";
import { useTimeline, useCreateTimelineItem, useUpdateTimelineItem, useDeleteTimelineItem } from "@/hooks/use-timeline";
import { formatTime } from "@/lib/utils";

const TRACKS = [
  { id: "video", name: "Main Video", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-cyan-500/50" },
  { id: "audio", name: "Audio", color: "from-purple-500/20 to-pink-500/20", borderColor: "border-pink-500/50" },
  { id: "text", name: "Text/Effects", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-orange-500/50" },
];

export function Timeline({ projectId }: { projectId: number }) {
  const { data: items = [] } = useTimeline(projectId);
  const createItem = useCreateTimelineItem(projectId);
  const updateItem = useUpdateTimelineItem();
  const deleteItem = useDeleteTimelineItem();
  
  const { 
    currentTime, duration, isPlaying, zoom, selectedItemId, 
    setCurrentTime, togglePlay, setSelectedItemId 
  } = useEditorState();

  const timelineRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // Animation Loop for Playback
  const animate = (time: number) => {
    if (lastTimeRef.current != undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      if (isPlaying) {
        setCurrentTime(currentTime + deltaTime);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, currentTime]);

  // Click on timeline ruler to seek
  const handleRulerClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 150; // 150 is track header width
    if (x < 0) return;
    
    const percentage = x / (timelineRef.current.offsetWidth - 150);
    setCurrentTime(Math.max(0, Math.min(percentage * duration, duration)));
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data || !timelineRef.current) return;
    
    const asset = JSON.parse(data);
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 150;
    
    const dropTime = Math.max(0, (x / (timelineRef.current.offsetWidth - 150)) * duration);
    
    createItem.mutate({
      trackId,
      assetId: asset.assetId,
      startTime: dropTime,
      duration: 5, // Default 5s
      sourceStartTime: 0,
      properties: { url: asset.url, name: asset.name },
    });
  };

  const handleDeleteSelected = () => {
    if (selectedItemId) {
      deleteItem.mutate({ id: selectedItemId, projectId });
      setSelectedItemId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-t border-white/10 select-none">
      {/* Timeline Toolbar */}
      <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="text-sm font-mono text-white ml-2 tabular-nums">
            {formatTime(currentTime)} <span className="text-muted-foreground">/ {formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDeleteSelected}
            disabled={!selectedItemId}
            className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
            <Scissors className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <input 
            type="range" 
            min="0.5" 
            max="3" 
            step="0.1"
            defaultValue={zoom}
            onChange={(e) => useEditorState.getState().setZoom(parseFloat(e.target.value))}
            className="w-24 accent-primary"
          />
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative" ref={timelineRef}>
        {/* Ruler */}
        <div 
          className="h-8 border-b border-white/5 sticky top-0 bg-card/90 backdrop-blur-md z-20 flex cursor-text"
          onClick={handleRulerClick}
        >
          <div className="w-[150px] shrink-0 border-r border-white/5 bg-card" />
          <div className="flex-1 relative timeline-grid timeline-grid-sub">
            {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
              <div 
                key={i} 
                className="absolute text-[10px] text-muted-foreground mt-1" 
                style={{ left: `${(i / duration) * 100}%`, transform: 'translateX(-50%)' }}
              >
                {i % 5 === 0 ? `00:${i.toString().padStart(2, '0')}` : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        <div className="relative pb-8">
          {TRACKS.map((track) => (
            <div 
              key={track.id}
              className="flex h-24 border-b border-white/5 group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, track.id)}
            >
              {/* Track Header */}
              <div className="w-[150px] shrink-0 border-r border-white/5 bg-card/50 flex flex-col justify-center px-3 relative z-10">
                <span className="text-xs font-semibold text-white/80">{track.name}</span>
                <span className="text-[10px] text-muted-foreground">Track</span>
              </div>
              
              {/* Track Content */}
              <div className="flex-1 relative bg-black/20 timeline-grid-sub group-hover:bg-black/30 transition-colors">
                {items
                  .filter(item => item.trackId === track.id)
                  .map(item => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      drag="x"
                      dragMomentum={false}
                      onDragEnd={(e, info) => {
                        const trackWidth = timelineRef.current!.offsetWidth - 150;
                        const timeDelta = (info.offset.x / trackWidth) * duration;
                        updateItem.mutate({
                          id: item.id,
                          projectId,
                          startTime: Math.max(0, item.startTime + timeDelta)
                        });
                      }}
                      className={`absolute top-2 bottom-2 rounded-md border-2 bg-gradient-to-r ${track.color} backdrop-blur-sm px-2 py-1 overflow-hidden cursor-grab active:cursor-grabbing shadow-lg ${
                        selectedItemId === item.id ? `border-white ring-2 ring-white/20 z-10` : track.borderColor
                      }`}
                      style={{
                        left: `${(item.startTime / duration) * 100}%`,
                        width: `${(item.duration / duration) * 100}%`
                      }}
                    >
                      <div className="text-xs font-medium text-white truncate drop-shadow-md">
                        {(item.properties as any)?.name || "Media"}
                      </div>
                    </motion.div>
                ))}
              </div>
            </div>
          ))}

          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-accent playhead-line z-30 pointer-events-none"
            style={{ 
              left: `calc(150px + ${(currentTime / duration) * 100}%)`,
              display: currentTime <= duration ? 'block' : 'none'
            }}
          >
            <div className="absolute -top-3 -left-2 w-4 h-4 bg-accent rounded-sm shadow-[0_0_10px_rgba(255,0,85,0.5)] flex items-center justify-center">
              <div className="w-1 h-2 bg-white/50 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
