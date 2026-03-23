import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, FileText, Film, LayoutGrid, Circle, Image, Clock, Check } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const typeIcons: Record<string, any> = { reel: Film, feed: LayoutGrid, story: Circle, carrossel: Image };
const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  agendado: "bg-primary/20 text-primary",
  pronto: "bg-yellow-500/20 text-yellow-600",
  publicado: "bg-green-500/20 text-green-700",
};

const Agendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const today = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const postsByDay = useMemo(() => {
    const map: Record<string, typeof posts> = {};
    posts.forEach((post) => {
      if (post.scheduled_at) {
        const key = format(new Date(post.scheduled_at), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(post);
      }
    });
    return map;
  }, [posts]);

  const scheduledPosts = posts.filter((p) => p.status === "agendado" || p.status === "rascunho");

  const handleSchedule = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").update({ status: "agendado" }).eq("id", postId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post agendado! 📅");
    } catch { toast.error("Erro ao agendar post"); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={`flex flex-1 overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        {/* Queue sidebar */}
        <div className="w-64 border-r border-border overflow-y-auto p-4 space-y-4 flex-shrink-0">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <FileText size={16} /> Fila
            <span className="text-xs text-muted-foreground ml-auto">{scheduledPosts.length} posts</span>
          </h2>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : scheduledPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">Nenhum post na fila.<br />Crie conteúdo com IA primeiro.</p>
          ) : (
            <div className="space-y-2">
              {scheduledPosts.map((post) => {
                const TypeIcon = typeIcons[post.post_type] || LayoutGrid;
                return (
                  <div key={post.id} className="glass-card p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon size={13} className="text-primary" />
                      <span className="text-xs font-bold uppercase text-primary">{post.post_type}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${statusColors[post.status] || ""}`}>{post.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{post.generated_content?.slice(0, 50)}...</p>
                    {post.scheduled_at && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock size={10} /> {format(new Date(post.scheduled_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </div>
                    )}
                    {post.status === "rascunho" && post.scheduled_at && (
                      <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => handleSchedule(post.id)}>
                        <Check size={12} className="mr-1" /> Confirmar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="flex-1 p-5 overflow-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentDate((d) => subMonths(d, 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentDate((d) => addMonths(d, 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                <ChevronRight size={16} />
              </button>
              <h2 className="font-display text-xl font-bold ml-2">{format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
            {DAYS.map((day) => (
              <div key={day} className="bg-secondary/50 py-2 text-center text-[10px] font-bold text-muted-foreground tracking-wider">{day}</div>
            ))}
            {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} className="bg-muted/30 min-h-[90px]" />)}
            {daysInMonth.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayPosts = postsByDay[key] || [];
              const isToday = isSameDay(day, today);
              return (
                <motion.div key={key} whileHover={{ scale: 1.01 }} className={`bg-card min-h-[90px] p-2 transition-colors hover:bg-secondary/30 ${isToday ? "ring-1 ring-primary/50" : ""}`}>
                  <span className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center" : "text-muted-foreground"}`}>{format(day, "d")}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayPosts.map((post: any) => (
                      <div key={post.id} className={`text-[9px] font-medium px-1.5 py-0.5 rounded truncate ${statusColors[post.status] || "bg-primary/20 text-primary"}`}>
                        {post.post_type} · {post.nicho?.slice(0, 12)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agendar;
