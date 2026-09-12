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
      api_keys: {
        Row: {
          business_id: string
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          ask_window_days: number
          ask_window_days_requestor: number
          button_color: string
          created_at: string
          current_period_end: string | null
          custom_body: string | null
          custom_intro: string | null
          daily_send_cap: number
          email_template: string
          free_allowance: number
          from_name: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_id: string
          plan: string
          postal_address: string | null
          reminder_delay_days: number
          reminder_enabled: boolean
          reply_to_email: string | null
          request_delay_minutes: number
          review_url: string
          sender_photo_url: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          timezone: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          ask_window_days?: number
          ask_window_days_requestor?: number
          button_color?: string
          created_at?: string
          current_period_end?: string | null
          custom_body?: string | null
          custom_intro?: string | null
          daily_send_cap?: number
          email_template?: string
          free_allowance?: number
          from_name: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          plan?: string
          postal_address?: string | null
          reminder_delay_days?: number
          reminder_enabled?: boolean
          reply_to_email?: string | null
          request_delay_minutes?: number
          review_url: string
          sender_photo_url?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          timezone?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          ask_window_days?: number
          ask_window_days_requestor?: number
          button_color?: string
          created_at?: string
          current_period_end?: string | null
          custom_body?: string | null
          custom_intro?: string | null
          daily_send_cap?: number
          email_template?: string
          free_allowance?: number
          from_name?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: string
          postal_address?: string | null
          reminder_delay_days?: number
          reminder_enabled?: boolean
          reply_to_email?: string | null
          request_delay_minutes?: number
          review_url?: string
          sender_photo_url?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          timezone?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      contact_optouts: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          phone: string | null
          reason: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reason?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_optouts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          do_not_ask: boolean
          email: string | null
          id: string
          name: string
          optout_token: string
          phone: string | null
          reviewed_at: string | null
          role: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          do_not_ask?: boolean
          email?: string | null
          id?: string
          name: string
          optout_token?: string
          phone?: string | null
          reviewed_at?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          do_not_ask?: boolean
          email?: string | null
          id?: string
          name?: string
          optout_token?: string
          phone?: string | null
          reviewed_at?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          business_id: string
          created_at: string
          filename: string | null
          id: string
          imported_count: number
          mode: string
          row_count: number
          skipped_count: number
        }
        Insert: {
          business_id: string
          created_at?: string
          filename?: string | null
          id?: string
          imported_count?: number
          mode: string
          row_count?: number
          skipped_count?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          filename?: string | null
          id?: string
          imported_count?: number
          mode?: string
          row_count?: number
          skipped_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          business_id: string
          channel: string
          click_count: number
          click_token: string
          clicked_at: string | null
          created_at: string
          customer_id: string
          error_message: string | null
          id: string
          kind: string
          provider_message_id: string | null
          send_after: string
          sent_at: string | null
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          channel?: string
          click_count?: number
          click_token?: string
          clicked_at?: string | null
          created_at?: string
          customer_id: string
          error_message?: string | null
          id?: string
          kind: string
          provider_message_id?: string | null
          send_after: string
          sent_at?: string | null
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          channel?: string
          click_count?: number
          click_token?: string
          clicked_at?: string | null
          created_at?: string
          customer_id?: string
          error_message?: string | null
          id?: string
          kind?: string
          provider_message_id?: string | null
          send_after?: string
          sent_at?: string | null
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          customer_id: string
          external_id: string | null
          id: string
          import_batch_id: string | null
          notes: string | null
          service_type: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          customer_id: string
          external_id?: string | null
          id?: string
          import_batch_id?: string | null
          notes?: string | null
          service_type?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          external_id?: string | null
          id?: string
          import_batch_id?: string | null
          notes?: string | null
          service_type?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_subscription:
        | {
            Args: {
              p_business_id: string
              p_customer_id: string
              p_period_end: string
              p_status: string
              p_subscription_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_business_id: string
              p_customer_id: string
              p_period_end: string
              p_started_at?: string
              p_status: string
              p_subscription_id: string
            }
            Returns: undefined
          }
      business_for_api_key: { Args: { p_key: string }; Returns: string }
      can_ask_customer: {
        Args: { p_customer_id: string }
        Returns: {
          allowed: boolean
          last_asked: string
          reason: string
        }[]
      }
      can_business_send: {
        Args: { p_business_id: string }
        Returns: {
          allowance: number
          allowed: boolean
          reason: string
          used: number
        }[]
      }
      check_review_copy: {
        Args: { p_text: string }
        Returns: {
          matched: string
          reason: string
          verdict: string
        }[]
      }
      claim_due_review_requests: {
        Args: { p_limit?: number }
        Returns: {
          business_name: string
          button_color: string
          click_token: string
          custom_body: string
          custom_intro: string
          customer_email: string
          customer_name: string
          email_template: string
          from_name: string
          kind: string
          logo_url: string
          optout_token: string
          postal_address: string
          reply_to_email: string
          request_id: string
          review_url: string
          sender_photo_url: string
          service_type: string
          website_url: string
        }[]
      }
      create_api_key: {
        Args: { p_business_id: string; p_name: string }
        Returns: {
          api_key: string
          key_prefix: string
        }[]
      }
      free_requests_used: { Args: { p_business_id: string }; Returns: number }
      ingest_completed_job: {
        Args: {
          p_business_id: string
          p_completed_at: string
          p_email: string
          p_external_id: string
          p_name: string
          p_phone: string
          p_role?: string
          p_service_type: string
        }
        Returns: {
          customer_id: string
          note: string
          request_created: boolean
          service_id: string
        }[]
      }
      next_send_slot: { Args: { p_business_id: string }; Returns: string }
      optout_by_token: {
        Args: { p_token: string }
        Returns: {
          business_name: string
          customer_email: string
        }[]
      }
      owns_business: { Args: { p_business_id: string }; Returns: boolean }
      paid_business_count: { Args: { p_owner: string }; Returns: number }
      public_branding: {
        Args: { p_token: string }
        Returns: {
          business_name: string
          button_color: string
          logo_url: string
          website_url: string
        }[]
      }
      record_click_by_token: {
        Args: { p_token: string }
        Returns: {
          business_name: string
          review_url: string
        }[]
      }
      record_email_event: {
        Args: { p_event: string; p_message_id: string }
        Returns: {
          new_status: string
          request_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
