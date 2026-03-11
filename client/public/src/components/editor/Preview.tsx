import { useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize2 } from "lucide-react";
import { useEditorState } from "@/hooks/use-editor-state";
import { useTimeline } from "@/hooks/use-timeline";

export function Preview({ projectId }: { projectId: number }) {
  const { data: timelineItems = [] } = useTimeline(projectId);
  const { currentTime, isPlaying, togglePlay } = useEditorState();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Find the video that should currently be playing
  const activeVideo = timelineItems.find(
    item => item.trackId === "video" && 
    currentTime >= item.startTime && 
    currentTime < (item.startTime + item.duration)
  );

  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    if (activeVideo && activeVideo.properties && typeof activeVideo.properties === 'object' && 'url' in activeVideo.properties) {
      const url = activeVideo.properties.url as string;
      if (url !== activeUrl) {
        setActiveUrl(url);
      }
    } else {
      setActiveUrl(null);
    }
  }, [activeVideo, activeUrl]);

  useEffect(() => {
    if (videoRef.current && activeVideo) {
      const targetTime = (activeVideo.sourceStartTime || 0) + (currentTime - activeVideo.startTime);
      
      // Only seek if we're out of sync by more than 0.25s
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.25) {
        videoRef.current.currentTime = targetTime;
      }

      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [currentTime, activeVideo, isPlaying]);

  return (
    <div className="h-full flex flex-col bg-black/20 p-4 items-center justify-center relative overflow-hidden">
      {/* 9:16 Aspect Ratio Container */}
      <div className="relative w-full max-w-[320px] aspect-[9/16] bg-black rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden group">
        
        {activeUrl ? (
          <video 
            ref={videoRef}
            src={activeUrl}
            className="w-full h-full object-cover"
            playsInline
            muted // Muted for preview to avoid autoplay restrictions in some browsers
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Play className="w-6 h-6 ml-1 opacity-50" />
            </div>
            <p className="text-sm font-medium opacity-50">No media at this time</p>
          </div>
        )}

        {/* Global Text Overlay Preview */}
        {timelineItems.filter(item => 
          item.trackId === "text" && 
          currentTime >= item.startTime && 
          currentTime < (item.startTime + item.duration)
        ).map((textItem, idx) => (
          <div 
            key={textItem.id} 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-3xl font-display font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-center px-4">
              {((textItem.properties as any)?.text) || "Double tap to edit"}
            </span>
          </div>
        ))}

        {/* Floating Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
