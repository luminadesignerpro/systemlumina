import { useState, useRef, useCallback } from "react";
import { Upload, X, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  onPreviewChange?: (url: string | null) => void;
  mediaUrl: string | null;
  accept?: string;
}

const MAX_SIZE_MB = 50;

const MediaUpload = ({ onUpload, onRemove, onPreviewChange, mediaUrl, accept = "image/*,video/*" }: MediaUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!user) {
      toast.error("Faça login para enviar mídia.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`);
      return;
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Formato não suportado. Use imagem ou vídeo.");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("post-media")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("post-media")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      const localUrl = URL.createObjectURL(file);
      setPreview({ url: localUrl, type: isVideo ? "video" : "image" });
      onPreviewChange?.(localUrl);
      onUpload(publicUrl);
      toast.success("Mídia enviada! 📸");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao enviar mídia.");
    } finally {
      setUploading(false);
    }
  }, [user, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = () => {
    setPreview(null);
    onRemove();
    onPreviewChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (mediaUrl && preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
        {preview.type === "video" ? (
          <video
            src={preview.url}
            className="w-full max-h-[200px] object-cover"
            controls
            muted
          />
        ) : (
          <img
            src={preview.url}
            alt="Preview"
            className="w-full max-h-[200px] object-cover"
          />
        )}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X size={14} />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium">
          {preview.type === "video" ? <Film size={12} /> : <ImageIcon size={12} />}
          {preview.type === "video" ? "Vídeo" : "Imagem"}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground bg-muted/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <>
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Enviando...</span>
        </>
      ) : (
        <>
          <Upload size={24} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center">
            Arraste ou clique para enviar<br />
            <span className="text-[10px]">Imagem ou vídeo (max {MAX_SIZE_MB}MB)</span>
          </span>
        </>
      )}
    </div>
  );
};

export default MediaUpload;
