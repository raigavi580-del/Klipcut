import { useState } from "react";
import { Search, Image, Music, Type, Plus, UploadCloud } from "lucide-react";
import { useAssets, useCreateAsset } from "@/hooks/use-assets";

const MOCK_ASSETS = [
  { name: "Neon City", url: "https://assets.mixkit.co/videos/preview/mixkit-neon-city-lights-at-night-4228-small.mp4", type: "video" },
  { name: "Forest Drone", url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-small.mp4", type: "video" },
  { name: "Ocean Waves", url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-small.mp4", type: "video" },
];

export function AssetLibrary({ projectId }: { projectId: number }) {
  const { data: assets = [] } = useAssets(projectId);
  const createAsset = useCreateAsset(projectId);
  const [activeTab, setActiveTab] = useState("video");

  const handleUploadMock = () => {
    const randomAsset = MOCK_ASSETS[Math.floor(Math.random() * MOCK_ASSETS.length)];
    createAsset.mutate({
      name: `${randomAsset.name} (Copy)`,
      url: randomAsset.url,
      type: randomAsset.type,
      metadata: {},
    });
  };

  const handleDragStart = (e: React.DragEvent, asset: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      assetId: asset.id,
      url: asset.url,
      type: asset.type,
      name: asset.name
    }));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="h-full flex flex-col bg-card/30 border-r border-white/5">
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex p-2 gap-1 border-b border-white/5">
        {[
          { id: "video", icon: Image, label: "Media" },
          { id: "audio", icon: Music, label: "Audio" },
          { id: "text", icon: Type, label: "Text" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto editor-scrollbar p-4">
        {assets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <UploadCloud className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm mb-4">No media uploaded yet. Upload your first clip to begin editing.</p>
            <button 
              onClick={handleUploadMock}
              disabled={createAsset.isPending}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors border border-white/10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {createAsset.isPending ? "Uploading..." : "Add Demo Asset"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {assets.map((asset) => (
              <div 
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                className="group relative aspect-[9/16] bg-black/50 rounded-xl overflow-hidden cursor-grab hover:ring-2 hover:ring-primary/50 transition-all"
              >
                {asset.type === "video" && asset.url ? (
                  <video src={asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-xs font-medium text-white truncate drop-shadow-md">{asset.name}</span>
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleUploadMock}
              disabled={createAsset.isPending}
              className="aspect-[9/16] bg-white/5 border border-dashed border-white/20 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:text-white hover:bg-primary/5 transition-all"
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Add Media</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
