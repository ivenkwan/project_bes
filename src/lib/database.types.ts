export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      policies: {
        Row: {
          id: string
          policy_id: string
          title: string
          category: string
          description: string | null
          current_version: string | null
          status: string
          effective_date: string | null
          next_review_date: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          title: string
          category: string
          description?: string | null
          current_version?: string | null
          status?: string
          effective_date?: string | null
          next_review_date?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          title?: string
          category?: string
          description?: string | null
          current_version?: string | null
          status?: string
          effective_date?: string | null
          next_review_date?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      policy_versions: {
        Row: {
          id: string
          policy_id: string
          version_number: number
          content: string
          change_summary: string | null
          approved_by: string | null
          approved_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          version_number: number
          content: string
          change_summary?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          version_number?: number
          content?: string
          change_summary?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
      compliance_evidence: {
        Row: {
          id: string
          evidence_type: string
          related_requirement_id: string | null
          related_control_id: string | null
          file_url: string | null
          description: string | null
          collection_method: string
          collected_at: string
          expiration_date: string | null
          status: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          evidence_type: string
          related_requirement_id?: string | null
          related_control_id?: string | null
          file_url?: string | null
          description?: string | null
          collection_method?: string
          collected_at?: string
          expiration_date?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          evidence_type?: string
          related_requirement_id?: string | null
          related_control_id?: string | null
          file_url?: string | null
          description?: string | null
          collection_method?: string
          collected_at?: string
          expiration_date?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
        }
      }
      process_metrics: {
        Row: {
          id: string
          process_name: string
          metric_type: string
          metric_value: number
          measurement_date: string
          bottleneck_identified: boolean
          improvement_opportunity: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          process_name: string
          metric_type: string
          metric_value: number
          measurement_date?: string
          bottleneck_identified?: boolean
          improvement_opportunity?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          process_name?: string
          metric_type?: string
          metric_value?: number
          measurement_date?: string
          bottleneck_identified?: boolean
          improvement_opportunity?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      legacy_systems: {
        Row: {
          id: string
          system_name: string
          system_type: string | null
          description: string | null
          status: string
          redundancy_identified: boolean
          replacement_system: string | null
          migration_plan: string | null
          decommission_target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          system_name: string
          system_type?: string | null
          description?: string | null
          status?: string
          redundancy_identified?: boolean
          replacement_system?: string | null
          migration_plan?: string | null
          decommission_target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          system_name?: string
          system_type?: string | null
          description?: string | null
          status?: string
          redundancy_identified?: boolean
          replacement_system?: string | null
          migration_plan?: string | null
          decommission_target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ml_models: {
        Row: {
          id: string
          model_name: string
          model_type: string
          purpose: string
          version: string
          accuracy_target: number | null
          current_accuracy: number | null
          last_trained_at: string | null
          training_data_size: number | null
          status: string
          model_config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_name: string
          model_type: string
          purpose: string
          version: string
          accuracy_target?: number | null
          current_accuracy?: number | null
          last_trained_at?: string | null
          training_data_size?: number | null
          status?: string
          model_config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_name?: string
          model_type?: string
          purpose?: string
          version?: string
          accuracy_target?: number | null
          current_accuracy?: number | null
          last_trained_at?: string | null
          training_data_size?: number | null
          status?: string
          model_config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      automation_metrics: {
        Row: {
          id: string
          automation_type: string
          task_name: string
          execution_count: number
          success_count: number
          failure_count: number
          average_duration: string | null
          manual_effort_saved: string | null
          measurement_period_start: string
          measurement_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          automation_type: string
          task_name: string
          execution_count?: number
          success_count?: number
          failure_count?: number
          average_duration?: string | null
          manual_effort_saved?: string | null
          measurement_period_start: string
          measurement_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          automation_type?: string
          task_name?: string
          execution_count?: number
          success_count?: number
          failure_count?: number
          average_duration?: string | null
          manual_effort_saved?: string | null
          measurement_period_start?: string
          measurement_period_end?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
