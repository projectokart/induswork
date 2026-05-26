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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          notes: string | null
          price: number | null
          provider_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: number | null
          provider_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: number | null
          provider_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          booking_id: string
          direction: string
          duration_seconds: number | null
          from_user: string
          id: string
          notes: string | null
          started_at: string
          to_user: string | null
        }
        Insert: {
          booking_id: string
          direction?: string
          duration_seconds?: number | null
          from_user: string
          id?: string
          notes?: string | null
          started_at?: string
          to_user?: string | null
        }
        Update: {
          booking_id?: string
          direction?: string
          duration_seconds?: number | null
          from_user?: string
          id?: string
          notes?: string | null
          started_at?: string
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          service: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          service?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          service?: string | null
          status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          booking_id: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          services: string[] | null
          trade: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          services?: string[] | null
          trade?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          services?: string[] | null
          trade?: string | null
        }
        Relationships: []
      }
      provider_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rater_id: string
          stars: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rater_id: string
          stars: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rater_id?: string
          stars?: number
        }
        Relationships: []
      }
      provider_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          provider_id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          provider_id: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          provider_id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      requirements: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          address: string
          budget: number | null
          city: string | null
          created_at: string
          description: string
          id: string
          name: string
          phone: string
          status: string
          updated_at: string
          user_id: string
          work_type: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          address: string
          budget?: number | null
          city?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          phone: string
          status?: string
          updated_at?: string
          user_id: string
          work_type: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          address?: string
          budget?: number | null
          city?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
          work_type?: string
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          city: string | null
          created_at: string
          id: string
          query: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          query: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "provider" | "admin"
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
      app_role: ["customer", "provider", "admin"],
    },
  },
} as const
