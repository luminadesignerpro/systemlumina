import { useState } from "react";
import { X, Film, LayoutGrid, Circle, Image, Sparkles, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const postTypes = [
  { id: "reel", label: "REEL", icon: Film },
  { id: "feed", label: "FEED", icon: LayoutGrid },
  { id: "story", label: "STORY", icon: Circle },
  { id: "carrossel", label: "CARROSSEL", icon: Image },
];

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
}

const NewPostModal = ({ open, onClose }: NewPostModalProps) => {
  const [selectedType, setSelectedType] = useState("reel");
  const [legenda, setLegenda] = useState("");
  const [dataHora, setDataHora] = useState("2026-03-08T02:00");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-lg p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                🎬 Novo Post Rápido
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tipo</label>
              <div className="grid grid-cols-4 gap-2">
                {postTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      selectedType === type.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <type.icon size={22} />
                    <span className="text-[11px] font-bold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Legenda</label>
              <Textarea
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                className="bg-muted border-border min-h-[100px]"
                placeholder="Escreva ou gere com IA..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Data e Hora</label>
              <Input
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="bg-muted border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground py-5">
                <Sparkles size={14} className="mr-2" />
                Gerar com Gemini
              </Button>
              <Button className="gradient-button border-0 py-5">
                <Calendar size={14} className="mr-2" />
                Agendar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewPostModal;
