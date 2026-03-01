import { Link } from "wouter";
import { ArrowLeft, Download, Settings, Share2 } from "lucide-react";
import { useProject } from "@/hooks/use-projects";

export function TopBar({ projectId }: { projectId: number }) {
  const { data: project } = useProject(projectId);

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-card/50 backdrop-blur-md z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-4 w-[1px] bg-border" />
        <h1 className="font-display font-semibold text-lg bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {project?.title || "Loading..."}
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground font-medium">
          {project?.aspectRatio || "9:16"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
          <Settings className="w-4 h-4" />
        </button>
        <button className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="px-5 py-2 bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </header>
  );
}
