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
      daily_stats: {
        Row: {
          commit_count: number
          created_at: string | null
          date: string
          lines_added: number
          user_id: string
        }
        Insert: {
          commit_count?: number
          created_at?: string | null
          date: string
          lines_added?: number
          user_id?: string
        }
        Update: {
          commit_count?: number
          created_at?: string | null
          date?: string
          lines_added?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          id: string
          recipient_id: string
          requester_id: string
          status: Database["public"]["Enums"]["friend_request_status"]
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          id?: string
          recipient_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["friend_request_status"]
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friend_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          user_id_a: string
          user_id_b: string
        }
        Insert: {
          created_at?: string
          user_id_a: string
          user_id_b: string
        }
        Update: {
          created_at?: string
          user_id_a?: string
          user_id_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_a_fkey"
            columns: ["user_id_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_b_fkey"
            columns: ["user_id_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string
          created_by: string
          group_id: string
          id: string
          invited_user: string
          status: Database["public"]["Enums"]["group_invitation_status"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          group_id?: string
          id?: string
          invited_user?: string
          status?: Database["public"]["Enums"]["group_invitation_status"] | null
        }
        Update: {
          created_at?: string
          created_by?: string
          group_id?: string
          id?: string
          invited_user?: string
          status?: Database["public"]["Enums"]["group_invitation_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invited_user_fkey"
            columns: ["invited_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          created_at: string
          group_id: string
          id: string
          requester_id: string
          status:
            | Database["public"]["Enums"]["group_join_request_status"]
            | null
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          requester_id: string
          status?:
            | Database["public"]["Enums"]["group_join_request_status"]
            | null
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          requester_id?: string
          status?:
            | Database["public"]["Enums"]["group_join_request_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: Database["public"]["Enums"]["group_member_role"]
          total_commits: number | null
          user_id: string
        }
        Insert: {
          group_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_member_role"]
          total_commits?: number | null
          user_id?: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_member_role"]
          total_commits?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          access_policy: Database["public"]["Enums"]["group_access_policy"]
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          invite_code: string
          is_featured: boolean | null
          name: string
          owner_id: string
        }
        Insert: {
          access_policy?: Database["public"]["Enums"]["group_access_policy"]
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          is_featured?: boolean | null
          name: string
          owner_id?: string
        }
        Update: {
          access_policy?: Database["public"]["Enums"]["group_access_policy"]
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          is_featured?: boolean | null
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          github_id: number | null
          github_url: string | null
          github_username: string | null
          id: string
          linkedin_url: string | null
          num_contributions: number | null
          onboarding_completed: boolean | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          github_id?: number | null
          github_url?: string | null
          github_username?: string | null
          id?: string
          linkedin_url?: string | null
          num_contributions?: number | null
          onboarding_completed?: boolean | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          github_id?: number | null
          github_url?: string | null
          github_username?: string | null
          id?: string
          linkedin_url?: string | null
          num_contributions?: number | null
          onboarding_completed?: boolean | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_team_commits: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: number
      }
      update_all_team_commit_totals: { Args: never; Returns: undefined }
      update_team_commit_totals: {
        Args: { p_group_id: string }
        Returns: undefined
      }
    }
    Enums: {
      friend_request_status: "pending" | "accepted" | "declined"
      group_access_policy: "open" | "closed"
      group_invitation_status: "pending" | "accepted"
      group_join_request_status: "pending" | "approved" | "rejected"
      group_member_role: "member" | "admin" | "owner"
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
      friend_request_status: ["pending", "accepted", "declined"],
      group_access_policy: ["open", "closed"],
      group_invitation_status: ["pending", "accepted"],
      group_join_request_status: ["pending", "approved", "rejected"],
      group_member_role: ["member", "admin", "owner"],
    },
  },
} as const
