import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Calendar, Plus, Instagram, Facebook, Clock, Image, Heart, MessageCircle, Share2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduledPost {
  id: string;
  content: string;
  platform: "instagram" | "facebook" | "both";
  date: string;
  time: string;
  status: "agendado" | "publicado" | "rascunho";
  image?: boolean;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
}

const mockPosts: ScheduledPost[] = [
  { id: "1", content: "🚀 Novidade! Confira nosso novo recurso de automação que vai revolucionar seu atendimento.", platform: "both", date: "2026-03-07", time: "09:00", status: "publicado", image: true, likes: 245, comments: 32, shares: 18, reach: 5200 },
  { id: "2", content: "💡 Dica do dia: 5 formas de melhorar seu atendimento ao cliente usando IA", platform: "instagram", date: "2026-03-07", time: "14:00", status: "publicado", image: true, likes: 189, comments: 24, shares: 12, reach: 3800 },
  { id: "3", content: "📊 Case de sucesso: Como a empresa X aumentou suas vendas em 300% com nossa plataforma", platform: "facebook", date: "2026-03-08", time: "10:00", status: "agendado", image: true },
  { id: "4", content: "🎯 Webinar gratuito: Estratégias de vendas pelo WhatsApp - Inscreva-se!", platform: "both", date: "2026-03-08", time: "16:00", status: "agendado", image: true },
  { id: "5", content: "✨ Bastidores: Um dia na vida do nosso time de produto", platform: "instagram", date: "2026-03-09", time: "12:00", status: "rascunho" },
  { id: "6", content: "📱 Tutorial: Como configurar seu chatbot em 5 minutos", platform: "both", date: "2026-03-10", time: "09:00", status: "agendado", image: true },
];

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const currentMonth = "Março 2026";

function generateCalendar() {
  const cells = [];
  for (let i = 1; i <= 31; i++) {
    cells.push(i);
  }
  return cells;
}

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  publicado: "bg-green-100 text-green-700",
  rascunho: "bg-muted text-muted-foreground",
};

const SocialMedia = () => {
  const [activeNav, setActiveNav] = useState("social");
  const [view, setView] = useState<"calendar" | "list">("list");
  const calendarDays = generateCalendar();
  const isMobile = useIsMobile();

  const getPostsForDay = (day: number) => {
    const dateStr = `2026-03-${day.toString().padStart(2, "0")}`;
    return mockPosts.filter((p) => p.date === dateStr);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeItem={activeNav} onItemClick={setActiveNav} />
      <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Social Media</h1>
            <p className="text-xs text-muted-foreground">{mockPosts.filter((p) => p.status === "agendado").length} posts agendados · {mockPosts.filter((p) => p.status === "publicado").length} publicados</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-input overflow-hidden">
              <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs ${view === "list" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>Lista</button>
              <button onClick={() => setView("calendar")} className={`px-3 py-1.5 text-xs ${view === "calendar" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>Calendário</button>
            </div>
            <Button size="sm" className="gap-1.5 h-8 text-xs">
              <Plus size={13} />
              <span className="hidden sm:inline">Novo Post</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {view === "list" ? (
            <div className="space-y-3">
              {mockPosts.map((post) => (
                <div key={post.id} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card hover:shadow-elevated transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    {post.image && (
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Image size={18} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          {(post.platform === "instagram" || post.platform === "both") && <Instagram size={13} className="text-instagram" />}
                          {(post.platform === "facebook" || post.platform === "both") && <Facebook size={13} className="text-messenger" />}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[post.status]}`}>
                          {post.status === "agendado" ? "Agendado" : post.status === "publicado" ? "Publicado" : "Rascunho"}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock size={10} /> {post.date.split("-").reverse().join("/")} às {post.time}
                        </span>
                      </div>
                      <p className="text-xs text-foreground line-clamp-2">{post.content}</p>
                      {post.status === "publicado" && (
                        <div className="flex items-center gap-3 sm:gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Heart size={11} /> {post.likes}</span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MessageCircle size={11} /> {post.comments}</span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Share2 size={11} /> {post.shares}</span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Eye size={11} /> {post.reach?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <button className="text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
                <h3 className="font-display font-semibold text-sm text-foreground">{currentMonth}</h3>
                <button className="text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-7 min-w-[500px]">
                {days.map((d) => (
                  <div key={d} className="p-2 text-center text-[10px] font-medium text-muted-foreground border-b border-border">{d}</div>
                ))}
                {calendarDays.map((day) => {
                  const postsForDay = getPostsForDay(day);
                  const isToday = day === 7;
                  return (
                    <div key={day} className={`min-h-[60px] sm:min-h-[80px] border-b border-r border-border p-1 sm:p-1.5 ${isToday ? "bg-primary/5" : ""}`}>
                      <span className={`text-[10px] font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center" : "text-foreground"}`}>{day}</span>
                      <div className="space-y-0.5 mt-1">
                        {postsForDay.map((p) => (
                          <div key={p.id} className="flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 cursor-pointer">
                            {(p.platform === "instagram" || p.platform === "both") && <Instagram size={8} className="text-instagram" />}
                            <span className="text-[8px] text-foreground truncate">{p.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
