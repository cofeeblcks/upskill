export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "EMPLOYEE" | "SUPERVISOR" | "ADMIN_HR";
export type TrainingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type BadgeType =
  | "FIRST_TRAINING"
  | "STREAK_5"
  | "STREAK_10"
  | "TOP_SCORER"
  | "PERFECT_SCORE"
  | "EARLY_BIRD"
  | "TEAM_PLAYER";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password: string;
          role: AppRole;
          position: string | null;
          department: string | null;
          points: number;
          avatar_url: string | null;
          supervisor_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          password: string;
          role?: AppRole;
          position?: string | null;
          department?: string | null;
          points?: number;
          avatar_url?: string | null;
          supervisor_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password?: string;
          role?: AppRole;
          position?: string | null;
          department?: string | null;
          points?: number;
          avatar_url?: string | null;
          supervisor_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trainings: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          duration_min: number;
          file_url: string | null;
          required_roles: AppRole[];
          positions: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          category: string;
          duration_min: number;
          file_url?: string | null;
          required_roles?: AppRole[];
          positions?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          duration_min?: number;
          file_url?: string | null;
          required_roles?: AppRole[];
          positions?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          training_id: string;
          status: TrainingStatus;
          progress: number;
          score: number | null;
          due_date: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          training_id: string;
          status?: TrainingStatus;
          progress?: number;
          score?: number | null;
          due_date?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          training_id?: string;
          status?: TrainingStatus;
          progress?: number;
          score?: number | null;
          due_date?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          type: BadgeType;
          awarded_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          type: BadgeType;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: BadgeType;
          awarded_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      settings_roles: {
        Row: {
          id: string;
          code: string;
          description: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          code: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      training_categories: {
        Row: {
          id: string;
          name: string;
          color_variant: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          color_variant?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color_variant?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      training_status: TrainingStatus;
      badge_type: BadgeType;
    };
    CompositeTypes: Record<string, never>;
  };
}
