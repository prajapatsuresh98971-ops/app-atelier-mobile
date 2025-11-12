export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      device_pairings: {
        Row: {
          activated_at: string | null
          child_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          is_used: boolean
          pairing_code: string
          parent_id: string | null
          permissions: Json | null
          status: Database["public"]["Enums"]["pairing_status"]
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          child_id: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          is_used?: boolean
          pairing_code: string
          parent_id?: string | null
          permissions?: Json | null
          status?: Database["public"]["Enums"]["pairing_status"]
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          is_used?: boolean
          pairing_code?: string
          parent_id?: string | null
          permissions?: Json | null
          status?: Database["public"]["Enums"]["pairing_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          device_info: Json | null
          device_name: string
          device_type: string
          id: string
          is_online: boolean
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_name: string
          device_type: string
          id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_name?: string
          device_type?: string
          id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      geofences: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          notify_on_enter: boolean
          notify_on_exit: boolean
          parent_id: string
          radius: number
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          notify_on_enter?: boolean
          notify_on_exit?: boolean
          parent_id: string
          radius?: number
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          notify_on_enter?: boolean
          notify_on_exit?: boolean
          parent_id?: string
          radius?: number
          updated_at?: string
        }
        Relationships: []
      }
      location_history: {
        Row: {
          accuracy: number | null
          address: string | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          timestamp: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          address?: string | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          timestamp?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      media_records: {
        Row: {
          created_at: string
          duration: number | null
          file_path: string
          file_size: number | null
          id: string
          media_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_path: string
          file_size?: number | null
          id?: string
          media_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_path?: string
          file_size?: number | null
          id?: string
          media_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          activity_updates: boolean
          browser_notifications: boolean
          created_at: string
          device_offline_alerts: boolean
          geofence_alerts: boolean
          id: string
          suspicious_activity_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_updates?: boolean
          browser_notifications?: boolean
          created_at?: string
          device_offline_alerts?: boolean
          geofence_alerts?: boolean
          id?: string
          suspicious_activity_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_updates?: boolean
          browser_notifications?: boolean
          created_at?: string
          device_offline_alerts?: boolean
          geofence_alerts?: boolean
          id?: string
          suspicious_activity_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_steps: Json
          created_at: string
          current_step: number
          id: string
          is_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: Json
          created_at?: string
          current_step?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: Json
          created_at?: string
          current_step?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          profile_picture_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_preferences: {
        Row: {
          created_at: string
          email: string
          frequency: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_stats: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_pairing_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      revoke_child_pairing_codes: {
        Args: { _child_id: string; _except_pairing_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "parent" | "child" | "admin"
      pairing_status: "pending" | "active" | "rejected" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["parent", "child", "admin"],
      pairing_status: ["pending", "active", "rejected", "expired"],
    },
  },
} as const
