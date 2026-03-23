import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function publishToInstagram(
  connection: { access_token: string; instagram_user_id: string },
  caption: string,
  imageUrl?: string
): Promise<{ id: string }> {
  const { access_token, instagram_user_id } = connection;

  if (!imageUrl) {
    throw new Error("URL da imagem é obrigatória para publicar no Instagram.");
  }

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token,
      }),
    }
  );
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error(containerData.error.message || "Erro ao criar container de mídia");
  }

  const containerId = containerData.id;

  // Step 2: Wait for container to be ready (poll status)
  let ready = false;
  let attempts = 0;
  while (!ready && attempts < 30) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${access_token}`
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === "FINISHED") {
      ready = true;
    } else if (statusData.status_code === "ERROR") {
      throw new Error("Erro ao processar mídia no Instagram");
    } else {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
    }
  }

  if (!ready) {
    throw new Error("Timeout ao processar mídia no Instagram");
  }

  // Step 3: Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token,
      }),
    }
  );
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message || "Erro ao publicar no Instagram");
  }

  return { id: publishData.id };
}

async function publishStoryToInstagram(
  connection: { access_token: string; instagram_user_id: string },
  mediaUrl: string,
  isVideo: boolean
): Promise<{ id: string }> {
  const { access_token, instagram_user_id } = connection;

  const body: Record<string, string> = {
    media_type: "STORIES",
    access_token,
  };

  if (isVideo) {
    body.video_url = mediaUrl;
  } else {
    body.image_url = mediaUrl;
  }

  // Step 1: Create story container
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error(containerData.error.message || "Erro ao criar container de story");
  }

  const containerId = containerData.id;

  // Step 2: Poll until ready
  let ready = false;
  let attempts = 0;
  const maxAttempts = isVideo ? 60 : 30;
  const delay = isVideo ? 3000 : 2000;

  while (!ready && attempts < maxAttempts) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${access_token}`
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === "FINISHED") {
      ready = true;
    } else if (statusData.status_code === "ERROR") {
      throw new Error("Erro ao processar mídia do Story no Instagram");
    } else {
      await new Promise((r) => setTimeout(r, delay));
      attempts++;
    }
  }

  if (!ready) {
    throw new Error("Timeout ao processar mídia do Story no Instagram");
  }

  // Step 3: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token,
      }),
    }
  );
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message || "Erro ao publicar Story no Instagram");
  }

  return { id: publishData.id };
}

async function publishReelToInstagram(
  connection: { access_token: string; instagram_user_id: string },
  caption: string,
  videoUrl: string
): Promise<{ id: string }> {
  const { access_token, instagram_user_id } = connection;

  // Step 1: Create reel container
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption,
        access_token,
      }),
    }
  );
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error(containerData.error.message || "Erro ao criar container de reel");
  }

  const containerId = containerData.id;

  // Step 2: Poll until ready (video processing takes longer)
  let ready = false;
  let attempts = 0;
  while (!ready && attempts < 60) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${access_token}`
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === "FINISHED") {
      ready = true;
    } else if (statusData.status_code === "ERROR") {
      throw new Error("Erro ao processar vídeo do Reel no Instagram");
    } else {
      await new Promise((r) => setTimeout(r, 3000));
      attempts++;
    }
  }

  if (!ready) {
    throw new Error("Timeout ao processar vídeo do Reel no Instagram");
  }

  // Step 3: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token,
      }),
    }
  );
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message || "Erro ao publicar Reel no Instagram");
  }

  return { id: publishData.id };
}

async function publishCarouselToInstagram(
  connection: { access_token: string; instagram_user_id: string },
  caption: string,
  imageUrls: string[]
): Promise<{ id: string }> {
  const { access_token, instagram_user_id } = connection;

  if (!imageUrls || imageUrls.length < 2) {
    throw new Error("Carrossel precisa de pelo menos 2 imagens.");
  }

  // Step 1: Create individual item containers
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_user_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token,
        }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    childIds.push(data.id);
  }

  // Step 2: Create carousel container
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
        access_token,
      }),
    }
  );
  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(containerData.error.message);

  // Step 3: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_user_id}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token,
      }),
    }
  );
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(publishData.error.message);

  return { id: publishData.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const { action, postId, imageUrl, imageUrls, videoUrl } = await req.json();

    if (action === "check_scheduled") {
      const now = new Date().toISOString();
      const { data: duePosts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "agendado")
        .lte("scheduled_at", now)
        .is("published_at", null);

      if (error) throw error;

      return new Response(JSON.stringify({ duePosts: duePosts || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "publish" && postId) {
      // Get the post
      const { data: post } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .eq("user_id", userId)
        .single();

      if (!post) {
        return new Response(
          JSON.stringify({ error: "Post não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user has Instagram connected
      const { data: connection } = await supabase
        .from("instagram_connections")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (!connection || !connection.access_token) {
        // No Instagram connected — mark as "pronto" for manual publishing
        await supabase
          .from("posts")
          .update({ status: "pronto" })
          .eq("id", postId)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            published: false,
            status: "pronto",
            message: "Post marcado como pronto. Conecte o Instagram para publicar automaticamente.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if token is expired
      if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({
            published: false,
            status: "error",
            message: "Token do Instagram expirado. Reconecte na página de Configuração.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        let result;

        if (post.post_type === "carrossel" && imageUrls && imageUrls.length >= 2) {
          result = await publishCarouselToInstagram(
            connection as { access_token: string; instagram_user_id: string },
            post.generated_content,
            imageUrls
          );
        } else if (post.post_type === "reel" && videoUrl) {
          result = await publishReelToInstagram(
            connection as { access_token: string; instagram_user_id: string },
            post.generated_content,
            videoUrl
          );
        } else if (post.post_type === "story" && (imageUrl || videoUrl)) {
          result = await publishStoryToInstagram(
            connection as { access_token: string; instagram_user_id: string },
            videoUrl || imageUrl,
            !!videoUrl
          );
        } else if (imageUrl) {
          result = await publishToInstagram(
            connection as { access_token: string; instagram_user_id: string },
            post.generated_content,
            imageUrl
          );
        } else {
          // No image provided — mark as pronto
          await supabase
            .from("posts")
            .update({ status: "pronto" })
            .eq("id", postId)
            .eq("user_id", userId);

          return new Response(
            JSON.stringify({
              published: false,
              status: "pronto",
              message: "Post marcado como pronto. Adicione uma imagem para publicar automaticamente.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Mark as published
        await supabase
          .from("posts")
          .update({ status: "publicado", published_at: new Date().toISOString() })
          .eq("id", postId)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            published: true,
            status: "publicado",
            instagram_media_id: result.id,
            message: "Post publicado no Instagram com sucesso! 🎉",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (publishError: any) {
        console.error("Instagram publish error:", publishError);

        // Mark post as failed but keep it
        await supabase
          .from("posts")
          .update({ status: "pronto" })
          .eq("id", postId)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            published: false,
            status: "pronto",
            message: `Erro ao publicar: ${publishError.message}. Post marcado como pronto.`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "schedule" && postId) {
      await supabase
        .from("posts")
        .update({ status: "agendado" })
        .eq("id", postId)
        .eq("user_id", userId);

      return new Response(
        JSON.stringify({ status: "agendado", message: "Post agendado!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("publish-post error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
