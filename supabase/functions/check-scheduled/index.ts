import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS — this runs as a cron job
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();

    // Find all scheduled posts that are due
    const { data: duePosts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "agendado")
      .lte("scheduled_at", now)
      .is("published_at", null);

    if (error) throw error;

    if (!duePosts || duePosts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No due posts", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;

    for (const post of duePosts) {
      // Check if user has Instagram connected
      const { data: connection } = await supabase
        .from("instagram_connections")
        .select("*")
        .eq("user_id", post.user_id)
        .eq("is_active", true)
        .single();

      if (connection) {
        // TODO: Future Meta API publishing
        // For now, mark as published
        await supabase
          .from("posts")
          .update({ status: "publicado", published_at: now })
          .eq("id", post.id);

        await supabase.from("notifications").insert({
          user_id: post.user_id,
          post_id: post.id,
          type: "published",
          title: "Post publicado! 🎉",
          message: `Seu ${post.post_type} sobre "${post.nicho}" foi publicado.`,
        });
      } else {
        // No Instagram connected — mark as ready and notify
        await supabase
          .from("posts")
          .update({ status: "pronto" })
          .eq("id", post.id);

        await supabase.from("notifications").insert({
          user_id: post.user_id,
          post_id: post.id,
          type: "publish_reminder",
          title: "Hora de publicar! ⏰",
          message: `Seu ${post.post_type} sobre "${post.nicho}" está pronto. Publique manualmente no Instagram.`,
        });
      }

      processed++;
    }

    return new Response(
      JSON.stringify({ message: "Processed", count: processed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("check-scheduled error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
