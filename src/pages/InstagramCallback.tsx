import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Conectando ao Instagram...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage("Autorização cancelada ou negada.");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Código de autorização não encontrado.");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    const exchangeCode = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("instagram-auth", {
          body: {
            action: "exchange_code",
            code,
            redirect_uri: `${window.location.origin}/instagram/callback`,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setStatus("success");
        setMessage(data.message || "Instagram conectado com sucesso!");
        setTimeout(() => navigate("/"), 2500);
      } catch (err: any) {
        console.error("Exchange error:", err);
        setStatus("error");
        setMessage(err.message || "Erro ao conectar Instagram.");
        setTimeout(() => navigate("/"), 4000);
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-sm w-full text-center space-y-4"
      >
        {status === "loading" && (
          <Loader2 size={40} className="animate-spin text-primary mx-auto" />
        )}
        {status === "success" && (
          <CheckCircle2 size={40} className="text-success mx-auto" />
        )}
        {status === "error" && (
          <XCircle size={40} className="text-destructive mx-auto" />
        )}
        <p className="text-sm text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
};

export default InstagramCallback;
