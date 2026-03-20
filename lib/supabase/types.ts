export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'trainee'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'trainee'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'trainee'
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          is_published: boolean
          order_index: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          is_published?: boolean
          order_index?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          is_published?: boolean
          order_index?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      stages: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          pass_threshold: number
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          pass_threshold?: number
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          pass_threshold?: number
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      slides: {
        Row: {
          id: string
          stage_id: string
          title: string
          file_url: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stage_id: string
          title: string
          file_url: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stage_id?: string
          title?: string
          file_url?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          stage_id: string
          question: string
          explanation: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stage_id: string
          question: string
          explanation?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stage_id?: string
          question?: string
          explanation?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_options: {
        Row: {
          id: string
          quiz_id: string
          text: string
          is_correct: boolean
          order_index: number
        }
        Insert: {
          id?: string
          quiz_id: string
          text: string
          is_correct: boolean
          order_index: number
        }
        Update: {
          id?: string
          quiz_id?: string
          text?: string
          is_correct?: boolean
          order_index?: number
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          stage_id: string
          status: 'not_started' | 'in_progress' | 'passed'
          best_score: number
          attempts_count: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stage_id: string
          status?: 'not_started' | 'in_progress' | 'passed'
          best_score?: number
          attempts_count?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stage_id?: string
          status?: 'not_started' | 'in_progress' | 'passed'
          best_score?: number
          attempts_count?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          stage_id: string
          score: number
          total_questions: number
          correct_answers: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stage_id: string
          score: number
          total_questions: number
          correct_answers: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stage_id?: string
          score?: number
          total_questions?: number
          correct_answers?: number
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          attempt_id: string
          quiz_id: string
          selected_option_id: string
          is_correct: boolean
        }
        Insert: {
          id?: string
          attempt_id: string
          quiz_id: string
          selected_option_id: string
          is_correct: boolean
        }
        Update: {
          id?: string
          attempt_id?: string
          quiz_id?: string
          selected_option_id?: string
          is_correct?: boolean
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      update_user_progress: {
        Args: {
          p_user_id: string
          p_stage_id: string
          p_score: number
          p_passed: boolean
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}

// 複合型
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Stage = Database['public']['Tables']['stages']['Row']
export type Slide = Database['public']['Tables']['slides']['Row']
export type Quiz = Database['public']['Tables']['quizzes']['Row']
export type QuizOption = Database['public']['Tables']['quiz_options']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type QuizAnswer = Database['public']['Tables']['quiz_answers']['Row']

export type QuizWithOptions = Quiz & {
  quiz_options: QuizOption[]
}

export type StageWithProgress = Stage & {
  user_progress?: UserProgress | null
  isAccessible: boolean
}

export type CourseWithStages = Course & {
  stages: StageWithProgress[]
}
