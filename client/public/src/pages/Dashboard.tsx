import { Link, useLocation } from "wouter";
import { Plus, Video, Clock, MoreVertical } from "lucide-react";
import { useProjects, useCreateProject } from "@/hooks/use-projects";

export default function Dashboard() {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const [, setLocation] = useLocation();

  const handleCreate = () => {
    createProject.mutate({
      title: `Project ${projects.length + 1}`,
      aspectRatio: "9:16"
    }, {
      onSuccess: (data) => {
        setLocation(`/editor/${data.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="h-16 border-b border-border/50 flex items-center px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight">KlipCut</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Recent Projects</h2>
            <p className="text-muted-foreground">Continue editing where you left off.</p>
          </div>
          
          <button
            onClick={handleCreate}
            disabled={createProject.isPending}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
          >
            <Plus className="w-5 h-5" />
            {createProject.isPending ? "Creating..." : "New Project"}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-white/10">
            <Video className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Create your first vertical masterpiece.</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-semibold transition-colors"
            >
              Start Creating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="group relative">
                <Link href={`/editor/${project.id}`} className="block relative aspect-[9/16] bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                  {/* Fake thumbnail bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-card" />
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity mix-blend-overlay" />
                  
                  {/* Card Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-medium text-white/80 border border-white/10">
                        {project.aspectRatio}
                      </span>
                      <button 
                        className="p-1.5 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-lg text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-medium mb-1 drop-shadow-md line-clamp-1">{project.title}</h3>
                      <div className="flex items-center text-xs text-white/50 gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Edited recently</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
