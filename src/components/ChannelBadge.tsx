import { Channel } from "@/lib/mockData";
import { MessageCircle } from "lucide-react";

const channelConfig: Record<Channel, { label: string; className: string; icon: string }> = {
  whatsapp: { label: "WhatsApp", className: "bg-whatsapp text-whatsapp-foreground", icon: "💬" },
  instagram: { label: "Instagram", className: "bg-instagram text-instagram-foreground", icon: "📸" },
  messenger: { label: "Messenger", className: "bg-messenger text-messenger-foreground", icon: "💭" },
};

interface ChannelBadgeProps {
  channel: Channel;
  size?: "sm" | "md";
}

export function ChannelBadge({ channel, size = "sm" }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${sizeClass}`}>
      <span>{config.icon}</span>
      {size === "md" && config.label}
    </span>
  );
}

export function ChannelIcon({ channel, className = "" }: { channel: Channel; className?: string }) {
  const colors: Record<Channel, string> = {
    whatsapp: "text-whatsapp",
    instagram: "text-instagram",
    messenger: "text-messenger",
  };
  return <MessageCircle className={`${colors[channel]} ${className}`} />;
}
