import { Inbox, Users, Bot, BarChart3, Settings, Zap, MessageSquare, Mail, Share2, Menu, X, Moon, Sun, LogOut, Sparkles, Calendar, History, Instagram } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface AppSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const menuItems = [
  { id: "inbox", icon: Inbox, label: "Inbox", path: "/" },
  { id: "contacts", icon: Users, label: "CRM", path: "/crm" },
  { id: "automation", icon: Zap, label: "Automação", path: "/automation" },
  { id: "ai-agents", icon: Bot, label: "Agentes IA", path: "/ai-agents" },
  { id: "analytics", icon: BarChart3, label: "Analytics", path: "/analytics" },
  { id: "email", icon: Mail, label: "E-mail Marketing", path: "/email-marketing" },
];

const socialItems = [
  { id: "social", icon: Share2, label: "Social Media", path: "/social-media" },
  { id: "criar", icon: Sparkles, label: "Criar com IA", path: "/criar" },
  { id: "agendar", icon: Calendar, label: "Agendar Posts", path: "/agendar" },
  { id: "historico", icon: History, label: "Histórico", path: "/historico" },
  { id: "instagram-config", icon: Instagram, label: "Configurar Instagram", path: "/instagram-config" },
];

const bottomItems = [
  { id: "settings", icon: Settings, label: "Configurações", path: "/settings" },
];

export function AppSidebar({ activeItem: _activeItem, onItemClick }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const getActiveId = () => {
    const path = location.pathname;
    const allItems = [...menuItems, ...socialItems, ...bottomItems];
    return allItems.find(i => i.path === path)?.id || "inbox";
  };

  const activeItem = getActiveId();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNav = (item: { id: string; path: string }) => {
    onItemClick?.(item.id);
    if (item.path !== "#") navigate(item.path);
    setMobileOpen(false);
  };

  const isSocialActive = socialItems.some(i => i.id === activeItem);

  const ThemeToggle = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-xl text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${className}`}
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {theme === "dark" ? <Sun size={size} /> : <Moon size={size} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );

  const NavSection = ({ items, label }: { items: typeof menuItems; label?: string }) => (
    <>
      {label && (
        <div className="px-1 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/40">{label}</span>
        </div>
      )}
      {items.map((item, i) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => handleNav(item)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
              isActive
                ? "gradient-primary text-primary-foreground shadow-elevated"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elevated"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={toggleTheme}
          className="fixed top-3 right-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border text-foreground shadow-card"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col gradient-sidebar py-4 px-3 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                      <MessageSquare size={18} className="text-primary-foreground" />
                    </div>
                    <span className="font-display font-bold text-sidebar-foreground text-sm">SystemLumina</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground">
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex flex-1 flex-col gap-1">
                  <NavSection items={menuItems} label="Principal" />
                  <div className="mt-3 mb-1">
                    <NavSection items={socialItems} label="Social Media & IA" />
                  </div>
                </nav>
                <div className="flex flex-col gap-1">
                  {bottomItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.id} onClick={() => handleNav(item)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
                        <Icon size={18} /><span>{item.label}</span>
                      </button>
                    );
                  })}
                  <button onClick={toggleTheme} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10">
                    <LogOut size={18} /><span>Sair</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="flex h-full w-16 flex-col items-center gradient-sidebar py-4 flex-shrink-0">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary" title="SystemLumina">
        <MessageSquare size={20} className="text-primary-foreground" />
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              title={item.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "gradient-primary text-primary-foreground shadow-elevated"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-110"
              }`}
            >
              <Icon size={20} />
              <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background group-hover:block">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Social Media section divider */}
        <div className="my-1 w-8 border-t border-sidebar-border/50" />

        {socialItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              title={item.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "gradient-primary text-primary-foreground shadow-elevated"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-110"
              }`}
            >
              <Icon size={20} />
              <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background group-hover:block">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col items-center gap-1">
        <ThemeToggle className="h-10 w-10" />
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => handleNav(item)} title={item.label} className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:scale-110">
              <Icon size={20} />
            </button>
          );
        })}
        <button onClick={handleLogout} title="Sair" className="flex h-10 w-10 items-center justify-center rounded-xl text-destructive transition-all duration-200 hover:bg-destructive/10 hover:scale-110">
          <LogOut size={20} />
        </button>
        <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
          SL
        </div>
      </div>
    </div>
  );
}
