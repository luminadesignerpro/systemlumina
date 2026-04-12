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

    const body = await req.json();
    const { action, to, message, messageType = "text", mediaUrl, conversationId } = body;

    if (action === "send_message") {
      const result = await sendWhatsAppMessage(supabase, user.id, {
        to,
        message,
        messageType,
        mediaUrl,
        conversationId,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_connection_status") {
      const { data: connection } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      return new Response(
        JSON.stringify({ connected: !!connection, connection }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "setup_connection") {
      const { phoneNumberId, accessToken, businessAccountId, displayName, phoneNumber } = body;

      // Deactivate old connections
      await supabase
        .from("whatsapp_connections")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Create new connection
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .insert({
          user_id: user.id,
          phone_number_id: phoneNumberId,
          business_account_id: businessAccountId,
          phone_number: phoneNumber,
          display_name: displayName,
          access_token: accessToken,
          webhook_verify_token: Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN"),
          is_active: true,
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, connection: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ WhatsApp API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendWhatsAppMessage(
  supabase: any,
  userId: string,
  params: {
    to: string;
    message: string;
    messageType: string;
    mediaUrl?: string;
    conversationId?: string;
  }
) {
  const { to, message, messageType, mediaUrl, conversationId } = params;

  // Get active WhatsApp connection
  const { data: connection, error: connError } = await supabase
    .from("whatsapp_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (connError || !connection) {
    throw new Error("WhatsApp not connected. Please connect your WhatsApp Business account first.");
  }

  // Prepare WhatsApp API payload
  const payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to.replace(/\D/g, ""), // Remove non-digits
  };

  if (messageType === "text") {
    payload.type = "text";
    payload.text = { body: message };
  } else if (messageType === "image" && mediaUrl) {
    payload.type = "image";
    payload.image = {
      link: mediaUrl,
      caption: message || undefined,
    };
  } else if (messageType === "video" && mediaUrl) {
    payload.type = "video";
    payload.video = {
      link: mediaUrl,
      caption: message || undefined,
    };
  } else if (messageType === "document" && mediaUrl) {
    payload.type = "document";
    payload.document = {
      link: mediaUrl,
      caption: message || undefined,
    };
  }

  // Send to WhatsApp API
  const whatsappApiUrl = `https://graph.facebook.com/v21.0/${connection.phone_number_id}/messages`;

  const response = await fetch(whatsappApiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${connection.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Failed to send WhatsApp message");
  }

  // Save message to database
  let convId = conversationId;

  // Get or create conversation
  if (!convId) {
    let { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("contact_identifier", to)
      .eq("channel", "whatsapp")
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          contact_name: to,
          contact_identifier: to,
          channel: "whatsapp",
          status: "open",
        })
        .select()
        .single();
      conv = newConv;
    }

    convId = conv?.id;
  }

  // Save outgoing message
  if (convId) {
    await supabase.from("messages").insert({
      conversation_id: convId,
      user_id: userId,
      content: message,
      direction: "outgoing",
      message_type: messageType,
      media_url: mediaUrl,
      external_id: result.messages?.[0]?.id,
      status: "sent",
      read: true,
    });

    // Update conversation last message time
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", convId);
  }

  return {
    success: true,
    messageId: result.messages?.[0]?.id,
    message: "Message sent successfully",
  };
}
