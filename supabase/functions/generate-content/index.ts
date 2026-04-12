import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { postType, nicho, tema, tom, detalhes } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY não configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Você é um especialista em marketing digital e criação de conteúdo para Instagram.
Sempre responda em português brasileiro.
Crie um conteúdo para Instagram do tipo "${postType}" para o nicho "${nicho}".
Tema/Assunto: ${tema || "livre, escolha algo trending"}
Tom de voz: ${tom}
${detalhes ? `Detalhes extras: ${detalhes}` : ""}

Formate a resposta assim:

📝 LEGENDA:
(legenda completa com emojis e call-to-action)

#️⃣ HASHTAGS:
(30 hashtags relevantes)

🎬 ROTEIRO (se for Reel/Story):
(roteiro passo-a-passo)

💡 DICAS:
(2-3 dicas para maximizar engajamento)`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", errText);
      return new Response(
        JSON.stringify({ error: `Erro na API Groq: ${res.status} ${errText.slice(0, 300)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Repassa o stream do Groq direto para o cliente
    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});