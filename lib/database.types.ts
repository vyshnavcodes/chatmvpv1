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
      users: {
        Row: {
          id: string
          created_at: string
          email: string | null
          website_url: string | null
          brand_colors: Json | null
          website_content: Json | null
          trial_end: string | null
          is_subscribed: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email?: string | null
          website_url?: string | null
          brand_colors?: Json | null
          website_content?: Json | null
          trial_end?: string | null
          is_subscribed?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          website_url?: string | null
          brand_colors?: Json | null
          website_content?: Json | null
          trial_end?: string | null
          is_subscribed?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
      chat_history: {
        Row: {
          id: string
          created_at: string
          user_id: string
          message: string
          response: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          message: string
          response: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          message?: string
          response?: string
          metadata?: Json | null
        }
      }
    }
  }
} 