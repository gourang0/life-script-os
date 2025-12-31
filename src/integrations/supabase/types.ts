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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          created_at: string
          goal_date: string
          id: string
          notes: string | null
          sleep_hours_actual: number | null
          sleep_hours_target: number | null
          steps_actual: number | null
          steps_target: number | null
          updated_at: string
          user_id: string
          work_hours_actual: number | null
          work_hours_target: number | null
        }
        Insert: {
          created_at?: string
          goal_date?: string
          id?: string
          notes?: string | null
          sleep_hours_actual?: number | null
          sleep_hours_target?: number | null
          steps_actual?: number | null
          steps_target?: number | null
          updated_at?: string
          user_id: string
          work_hours_actual?: number | null
          work_hours_target?: number | null
        }
        Update: {
          created_at?: string
          goal_date?: string
          id?: string
          notes?: string | null
          sleep_hours_actual?: number | null
          sleep_hours_target?: number | null
          steps_actual?: number | null
          steps_target?: number | null
          updated_at?: string
          user_id?: string
          work_hours_actual?: number | null
          work_hours_target?: number | null
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          ai_feedback: string | null
          created_at: string
          discipline_percentage: number
          id: string
          routines_completed: number
          routines_scheduled: number
          sleep_hours: number | null
          summary_date: string
          tasks_completed: number
          tasks_scheduled: number
          total_calories_in: number | null
          total_calories_out: number | null
          total_xp_earned: number
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          discipline_percentage?: number
          id?: string
          routines_completed?: number
          routines_scheduled?: number
          sleep_hours?: number | null
          summary_date?: string
          tasks_completed?: number
          tasks_scheduled?: number
          total_calories_in?: number | null
          total_calories_out?: number | null
          total_xp_earned?: number
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          discipline_percentage?: number
          id?: string
          routines_completed?: number
          routines_scheduled?: number
          sleep_hours?: number | null
          summary_date?: string
          tasks_completed?: number
          tasks_scheduled?: number
          total_calories_in?: number | null
          total_calories_out?: number | null
          total_xp_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      exception_logs: {
        Row: {
          created_at: string
          exception_date: string
          id: string
          mood: string | null
          reason_category: string
          reason_details: string | null
          reflection_note: string | null
          routine_id: string | null
          schedule_entry_id: string | null
          task_id: string | null
          user_id: string
          was_genuine: boolean | null
        }
        Insert: {
          created_at?: string
          exception_date?: string
          id?: string
          mood?: string | null
          reason_category: string
          reason_details?: string | null
          reflection_note?: string | null
          routine_id?: string | null
          schedule_entry_id?: string | null
          task_id?: string | null
          user_id: string
          was_genuine?: boolean | null
        }
        Update: {
          created_at?: string
          exception_date?: string
          id?: string
          mood?: string | null
          reason_category?: string
          reason_details?: string | null
          reflection_note?: string | null
          routine_id?: string | null
          schedule_entry_id?: string | null
          task_id?: string | null
          user_id?: string
          was_genuine?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "exception_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exception_logs_schedule_entry_id_fkey"
            columns: ["schedule_entry_id"]
            isOneToOne: false
            referencedRelation: "schedule_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exception_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_logs: {
        Row: {
          calories_burned: number | null
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          exercise_type: string
          id: string
          log_date: string
          notes: string | null
          steps: number | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          exercise_type: string
          id?: string
          log_date?: string
          notes?: string | null
          steps?: number | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          exercise_type?: string
          id?: string
          log_date?: string
          notes?: string | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          progress_percentage: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          progress_percentage?: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          progress_percentage?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_grams: number | null
          created_at: string
          fats_grams: number | null
          fiber_grams: number | null
          food_items: string
          id: string
          log_date: string
          meal_type: string
          notes: string | null
          protein_grams: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string
          fats_grams?: number | null
          fiber_grams?: number | null
          food_items: string
          id?: string
          log_date?: string
          meal_type: string
          notes?: string | null
          protein_grams?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string
          fats_grams?: number | null
          fiber_grams?: number | null
          food_items?: string
          id?: string
          log_date?: string
          meal_type?: string
          notes?: string | null
          protein_grams?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number
          created_at: string
          current_streak: number
          display_name: string | null
          id: string
          level: number
          streak_freeze_count: number
          total_tasks_completed: number
          updated_at: string
          xp_points: number
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id: string
          level?: number
          streak_freeze_count?: number
          total_tasks_completed?: number
          updated_at?: string
          xp_points?: number
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          level?: number
          streak_freeze_count?: number
          total_tasks_completed?: number
          updated_at?: string
          xp_points?: number
        }
        Relationships: []
      }
      routines: {
        Row: {
          category: string
          created_at: string
          days_of_week: number[]
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          is_active: boolean
          is_flexible: boolean
          start_time: string
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          days_of_week?: number[]
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_flexible?: boolean
          start_time: string
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          days_of_week?: number[]
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_flexible?: boolean
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      schedule_entries: {
        Row: {
          completed_at: string | null
          created_at: string
          end_time: string
          entry_date: string
          entry_type: string
          id: string
          is_completed: boolean
          routine_id: string | null
          start_time: string
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          end_time: string
          entry_date: string
          entry_type?: string
          id?: string
          is_completed?: boolean
          routine_id?: string | null
          start_time: string
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          end_time?: string
          entry_date?: string
          entry_type?: string
          id?: string
          is_completed?: boolean
          routine_id?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_logs: {
        Row: {
          created_at: string
          duration_hours: number | null
          id: string
          log_date: string
          notes: string | null
          quality: string | null
          sleep_time: string | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          created_at?: string
          duration_hours?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          quality?: string | null
          sleep_time?: string | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          created_at?: string
          duration_hours?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          quality?: string | null
          sleep_time?: string | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      streak_freeze_logs: {
        Row: {
          ai_response: string | null
          created_at: string
          exception_id: string | null
          freeze_date: string
          id: string
          reason_category: string
          reason_details: string | null
          user_id: string
          was_genuine: boolean | null
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          exception_id?: string | null
          freeze_date?: string
          id?: string
          reason_category: string
          reason_details?: string | null
          user_id: string
          was_genuine?: boolean | null
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          exception_id?: string | null
          freeze_date?: string
          id?: string
          reason_category?: string
          reason_details?: string | null
          user_id?: string
          was_genuine?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "streak_freeze_logs_exception_id_fkey"
            columns: ["exception_id"]
            isOneToOne: false
            referencedRelation: "exception_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          difficulty: number
          due_date: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string
          is_completed: boolean
          priority: string
          scheduled_date: string | null
          scheduled_end_time: string | null
          scheduled_start_time: string | null
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: number
          due_date?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_completed?: boolean
          priority?: string
          scheduled_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: number
          due_date?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_completed?: boolean
          priority?: string
          scheduled_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
