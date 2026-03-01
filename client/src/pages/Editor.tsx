import { useParams } from "wouter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TopBar } from "@/components/editor/TopBar";
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { Preview } from "@/components/editor/Preview";
import { Timeline } from "@/components/editor/Timeline";
import { useProject } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";

export default function Editor() {
  const params = useParams();
  const projectId = parseInt(params.id || "0", 10);
  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-display font-medium text-white">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-white mb-2">Project not found</h1>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or was deleted.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TopBar projectId={projectId} />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={25} minSize={15} maxSize={40}>
                <AssetLibrary projectId={projectId} />
              </Panel>
              
              <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors cursor-col-resize" />
              
              <Panel defaultSize={75} minSize={40}>
                <Preview projectId={projectId} />
              </Panel>
            </PanelGroup>
          </Panel>
          
          <PanelResizeHandle className="h-1 bg-border/50 hover:bg-primary/50 transition-colors cursor-row-resize relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
              <div className="w-8 h-1 bg-white/10 rounded-full" />
            </div>
          </PanelResizeHandle>
          
          <Panel defaultSize={40} minSize={20}>
            <Timeline projectId={projectId} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
