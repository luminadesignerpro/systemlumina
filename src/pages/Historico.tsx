import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { History, Trash2, Copy, Eye, Loader2, Search, Film, LayoutGrid, Circle, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

const typeIcons: Record<string, any> = { reel: Film, feed: LayoutGrid, story: Circle, carrossel: Image };
const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  agendado: "bg-primary/20 text-primary",
  publicado: "bg-green-500/20 text-green-700",
};

const Historico = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post excluído!");
      setSelectedPost(null);
    },
  });

  const filtered = posts.filter((p: any) =>
    p.generated_content?.toLowerCase().includes(search.toLowerCase()) ||
    p.nicho?.toLowerCase().includes(search.toLowerCase()) ||
    p.tema?.toLowerCase().includes(search.toLowerCase())
  );

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado! 📋");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={`flex flex-1 overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        {/* List */}
        <div className="w-[380px] border-r border-border overflow-y-auto p-5 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <History size={18} className="text-primary" />
            <h2 className="font-display text-lg font-bold">Histórico</h2>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} posts</span>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nicho, tema..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted border-border text-sm" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum post encontrado</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((post: any) => {
                const TypeIcon = typeIcons[post.post_type] || LayoutGrid;
                const isSelected = selectedPost?.id === post.id;
                return (
                  <motion.button
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onClick={() => setSelectedPost(isSelected ? null : post)}
                    className={`w-full text-left glass-card p-3 space-y-2 transition-all ${isSelected ? "ring-1 ring-primary" : "hover:bg-secondary/30"}`}
                  >
                    <div className="flex items-center gap-2">
                      <TypeIcon size={13} className="text-primary" />
                      <span className="text-xs font-bold uppercase text-primary">{post.post_type}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${statusColors[post.status] || "bg-muted text-muted-foreground"}`}>{post.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{post.nicho} {post.tema ? `· ${post.tema}` : ""}</p>
                    <p className="text-xs text-foreground/80 line-clamp-2">{post.generated_content?.slice(0, 80)}...</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(post.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}</p>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedPost ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = typeIcons[selectedPost.post_type] || LayoutGrid; return <Icon size={20} className="text-primary" />; })()}
                  <h3 className="font-display text-lg font-bold capitalize">{selectedPost.post_type}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[selectedPost.status] || ""}`}>{selectedPost.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyContent(selectedPost.generated_content || "")} className="gap-1.5">
                    <Copy size={14} /> Copiar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(selectedPost.id)} disabled={deleteMutation.isPending} className="gap-1.5">
                    <Trash2 size={14} /> Excluir
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedPost.nicho && <div className="glass-card p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Nicho</p><p className="text-sm">{selectedPost.nicho}</p></div>}
                {selectedPost.tema && <div className="glass-card p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Tema</p><p className="text-sm">{selectedPost.tema}</p></div>}
                {selectedPost.tom && <div className="glass-card p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Tom</p><p className="text-sm capitalize">{selectedPost.tom}</p></div>}
                {selectedPost.scheduled_at && <div className="glass-card p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Agendado</p><p className="text-sm">{format(new Date(selectedPost.scheduled_at), "dd/MM/yyyy HH:mm")}</p></div>}
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3"><Eye size={15} className="text-primary" /><h4 className="font-semibold text-sm">Conteúdo Gerado</h4></div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{selectedPost.generated_content}</p>
              </div>

              {selectedPost.media_url && (
                <div className="glass-card p-4">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Mídia</p>
                  <img src={selectedPost.media_url} alt="Mídia" className="w-full max-w-xs rounded-lg object-cover" />
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <History size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Selecione um post para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historico;
