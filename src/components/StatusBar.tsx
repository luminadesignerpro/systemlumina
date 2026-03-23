import { Bot, Instagram, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";

const StatusBar = () => {
  const { user } = useAuth();

  const { data: igConnection } = useQuery({
    queryKey: ["instagram_connection", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("instagram_connections")
        .select("instagram_username, is_active")
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: posts } = useScheduledPosts();
  const queueCount = posts?.filter((p) => p.status === "agendado").length ?? 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md px-6 py-2 flex items-center justify-between text-xs text-muted-foreground z-40">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5">
          <Bot size={12} className="text-success" />
          Gemini: ativo
        </span>
        <span className="flex items-center gap-1.5">
          <Instagram size={12} className={igConnection ? "text-success" : ""} />
          Instagram: {igConnection ? `@${igConnection.instagram_username}` : "não conectado"}
        </span>
        <span className="flex items-center gap-1.5">
          <Film size={12} />
          Fila: {queueCount} post{queueCount !== 1 ? "s" : ""}
        </span>
      </div>
      <span className="text-muted-foreground">
        Postei ✦ Powered by Gemini
      </span>
    </footer>
  );
};

export default StatusBar;
