import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const META_APP_ID = Deno.env.get("META_APP_ID");
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");

    if (!META_APP_ID || !META_APP_SECRET) {
      return new Response(
        JSON.stringify({ error: "Meta App credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { action, code, redirect_uri } = await req.json();

    // Step 1: Generate the OAuth URL for the user to authorize
    if (action === "get_auth_url") {
      const scopes = [
        "instagram_basic",
        "instagram_content_publish",
        "instagram_manage_insights",
        "pages_show_list",
        "pages_read_engagement",
      ].join(",");

      const authUrl =
        `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${META_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&scope=${scopes}` +
        `&response_type=code` +
        `&state=${user.id}`;

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Exchange the authorization code for an access token
    if (action === "exchange_code" && code) {
      // Exchange code for short-lived token
      const tokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
          `client_id=${META_APP_ID}` +
          `&client_secret=${META_APP_SECRET}` +
          `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
          `&code=${code}`
      );
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(tokenData.error.message || "Failed to exchange code");
      }

      const shortLivedToken = tokenData.access_token;

      // Exchange for long-lived token (60 days)
      const longTokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
          `grant_type=fb_exchange_token` +
          `&client_id=${META_APP_ID}` +
          `&client_secret=${META_APP_SECRET}` +
          `&fb_exchange_token=${shortLivedToken}`
      );
      const longTokenData = await longTokenRes.json();

      if (longTokenData.error) {
        throw new Error(longTokenData.error.message || "Failed to get long-lived token");
      }

      const accessToken = longTokenData.access_token;
      const expiresIn = longTokenData.expires_in || 5184000; // 60 days default

      // Get Facebook Pages
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
      );
      const pagesData = await pagesRes.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error("Nenhuma Página do Facebook encontrada. Vincule uma página à sua conta.");
      }

      // Use first page — user can have multiple but we use the first
      const page = pagesData.data[0];
      const pageAccessToken = page.access_token;
      const pageId = page.id;

      // Get Instagram Business Account connected to this page
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );
      const igData = await igRes.json();

      if (!igData.instagram_business_account) {
        throw new Error(
          "Nenhuma conta Business/Creator do Instagram vinculada a esta Página do Facebook."
        );
      }

      const igUserId = igData.instagram_business_account.id;

      // Get Instagram username
      const igProfileRes = await fetch(
        `https://graph.facebook.com/v21.0/${igUserId}?fields=username&access_token=${pageAccessToken}`
      );
      const igProfile = await igProfileRes.json();

      // Calculate token expiration date
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // Deactivate existing connections for this user
      await supabase
        .from("instagram_connections")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Save the new connection
      const { error: insertError } = await supabase.from("instagram_connections").insert({
        user_id: user.id,
        access_token: pageAccessToken, // Use page token for publishing
        instagram_user_id: igUserId,
        instagram_username: igProfile.username || "unknown",
        page_id: pageId,
        is_active: true,
        connected_at: new Date().toISOString(),
        token_expires_at: tokenExpiresAt,
      });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          success: true,
          username: igProfile.username,
          message: `Instagram @${igProfile.username} conectado com sucesso!`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Disconnect Instagram
    if (action === "disconnect") {
      await supabase
        .from("instagram_connections")
        .update({ is_active: false })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: true, message: "Instagram desconectado." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("instagram-auth error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
