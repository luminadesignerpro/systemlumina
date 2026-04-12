export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.1" }
  public: {
    Tables: {
      leads: {
        Row: { assigned_to: string|null; channel: string; company: string|null; created_at: string; email: string|null; id: string; last_activity: string; name: string; phone: string|null; stage: string; tags: string[]|null; updated_at: string; user_id: string; value: number }
        Insert: { assigned_to?: string|null; channel?: string; company?: string|null; created_at?: string; email?: string|null; id?: string; last_activity?: string; name: string; phone?: string|null; stage?: string; tags?: string[]|null; updated_at?: string; user_id: string; value?: number }
        Update: { assigned_to?: string|null; channel?: string; company?: string|null; created_at?: string; email?: string|null; id?: string; last_activity?: string; name?: string; phone?: string|null; stage?: string; tags?: string[]|null; updated_at?: string; user_id?: string; value?: number }
        Relationships: []
      }
      profiles: {
        Row: { avatar_url: string|null; created_at: string; full_name: string|null; id: string; phone: string|null; role: string|null; updated_at: string; user_id: string }
        Insert: { avatar_url?: string|null; created_at?: string; full_name?: string|null; id?: string; phone?: string|null; role?: string|null; updated_at?: string; user_id: string }
        Update: { avatar_url?: string|null; created_at?: string; full_name?: string|null; id?: string; phone?: string|null; role?: string|null; updated_at?: string; user_id?: string }
        Relationships: []
      }
      instagram_connections: {
        Row: { access_token: string|null; connected_at: string|null; created_at: string; id: string; instagram_user_id: string|null; instagram_username: string|null; is_active: boolean|null; page_id: string|null; token_expires_at: string|null; user_id: string }
        Insert: { access_token?: string|null; connected_at?: string|null; created_at?: string; id?: string; instagram_user_id?: string|null; instagram_username?: string|null; is_active?: boolean|null; page_id?: string|null; token_expires_at?: string|null; user_id: string }
        Update: { access_token?: string|null; connected_at?: string|null; created_at?: string; id?: string; instagram_user_id?: string|null; instagram_username?: string|null; is_active?: boolean|null; page_id?: string|null; token_expires_at?: string|null; user_id?: string }
        Relationships: []
      }
      notifications: {
        Row: { created_at: string; id: string; message: string|null; post_id: string|null; read: boolean|null; title: string; type: string; user_id: string }
        Insert: { created_at?: string; id?: string; message?: string|null; post_id?: string|null; read?: boolean|null; title: string; type?: string; user_id: string }
        Update: { created_at?: string; id?: string; message?: string|null; post_id?: string|null; read?: boolean|null; title?: string; type?: string; user_id?: string }
        Relationships: []
      }
      posts: {
        Row: { created_at: string; detalhes: string|null; generated_content: string|null; id: string; media_url: string|null; nicho: string|null; post_type: string; published_at: string|null; scheduled_at: string|null; status: string; tema: string|null; tom: string|null; updated_at: string; user_id: string }
        Insert: { created_at?: string; detalhes?: string|null; generated_content?: string|null; id?: string; media_url?: string|null; nicho?: string|null; post_type?: string; published_at?: string|null; scheduled_at?: string|null; status?: string; tema?: string|null; tom?: string|null; updated_at?: string; user_id: string }
        Update: { created_at?: string; detalhes?: string|null; generated_content?: string|null; id?: string; media_url?: string|null; nicho?: string|null; post_type?: string; published_at?: string|null; scheduled_at?: string|null; status?: string; tema?: string|null; tom?: string|null; updated_at?: string; user_id?: string }
        Relationships: []
      }
      automations: {
        Row: { created_at: string; enabled: boolean; id: string; type: string; updated_at: string; user_id: string }
        Insert: { created_at?: string; enabled?: boolean; id?: string; type: string; updated_at?: string; user_id: string }
        Update: { created_at?: string; enabled?: boolean; id?: string; type?: string; updated_at?: string; user_id?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> =
  (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
