import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary/50">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck size={12} className="mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && markAsRead.mutate(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div className={!n.read ? "" : "ml-4"}>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(n.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
