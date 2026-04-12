import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const WEBHOOK_VERIFY_TOKEN = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN") || "systemlumina_verify_token_2026";

    // Webhook verification (GET request from Meta)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        console.log("✅ Webhook verified successfully");
        return new Response(challenge, { status: 200 });
      } else {
        console.error("❌ Webhook verification failed");
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Handle incoming messages (POST request)
    if (req.method === "POST") {
      const body = await req.json();
      console.log("📩 Received webhook:", JSON.stringify(body, null, 2));

      // WhatsApp webhook structure
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.value?.messages) {
              for (const message of change.value.messages) {
                await handleIncomingMessage(supabase, message, change.value);
              }
            }

            // Handle message status updates (sent, delivered, read)
            if (change.value?.statuses) {
              for (const status of change.value.statuses) {
                await handleMessageStatus(supabase, status);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleIncomingMessage(supabase: any, message: any, value: any) {
  try {
    const from = message.from; // sender's phone number
    const messageId = message.id;
    const timestamp = message.timestamp;

    // Get or create contact/conversation
    const contactName = value.contacts?.[0]?.profile?.name || from;

    // Find which user owns this WhatsApp number
    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("user_id")
      .eq("phone_number_id", value.metadata.phone_number_id)
      .eq("is_active", true)
      .single();

    if (!connection) {
      console.warn("⚠️ No active WhatsApp connection found for this number");
      return;
    }

    // Get or create conversation
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", connection.user_id)
      .eq("contact_identifier", from)
      .eq("channel", "whatsapp")
      .maybeSingle();

    if (!conversation) {
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_id: connection.user_id,
          contact_name: contactName,
          contact_identifier: from,
          channel: "whatsapp",
          status: "open",
          last_message_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      conversation = newConv;
    } else {
      // Update last message time
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date(parseInt(timestamp) * 1000).toISOString() })
        .eq("id", conversation.id);
    }

    // Determine message type and content
    let content = "";
    let messageType = "text";
    let mediaUrl = null;

    if (message.type === "text") {
      content = message.text.body;
      messageType = "text";
    } else if (message.type === "image") {
      content = message.image.caption || "📷 Image";
      messageType = "image";
      mediaUrl = message.image.id; // Store media ID for later retrieval
    } else if (message.type === "video") {
      content = message.video.caption || "🎥 Video";
      messageType = "video";
      mediaUrl = message.video.id;
    } else if (message.type === "audio") {
      content = "🎵 Audio message";
      messageType = "audio";
      mediaUrl = message.audio.id;
    } else if (message.type === "document") {
      content = `📄 ${message.document.filename || "Document"}`;
      messageType = "document";
      mediaUrl = message.document.id;
    } else if (message.type === "location") {
      content = `📍 Location: ${message.location.latitude}, ${message.location.longitude}`;
      messageType = "text";
    } else {
      content = `Unsupported message type: ${message.type}`;
    }

    // Save message to database
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      user_id: connection.user_id,
      content,
      direction: "incoming",
      message_type: messageType,
      media_url: mediaUrl,
      external_id: messageId,
      status: "delivered",
      read: false,
      metadata: { raw: message },
    });

    if (msgError) throw msgError;

    // Create notification
    await supabase.from("notifications").insert({
      user_id: connection.user_id,
      title: `Nova mensagem de ${contactName}`,
      message: content.substring(0, 100),
      type: "message",
    });

    console.log(`✅ Message saved: ${messageId} from ${from}`);
  } catch (error) {
    console.error("❌ Error handling message:", error);
  }
}

async function handleMessageStatus(supabase: any, status: any) {
  try {
    const messageId = status.id;
    const statusValue = status.status; // sent, delivered, read, failed

    await supabase
      .from("messages")
      .update({ status: statusValue })
      .eq("external_id", messageId);

    console.log(`✅ Message status updated: ${messageId} -> ${statusValue}`);
  } catch (error) {
    console.error("❌ Error updating message status:", error);
  }
}
