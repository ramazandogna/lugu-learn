/**
 * Database types for the `lugu` schema, in the shape `supabase gen types typescript` produces,
 * so `createClient<Database>(…, { db: { schema: 'lugu' } })` / `.schema('lugu')` type-checks.
 *
 * Maintained by hand next to supabase/migrations: tables come from the migrated catalog; columns
 * with a `check (col in (…))` constraint are narrowed to their literal union; RPC `Returns` use the
 * exact payloads the SQL builds (documented in docs/database.md). Only functions the app may call
 * are listed (internal helpers have no EXECUTE grant). Update this file in the same change as any
 * migration that alters a table or RPC.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Role = 'admin' | 'student'
export type AccountStatus = 'active' | 'paused' | 'disabled'
export type SectionKey = 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
export type SessionKind = 'primary' | 'replay'
export type AssignmentStatus = 'active' | 'paused' | 'archived' | 'completed'
export type PackageStatus = 'draft' | 'ai_generated' | 'qa' | 'review' | 'approved' | 'published' | 'archived'
export type ProgressAction = 'forward' | 'backward' | 'set_lesson' | 'restart_lesson' | 'pause' | 'resume' | 'archive'
export type SessionEventKind =
  | 'visibility_hidden'
  | 'visibility_visible'
  | 'fullscreen_exit'
  | 'leave_warning'
  | 'interrupted'
  | 'resumed'
  | 'idle_start'
  | 'idle_end'
export type VocabDirection = 'en_tr' | 'tr_en'
export type BreakMinutes = 0 | 10 | 15 | 20 | 30
/** Derived per lesson by `student_learning_map`; never stored. */
export type LessonState = 'completed' | 'current' | 'in_progress' | 'locked'

type Row<T extends keyof LuguTables> = LuguTables[T]['Row']

/* ── RPC payloads (jsonb built in supabase/migrations/0006_rpc_student.sql) ── */

export type StudentHome = {
  profile: {
    user_id: string
    student_code: string
    first_name: string | null
    display_name: string | null
    grade: number | null
    avatar_key: string | null
    school: { id: string; name: string; city: string; district: string | null } | null
    status: AccountStatus
    must_change_password: boolean
    profile_completed_at: string | null
  } | null
  assignments: {
    id: string
    status: AssignmentStatus
    curriculum: { id: string; name: string; version: number }
    lessons_total: number
    /** Distinct lessons with a completion record in this assignment. */
    lessons_completed: number
    /** Null once the program is completed. */
    current_lesson: {
      id: string
      sequence: number
      title: string
      estimated_minutes: number
      in_progress: boolean
      tagline: string | null
    } | null
  }[]
  xp: number
  achievements_count: number
  mastered_words: number
}

export type StudentLearningMap = {
  assignment: { id: string; status: AssignmentStatus; current_lesson_id: string | null }
  lessons: {
    id: string
    sequence: number
    title: string
    estimated_minutes: number
    state: LessonState
    replay_available: boolean
    completed_at: string | null
    tagline: string | null
    character: string | null
  }[]
}

export type StudentLessonContent = {
  package_id: string
  lesson_id: string
  revision: number
  /**
   * A `LessonPackage` (src/domain/content.ts) with `answer`, `accept`, `hint` and `explain` removed
   * from `assessment.quiz` and `assessment.reading.questions` (order tokens reshuffled).
   */
  content: Json
}

export type SessionPayload = {
  session: Row<'learning_sessions'>
  /** All seven sections, in lesson order. */
  sections: Row<'session_section_progress'>[]
}

export type AnswerResult = { correct: boolean; expected: Json; attempt_no: number }
export type VocabAnswerResult = { correct: boolean; mastered: boolean; correct_count: number; expected: string }
export type AssessmentScore = {
  quiz_correct: number
  quiz_total: number
  reading_correct: number
  reading_total: number
  quiz_percent: number
  reading_percent: number
  percent: number
  results: { question_id: string; part: 'quiz' | 'reading'; correct: boolean }[]
}
export type LessonCompletion = {
  completed: true
  /** True when this session had already been completed (the call is idempotent). */
  already_completed: boolean
  kind: SessionKind
  xp_awarded: number
  /** Keys of achievements newly awarded by this completion. */
  achievements: string[]
  next_lesson_id: string | null
  assignment_status: AssignmentStatus
  /** 1–3 from the assessment percent (≥ 90 → 3, ≥ 70 → 2, else 1). */
  stars: 1 | 2 | 3
}

/** A weak vocabulary item from an earlier lesson of the same assignment (`student_review_items`). */
export type ReviewItem = {
  package_id: string
  item_id: string
  en: string
  tr: string
  example: { en: string; tr: string } | null
  incorrect_count: number
  last_attempt_at: string | null
}

type LuguTables = {
  academic_insights: {
    Row: {
      ai_job_id: string | null
      content: Json
      created_at: string
      id: string
      reviewed_at: string | null
      reviewed_by: string | null
      status: 'draft' | 'reviewed'
      student_id: string
      updated_at: string
    }
    Insert: {
      ai_job_id?: string | null
      content: Json
      created_at?: string
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: 'draft' | 'reviewed'
      student_id: string
      updated_at?: string
    }
    Update: {
      ai_job_id?: string | null
      content?: Json
      created_at?: string
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: 'draft' | 'reviewed'
      student_id?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'academic_insights_ai_job_id_fkey'
        columns: ['ai_job_id']
        isOneToOne: false
        referencedRelation: 'ai_jobs'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'academic_insights_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  achievements: {
    Row: {
      active: boolean
      created_at: string
      description: string | null
      icon: string | null
      id: string
      key: string
      kind: 'lessons_completed' | 'manual'
      threshold: number | null
      title: string
      updated_at: string
      xp: number
    }
    Insert: {
      active?: boolean
      created_at?: string
      description?: string | null
      icon?: string | null
      id?: string
      key: string
      kind?: 'lessons_completed' | 'manual'
      threshold?: number | null
      title: string
      updated_at?: string
      xp?: number
    }
    Update: {
      active?: boolean
      created_at?: string
      description?: string | null
      icon?: string | null
      id?: string
      key?: string
      kind?: 'lessons_completed' | 'manual'
      threshold?: number | null
      title?: string
      updated_at?: string
      xp?: number
    }
    Relationships: []
  }
  admin_audit_logs: {
    Row: {
      action: string
      actor_id: string | null
      created_at: string
      data: Json
      id: string
      target_id: string | null
      target_table: string | null
    }
    Insert: {
      action: string
      actor_id?: string | null
      created_at?: string
      data?: Json
      id?: string
      target_id?: string | null
      target_table?: string | null
    }
    Update: {
      action?: string
      actor_id?: string | null
      created_at?: string
      data?: Json
      id?: string
      target_id?: string | null
      target_table?: string | null
    }
    Relationships: []
  }
  ai_jobs: {
    Row: {
      created_at: string
      created_by: string | null
      error: string | null
      id: string
      input: Json
      input_tokens: number | null
      kind: 'lesson_package' | 'learning_profile' | 'speaking_plan' | 'weekly_report' | 'academic_insight'
      lesson_id: string | null
      model: string | null
      output: Json | null
      output_tokens: number | null
      package_id: string | null
      speaking_session_id: string | null
      stage: string | null
      status: 'queued' | 'running' | 'succeeded' | 'failed'
      student_id: string | null
      updated_at: string
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      error?: string | null
      id?: string
      input?: Json
      input_tokens?: number | null
      kind: 'lesson_package' | 'learning_profile' | 'speaking_plan' | 'weekly_report' | 'academic_insight'
      lesson_id?: string | null
      model?: string | null
      output?: Json | null
      output_tokens?: number | null
      package_id?: string | null
      speaking_session_id?: string | null
      stage?: string | null
      status?: 'queued' | 'running' | 'succeeded' | 'failed'
      student_id?: string | null
      updated_at?: string
    }
    Update: {
      created_at?: string
      created_by?: string | null
      error?: string | null
      id?: string
      input?: Json
      input_tokens?: number | null
      kind?: 'lesson_package' | 'learning_profile' | 'speaking_plan' | 'weekly_report' | 'academic_insight'
      lesson_id?: string | null
      model?: string | null
      output?: Json | null
      output_tokens?: number | null
      package_id?: string | null
      speaking_session_id?: string | null
      stage?: string | null
      status?: 'queued' | 'running' | 'succeeded' | 'failed'
      student_id?: string | null
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'ai_jobs_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'ai_jobs_package_id_fkey'
        columns: ['package_id']
        isOneToOne: false
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'ai_jobs_speaking_session_id_fkey'
        columns: ['speaking_session_id']
        isOneToOne: false
        referencedRelation: 'speaking_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'ai_jobs_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  assessment_results: {
    Row: {
      answers: Json
      client_id: string | null
      id: string
      package_id: string
      percent: number
      quiz_correct: number
      quiz_percent: number
      quiz_total: number
      reading_correct: number
      reading_percent: number
      reading_total: number
      session_id: string
      student_id: string
      submitted_at: string
    }
    Insert: {
      answers: Json
      client_id?: string | null
      id?: string
      package_id: string
      percent: number
      quiz_correct: number
      quiz_percent: number
      quiz_total: number
      reading_correct: number
      reading_percent: number
      reading_total: number
      session_id: string
      student_id: string
      submitted_at?: string
    }
    Update: {
      answers?: Json
      client_id?: string | null
      id?: string
      package_id?: string
      percent?: number
      quiz_correct?: number
      quiz_percent?: number
      quiz_total?: number
      reading_correct?: number
      reading_percent?: number
      reading_total?: number
      session_id?: string
      student_id?: string
      submitted_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'assessment_results_package_id_fkey'
        columns: ['package_id']
        isOneToOne: false
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'assessment_results_session_id_fkey'
        columns: ['session_id']
        isOneToOne: true
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'assessment_results_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  break_sessions: {
    Row: {
      after_section: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      created_at: string
      early_return: boolean | null
      ended_at: string | null
      id: string
      next_section_started_at: string | null
      planned_minutes: 0 | 10 | 15 | 20 | 30
      session_id: string
      started_at: string
      student_id: string
    }
    Insert: {
      after_section: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      created_at?: string
      early_return?: boolean | null
      ended_at?: string | null
      id?: string
      next_section_started_at?: string | null
      planned_minutes: 0 | 10 | 15 | 20 | 30
      session_id: string
      started_at?: string
      student_id: string
    }
    Update: {
      after_section?: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      created_at?: string
      early_return?: boolean | null
      ended_at?: string | null
      id?: string
      next_section_started_at?: string | null
      planned_minutes?: 0 | 10 | 15 | 20 | 30
      session_id?: string
      started_at?: string
      student_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'break_sessions_session_id_fkey'
        columns: ['session_id']
        isOneToOne: false
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'break_sessions_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  curricula: {
    Row: {
      created_at: string
      created_by: string | null
      description: string | null
      grade: number | null
      id: string
      kind: 'standard' | 'exam_prep' | 'remedial' | 'custom'
      name: string
      status: 'draft' | 'active' | 'archived'
      target_level: string | null
      updated_at: string
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      description?: string | null
      grade?: number | null
      id?: string
      kind?: 'standard' | 'exam_prep' | 'remedial' | 'custom'
      name: string
      status?: 'draft' | 'active' | 'archived'
      target_level?: string | null
      updated_at?: string
    }
    Update: {
      created_at?: string
      created_by?: string | null
      description?: string | null
      grade?: number | null
      id?: string
      kind?: 'standard' | 'exam_prep' | 'remedial' | 'custom'
      name?: string
      status?: 'draft' | 'active' | 'archived'
      target_level?: string | null
      updated_at?: string
    }
    Relationships: []
  }
  curriculum_lessons: {
    Row: {
      created_at: string
      estimated_minutes: number
      id: string
      objective_ids: string[]
      prerequisite_ids: string[]
      sequence: number
      source_notes: string | null
      status: 'draft' | 'ready' | 'archived'
      title: string
      updated_at: string
      version_id: string
    }
    Insert: {
      created_at?: string
      estimated_minutes?: number
      id?: string
      objective_ids?: string[]
      prerequisite_ids?: string[]
      sequence: number
      source_notes?: string | null
      status?: 'draft' | 'ready' | 'archived'
      title: string
      updated_at?: string
      version_id: string
    }
    Update: {
      created_at?: string
      estimated_minutes?: number
      id?: string
      objective_ids?: string[]
      prerequisite_ids?: string[]
      sequence?: number
      source_notes?: string | null
      status?: 'draft' | 'ready' | 'archived'
      title?: string
      updated_at?: string
      version_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'curriculum_lessons_version_id_fkey'
        columns: ['version_id']
        isOneToOne: false
        referencedRelation: 'curriculum_versions'
        referencedColumns: ['id']
      },
    ]
  }
  curriculum_objectives: {
    Row: {
      code: string
      created_at: string
      id: string
      sort: number
      text: string
      updated_at: string
      version_id: string
    }
    Insert: {
      code: string
      created_at?: string
      id?: string
      sort?: number
      text: string
      updated_at?: string
      version_id: string
    }
    Update: {
      code?: string
      created_at?: string
      id?: string
      sort?: number
      text?: string
      updated_at?: string
      version_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'curriculum_objectives_version_id_fkey'
        columns: ['version_id']
        isOneToOne: false
        referencedRelation: 'curriculum_versions'
        referencedColumns: ['id']
      },
    ]
  }
  curriculum_sources: {
    Row: {
      created_at: string
      created_by: string | null
      curriculum_id: string
      id: string
      kind: 'text' | 'pdf' | 'image' | 'document'
      lesson_id: string | null
      storage_path: string | null
      text_content: string | null
      title: string
      version_id: string | null
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      curriculum_id: string
      id?: string
      kind: 'text' | 'pdf' | 'image' | 'document'
      lesson_id?: string | null
      storage_path?: string | null
      text_content?: string | null
      title: string
      version_id?: string | null
    }
    Update: {
      created_at?: string
      created_by?: string | null
      curriculum_id?: string
      id?: string
      kind?: 'text' | 'pdf' | 'image' | 'document'
      lesson_id?: string | null
      storage_path?: string | null
      text_content?: string | null
      title?: string
      version_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: 'curriculum_sources_curriculum_id_fkey'
        columns: ['curriculum_id']
        isOneToOne: false
        referencedRelation: 'curricula'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'curriculum_sources_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'curriculum_sources_version_id_fkey'
        columns: ['version_id']
        isOneToOne: false
        referencedRelation: 'curriculum_versions'
        referencedColumns: ['id']
      },
    ]
  }
  curriculum_versions: {
    Row: {
      created_at: string
      created_by: string | null
      curriculum_id: string
      id: string
      notes: string | null
      published_at: string | null
      status: 'draft' | 'published' | 'archived'
      updated_at: string
      version: number
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      curriculum_id: string
      id?: string
      notes?: string | null
      published_at?: string | null
      status?: 'draft' | 'published' | 'archived'
      updated_at?: string
      version: number
    }
    Update: {
      created_at?: string
      created_by?: string | null
      curriculum_id?: string
      id?: string
      notes?: string | null
      published_at?: string | null
      status?: 'draft' | 'published' | 'archived'
      updated_at?: string
      version?: number
    }
    Relationships: [
      {
        foreignKeyName: 'curriculum_versions_curriculum_id_fkey'
        columns: ['curriculum_id']
        isOneToOne: false
        referencedRelation: 'curricula'
        referencedColumns: ['id']
      },
    ]
  }
  data_deletion_requests: {
    Row: {
      approved_at: string | null
      approved_by: string | null
      created_at: string
      error: string | null
      id: string
      processed_at: string | null
      reason: string | null
      requested_by: string | null
      status: 'requested' | 'approved' | 'rejected' | 'completed' | 'failed'
      student_code: string | null
      student_id: string
      updated_at: string
    }
    Insert: {
      approved_at?: string | null
      approved_by?: string | null
      created_at?: string
      error?: string | null
      id?: string
      processed_at?: string | null
      reason?: string | null
      requested_by?: string | null
      status?: 'requested' | 'approved' | 'rejected' | 'completed' | 'failed'
      student_code?: string | null
      student_id: string
      updated_at?: string
    }
    Update: {
      approved_at?: string | null
      approved_by?: string | null
      created_at?: string
      error?: string | null
      id?: string
      processed_at?: string | null
      reason?: string | null
      requested_by?: string | null
      status?: 'requested' | 'approved' | 'rejected' | 'completed' | 'failed'
      student_code?: string | null
      student_id?: string
      updated_at?: string
    }
    Relationships: []
  }
  learning_sessions: {
    Row: {
      active_seconds: number
      assignment_id: string
      break_seconds: number
      completed_at: string | null
      created_at: string
      current_section: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment' | null
      id: string
      idle_seconds: number
      kind: 'primary' | 'replay'
      last_seen_at: string
      lesson_id: string
      package_id: string
      started_at: string
      status: 'active' | 'completed' | 'abandoned'
      student_id: string
      updated_at: string
    }
    Insert: {
      active_seconds?: number
      assignment_id: string
      break_seconds?: number
      completed_at?: string | null
      created_at?: string
      current_section?: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment' | null
      id?: string
      idle_seconds?: number
      kind: 'primary' | 'replay'
      last_seen_at?: string
      lesson_id: string
      package_id: string
      started_at?: string
      status?: 'active' | 'completed' | 'abandoned'
      student_id: string
      updated_at?: string
    }
    Update: {
      active_seconds?: number
      assignment_id?: string
      break_seconds?: number
      completed_at?: string | null
      created_at?: string
      current_section?: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment' | null
      id?: string
      idle_seconds?: number
      kind?: 'primary' | 'replay'
      last_seen_at?: string
      lesson_id?: string
      package_id?: string
      started_at?: string
      status?: 'active' | 'completed' | 'abandoned'
      student_id?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'learning_sessions_assignment_id_fkey'
        columns: ['assignment_id']
        isOneToOne: false
        referencedRelation: 'program_assignments'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'learning_sessions_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'learning_sessions_package_id_fkey'
        columns: ['package_id']
        isOneToOne: false
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'learning_sessions_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  lesson_admin_material: {
    Row: {
      created_at: string
      package_id: string
      qa_report: Json | null
      speaking_plan: Json | null
      teacher_guide: Json | null
      updated_at: string
      visual_plan: Json | null
    }
    Insert: {
      created_at?: string
      package_id: string
      qa_report?: Json | null
      speaking_plan?: Json | null
      teacher_guide?: Json | null
      updated_at?: string
      visual_plan?: Json | null
    }
    Update: {
      created_at?: string
      package_id?: string
      qa_report?: Json | null
      speaking_plan?: Json | null
      teacher_guide?: Json | null
      updated_at?: string
      visual_plan?: Json | null
    }
    Relationships: [
      {
        foreignKeyName: 'lesson_admin_material_package_id_fkey'
        columns: ['package_id']
        isOneToOne: true
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
    ]
  }
  lesson_completion_records: {
    Row: {
      assignment_id: string
      completed_at: string
      id: string
      lesson_id: string
      package_id: string
      session_id: string
      student_id: string
      summary: Json
    }
    Insert: {
      assignment_id: string
      completed_at?: string
      id?: string
      lesson_id: string
      package_id: string
      session_id: string
      student_id: string
      summary?: Json
    }
    Update: {
      assignment_id?: string
      completed_at?: string
      id?: string
      lesson_id?: string
      package_id?: string
      session_id?: string
      student_id?: string
      summary?: Json
    }
    Relationships: [
      {
        foreignKeyName: 'lesson_completion_records_assignment_id_fkey'
        columns: ['assignment_id']
        isOneToOne: false
        referencedRelation: 'program_assignments'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'lesson_completion_records_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'lesson_completion_records_package_id_fkey'
        columns: ['package_id']
        isOneToOne: false
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'lesson_completion_records_session_id_fkey'
        columns: ['session_id']
        isOneToOne: true
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'lesson_completion_records_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  lesson_content_packages: {
    Row: {
      ai_job_id: string | null
      content: Json
      created_at: string
      created_by: string | null
      id: string
      lesson_id: string
      origin: 'ai' | 'manual'
      published_at: string | null
      revision: number
      status: 'draft' | 'ai_generated' | 'qa' | 'review' | 'approved' | 'published' | 'archived'
      updated_at: string
    }
    Insert: {
      ai_job_id?: string | null
      content: Json
      created_at?: string
      created_by?: string | null
      id?: string
      lesson_id: string
      origin?: 'ai' | 'manual'
      published_at?: string | null
      revision?: number
      status?: 'draft' | 'ai_generated' | 'qa' | 'review' | 'approved' | 'published' | 'archived'
      updated_at?: string
    }
    Update: {
      ai_job_id?: string | null
      content?: Json
      created_at?: string
      created_by?: string | null
      id?: string
      lesson_id?: string
      origin?: 'ai' | 'manual'
      published_at?: string | null
      revision?: number
      status?: 'draft' | 'ai_generated' | 'qa' | 'review' | 'approved' | 'published' | 'archived'
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'lesson_content_packages_ai_job_fkey'
        columns: ['ai_job_id']
        isOneToOne: false
        referencedRelation: 'ai_jobs'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'lesson_content_packages_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
    ]
  }
  password_change_markers: {
    Row: {
      marker: string | null
      set_at: string
      user_id: string
    }
    Insert: {
      marker?: string | null
      set_at?: string
      user_id: string
    }
    Update: {
      marker?: string | null
      set_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'password_change_markers_user_id_fkey'
        columns: ['user_id']
        isOneToOne: true
        referencedRelation: 'profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  profiles: {
    Row: {
      created_at: string
      must_change_password: boolean
      role: 'admin' | 'student'
      status: 'active' | 'paused' | 'disabled'
      updated_at: string
      user_id: string
    }
    Insert: {
      created_at?: string
      must_change_password?: boolean
      role: 'admin' | 'student'
      status?: 'active' | 'paused' | 'disabled'
      updated_at?: string
      user_id: string
    }
    Update: {
      created_at?: string
      must_change_password?: boolean
      role?: 'admin' | 'student'
      status?: 'active' | 'paused' | 'disabled'
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  program_assignments: {
    Row: {
      assigned_by: string | null
      created_at: string
      current_lesson_id: string | null
      curriculum_version_id: string
      id: string
      start_lesson_id: string
      status: 'active' | 'paused' | 'archived' | 'completed'
      student_id: string
      updated_at: string
    }
    Insert: {
      assigned_by?: string | null
      created_at?: string
      current_lesson_id?: string | null
      curriculum_version_id: string
      id?: string
      start_lesson_id: string
      status?: 'active' | 'paused' | 'archived' | 'completed'
      student_id: string
      updated_at?: string
    }
    Update: {
      assigned_by?: string | null
      created_at?: string
      current_lesson_id?: string | null
      curriculum_version_id?: string
      id?: string
      start_lesson_id?: string
      status?: 'active' | 'paused' | 'archived' | 'completed'
      student_id?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'program_assignments_current_lesson_id_fkey'
        columns: ['current_lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'program_assignments_curriculum_version_id_fkey'
        columns: ['curriculum_version_id']
        isOneToOne: false
        referencedRelation: 'curriculum_versions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'program_assignments_start_lesson_id_fkey'
        columns: ['start_lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'program_assignments_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  program_events: {
    Row: {
      actor_id: string | null
      assignment_id: string
      created_at: string
      from_lesson_id: string | null
      id: string
      kind: 'assigned' | 'forward' | 'backward' | 'set_lesson' | 'restart_lesson' | 'pause' | 'resume' | 'archive' | 'lesson_completed' | 'program_completed'
      note: string | null
      to_lesson_id: string | null
    }
    Insert: {
      actor_id?: string | null
      assignment_id: string
      created_at?: string
      from_lesson_id?: string | null
      id?: string
      kind: 'assigned' | 'forward' | 'backward' | 'set_lesson' | 'restart_lesson' | 'pause' | 'resume' | 'archive' | 'lesson_completed' | 'program_completed'
      note?: string | null
      to_lesson_id?: string | null
    }
    Update: {
      actor_id?: string | null
      assignment_id?: string
      created_at?: string
      from_lesson_id?: string | null
      id?: string
      kind?: 'assigned' | 'forward' | 'backward' | 'set_lesson' | 'restart_lesson' | 'pause' | 'resume' | 'archive' | 'lesson_completed' | 'program_completed'
      note?: string | null
      to_lesson_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: 'program_events_assignment_id_fkey'
        columns: ['assignment_id']
        isOneToOne: false
        referencedRelation: 'program_assignments'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'program_events_from_lesson_id_fkey'
        columns: ['from_lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'program_events_to_lesson_id_fkey'
        columns: ['to_lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
    ]
  }
  progress_rewards: {
    Row: {
      achievement_id: string | null
      amount: number
      created_at: string
      created_by: string | null
      id: string
      lesson_id: string | null
      note: string | null
      reason: 'lesson_completed' | 'achievement' | 'manual'
      session_id: string | null
      student_id: string
    }
    Insert: {
      achievement_id?: string | null
      amount: number
      created_at?: string
      created_by?: string | null
      id?: string
      lesson_id?: string | null
      note?: string | null
      reason: 'lesson_completed' | 'achievement' | 'manual'
      session_id?: string | null
      student_id: string
    }
    Update: {
      achievement_id?: string | null
      amount?: number
      created_at?: string
      created_by?: string | null
      id?: string
      lesson_id?: string | null
      note?: string | null
      reason?: 'lesson_completed' | 'achievement' | 'manual'
      session_id?: string | null
      student_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'progress_rewards_achievement_id_fkey'
        columns: ['achievement_id']
        isOneToOne: false
        referencedRelation: 'achievements'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'progress_rewards_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'progress_rewards_session_id_fkey'
        columns: ['session_id']
        isOneToOne: false
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'progress_rewards_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  question_attempts: {
    Row: {
      attempt_no: number
      client_id: string | null
      correct: boolean
      created_at: string
      hint_used: boolean
      id: string
      package_id: string
      question_id: string
      response: Json
      response_ms: number | null
      section: 'review' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      session_id: string
      student_id: string
    }
    Insert: {
      attempt_no: number
      client_id?: string | null
      correct: boolean
      created_at?: string
      hint_used?: boolean
      id?: string
      package_id: string
      question_id: string
      response: Json
      response_ms?: number | null
      section: 'review' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      session_id: string
      student_id: string
    }
    Update: {
      attempt_no?: number
      client_id?: string | null
      correct?: boolean
      created_at?: string
      hint_used?: boolean
      id?: string
      package_id?: string
      question_id?: string
      response?: Json
      response_ms?: number | null
      section?: 'review' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      session_id?: string
      student_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'question_attempts_package_id_fkey'
        columns: ['package_id']
        isOneToOne: false
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'question_attempts_session_id_fkey'
        columns: ['session_id']
        isOneToOne: false
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'question_attempts_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  school_exam_results: {
    Row: {
      blank: number
      correct: number
      created_at: string
      exam_id: string
      id: string
      incorrect: number
      net: number
      score: number | null
      subject_id: string
      total: number | null
      updated_at: string
    }
    Insert: {
      blank?: number
      correct?: number
      created_at?: string
      exam_id: string
      id?: string
      incorrect?: number
      net?: number
      score?: number | null
      subject_id: string
      total?: number | null
      updated_at?: string
    }
    Update: {
      blank?: number
      correct?: number
      created_at?: string
      exam_id?: string
      id?: string
      incorrect?: number
      net?: number
      score?: number | null
      subject_id?: string
      total?: number | null
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'school_exam_results_exam_id_fkey'
        columns: ['exam_id']
        isOneToOne: false
        referencedRelation: 'school_exams'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'school_exam_results_subject_id_fkey'
        columns: ['subject_id']
        isOneToOne: false
        referencedRelation: 'school_subjects'
        referencedColumns: ['id']
      },
    ]
  }
  school_exams: {
    Row: {
      created_at: string
      created_by: string | null
      exam_date: string
      id: string
      kind: 'school' | 'mock' | 'lgs' | 'other'
      notes: string | null
      student_id: string
      title: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      exam_date: string
      id?: string
      kind?: 'school' | 'mock' | 'lgs' | 'other'
      notes?: string | null
      student_id: string
      title: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      created_by?: string | null
      exam_date?: string
      id?: string
      kind?: 'school' | 'mock' | 'lgs' | 'other'
      notes?: string | null
      student_id?: string
      title?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'school_exams_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  school_subjects: {
    Row: {
      active: boolean
      created_at: string
      id: string
      name: string
      sort: number
      updated_at: string
    }
    Insert: {
      active?: boolean
      created_at?: string
      id?: string
      name: string
      sort?: number
      updated_at?: string
    }
    Update: {
      active?: boolean
      created_at?: string
      id?: string
      name?: string
      sort?: number
      updated_at?: string
    }
    Relationships: []
  }
  schools: {
    Row: {
      city: string
      country: string
      created_at: string
      district: string | null
      id: string
      merged_into_id: string | null
      name: string
      normalized_key: string
      updated_at: string
    }
    Insert: {
      city: string
      country?: string
      created_at?: string
      district?: string | null
      id?: string
      merged_into_id?: string | null
      name: string
      normalized_key?: never
      updated_at?: string
    }
    Update: {
      city?: string
      country?: string
      created_at?: string
      district?: string | null
      id?: string
      merged_into_id?: string | null
      name?: string
      normalized_key?: never
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'schools_merged_into_id_fkey'
        columns: ['merged_into_id']
        isOneToOne: false
        referencedRelation: 'schools'
        referencedColumns: ['id']
      },
    ]
  }
  session_events: {
    Row: {
      at: string
      data: Json
      id: string
      kind: 'visibility_hidden' | 'visibility_visible' | 'fullscreen_exit' | 'leave_warning' | 'interrupted' | 'resumed' | 'idle_start' | 'idle_end'
      session_id: string
      student_id: string
    }
    Insert: {
      at?: string
      data?: Json
      id?: string
      kind: 'visibility_hidden' | 'visibility_visible' | 'fullscreen_exit' | 'leave_warning' | 'interrupted' | 'resumed' | 'idle_start' | 'idle_end'
      session_id: string
      student_id: string
    }
    Update: {
      at?: string
      data?: Json
      id?: string
      kind?: 'visibility_hidden' | 'visibility_visible' | 'fullscreen_exit' | 'leave_warning' | 'interrupted' | 'resumed' | 'idle_start' | 'idle_end'
      session_id?: string
      student_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'session_events_session_id_fkey'
        columns: ['session_id']
        isOneToOne: false
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'session_events_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  session_section_progress: {
    Row: {
      active_seconds: number
      attempts_count: number
      completed_at: string | null
      correct_count: number
      created_at: string
      id: string
      section: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      session_id: string
      started_at: string | null
      state: Json
      status: 'not_started' | 'in_progress' | 'completed'
      updated_at: string
    }
    Insert: {
      active_seconds?: number
      attempts_count?: number
      completed_at?: string | null
      correct_count?: number
      created_at?: string
      id?: string
      section: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      session_id: string
      started_at?: string | null
      state?: Json
      status?: 'not_started' | 'in_progress' | 'completed'
      updated_at?: string
    }
    Update: {
      active_seconds?: number
      attempts_count?: number
      completed_at?: string | null
      correct_count?: number
      created_at?: string
      id?: string
      section?: 'review' | 'vocabulary' | 'vocab_quiz' | 'story' | 'explanation' | 'homework' | 'assessment'
      session_id?: string
      started_at?: string | null
      state?: Json
      status?: 'not_started' | 'in_progress' | 'completed'
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'session_section_progress_session_id_fkey'
        columns: ['session_id']
        isOneToOne: false
        referencedRelation: 'learning_sessions'
        referencedColumns: ['id']
      },
    ]
  }
  speaking_session_notes: {
    Row: {
      created_at: string
      created_by: string | null
      follow_up: string | null
      goals: string | null
      id: string
      observations: string | null
      speaking_session_id: string
      strengths: string | null
      updated_at: string
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      follow_up?: string | null
      goals?: string | null
      id?: string
      observations?: string | null
      speaking_session_id: string
      strengths?: string | null
      updated_at?: string
    }
    Update: {
      created_at?: string
      created_by?: string | null
      follow_up?: string | null
      goals?: string | null
      id?: string
      observations?: string | null
      speaking_session_id?: string
      strengths?: string | null
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'speaking_session_notes_speaking_session_id_fkey'
        columns: ['speaking_session_id']
        isOneToOne: false
        referencedRelation: 'speaking_sessions'
        referencedColumns: ['id']
      },
    ]
  }
  speaking_sessions: {
    Row: {
      ai_job_id: string | null
      created_at: string
      created_by: string | null
      ended_at: string | null
      id: string
      lesson_id: string | null
      plan: Json | null
      planned_at: string | null
      started_at: string | null
      status: 'planned' | 'started' | 'ended' | 'cancelled'
      student_id: string
      updated_at: string
    }
    Insert: {
      ai_job_id?: string | null
      created_at?: string
      created_by?: string | null
      ended_at?: string | null
      id?: string
      lesson_id?: string | null
      plan?: Json | null
      planned_at?: string | null
      started_at?: string | null
      status?: 'planned' | 'started' | 'ended' | 'cancelled'
      student_id: string
      updated_at?: string
    }
    Update: {
      ai_job_id?: string | null
      created_at?: string
      created_by?: string | null
      ended_at?: string | null
      id?: string
      lesson_id?: string | null
      plan?: Json | null
      planned_at?: string | null
      started_at?: string | null
      status?: 'planned' | 'started' | 'ended' | 'cancelled'
      student_id?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'speaking_sessions_ai_job_fkey'
        columns: ['ai_job_id']
        isOneToOne: false
        referencedRelation: 'ai_jobs'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'speaking_sessions_lesson_id_fkey'
        columns: ['lesson_id']
        isOneToOne: false
        referencedRelation: 'curriculum_lessons'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'speaking_sessions_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  student_achievement_records: {
    Row: {
      achievement_id: string
      awarded_at: string
      awarded_by: string | null
      student_id: string
    }
    Insert: {
      achievement_id: string
      awarded_at?: string
      awarded_by?: string | null
      student_id: string
    }
    Update: {
      achievement_id?: string
      awarded_at?: string
      awarded_by?: string | null
      student_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'student_achievement_records_achievement_id_fkey'
        columns: ['achievement_id']
        isOneToOne: false
        referencedRelation: 'achievements'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'student_achievement_records_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  student_learning_profiles: {
    Row: {
      ai_interpretation: Json | null
      ai_job_id: string | null
      created_at: string
      generated_at: string | null
      observed: Json
      student_id: string
      teacher_observations: string | null
      updated_at: string
    }
    Insert: {
      ai_interpretation?: Json | null
      ai_job_id?: string | null
      created_at?: string
      generated_at?: string | null
      observed?: Json
      student_id: string
      teacher_observations?: string | null
      updated_at?: string
    }
    Update: {
      ai_interpretation?: Json | null
      ai_job_id?: string | null
      created_at?: string
      generated_at?: string | null
      observed?: Json
      student_id?: string
      teacher_observations?: string | null
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'student_learning_profiles_ai_job_fkey'
        columns: ['ai_job_id']
        isOneToOne: false
        referencedRelation: 'ai_jobs'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'student_learning_profiles_student_id_fkey'
        columns: ['student_id']
        isOneToOne: true
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  student_profiles: {
    Row: {
      avatar_key: string | null
      created_at: string
      display_name: string | null
      first_name: string | null
      grade: number | null
      last_name: string | null
      profile_completed_at: string | null
      school_id: string | null
      student_code: string
      updated_at: string
      user_id: string
    }
    Insert: {
      avatar_key?: string | null
      created_at?: string
      display_name?: string | null
      first_name?: string | null
      grade?: number | null
      last_name?: string | null
      profile_completed_at?: string | null
      school_id?: string | null
      student_code: string
      updated_at?: string
      user_id: string
    }
    Update: {
      avatar_key?: string | null
      created_at?: string
      display_name?: string | null
      first_name?: string | null
      grade?: number | null
      last_name?: string | null
      profile_completed_at?: string | null
      school_id?: string | null
      student_code?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: 'student_profiles_school_id_fkey'
        columns: ['school_id']
        isOneToOne: false
        referencedRelation: 'schools'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'student_profiles_user_id_fkey'
        columns: ['user_id']
        isOneToOne: true
        referencedRelation: 'profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  system_settings: {
    Row: {
      description: string | null
      key: string
      updated_at: string
      updated_by: string | null
      value: Json
    }
    Insert: {
      description?: string | null
      key: string
      updated_at?: string
      updated_by?: string | null
      value: Json
    }
    Update: {
      description?: string | null
      key?: string
      updated_at?: string
      updated_by?: string | null
      value?: Json
    }
    Relationships: []
  }
  vocabulary_mastery: {
    Row: {
      correct_count: number
      created_at: string
      incorrect_count: number
      item_id: string
      last_attempt_at: string | null
      mastered_at: string | null
      package_id: string
      student_id: string
      updated_at: string
    }
    Insert: {
      correct_count?: number
      created_at?: string
      incorrect_count?: number
      item_id: string
      last_attempt_at?: string | null
      mastered_at?: string | null
      package_id: string
      student_id: string
      updated_at?: string
    }
    Update: {
      correct_count?: number
      created_at?: string
      incorrect_count?: number
      item_id?: string
      last_attempt_at?: string | null
      mastered_at?: string | null
      package_id?: string
      student_id?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'vocabulary_mastery_package_id_fkey'
        columns: ['package_id']
        isOneToOne: false
        referencedRelation: 'lesson_content_packages'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'vocabulary_mastery_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
  weekly_learning_reports: {
    Row: {
      ai_job_id: string | null
      content: Json
      created_at: string
      id: string
      reviewed_at: string | null
      reviewed_by: string | null
      status: 'draft' | 'reviewed'
      student_id: string
      updated_at: string
      week_start: string
    }
    Insert: {
      ai_job_id?: string | null
      content?: Json
      created_at?: string
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: 'draft' | 'reviewed'
      student_id: string
      updated_at?: string
      week_start: string
    }
    Update: {
      ai_job_id?: string | null
      content?: Json
      created_at?: string
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: 'draft' | 'reviewed'
      student_id?: string
      updated_at?: string
      week_start?: string
    }
    Relationships: [
      {
        foreignKeyName: 'weekly_learning_reports_ai_job_fkey'
        columns: ['ai_job_id']
        isOneToOne: false
        referencedRelation: 'ai_jobs'
        referencedColumns: ['id']
      },
      {
        foreignKeyName: 'weekly_learning_reports_student_id_fkey'
        columns: ['student_id']
        isOneToOne: false
        referencedRelation: 'student_profiles'
        referencedColumns: ['user_id']
      },
    ]
  }
}

type LuguFunctions = {
  add_school: {
    Args: { name: string; city: string; district?: string | null; country?: string }
    Returns: Row<'schools'>
  }
  admin_assign_program: {
    Args: { student_id: string; version_id: string; start_lesson_id?: string | null }
    Returns: Row<'program_assignments'>
  }
  admin_merge_schools: {
    Args: { from_id: string; into_id: string }
    Returns: Row<'schools'>
  }
  admin_new_version: {
    Args: { curriculum_id: string }
    Returns: Row<'curriculum_versions'>
  }
  admin_publish_version: {
    Args: { version_id: string }
    Returns: Row<'curriculum_versions'>
  }
  admin_new_revision: {
    Args: { package_id: string; content: Json }
    Returns: Row<'lesson_content_packages'>
  }
  admin_reorder_lessons: {
    /** Every lesson id of the (draft) version, in the new order. */
    Args: { version_id: string; lesson_ids: string[] }
    Returns: undefined
  }
  admin_set_package_status: {
    Args: { package_id: string; status: PackageStatus }
    Returns: Row<'lesson_content_packages'>
  }
  admin_set_progress: {
    Args: { assignment_id: string; action: ProgressAction; lesson_id?: string | null; note?: string | null }
    Returns: Row<'program_assignments'>
  }
  complete_lesson: {
    Args: { session_id: string }
    Returns: LessonCompletion
  }
  complete_section: {
    Args: { session_id: string; section: SectionKey }
    Returns: Row<'session_section_progress'>
  }
  current_student_id: {
    Args: never
    Returns: string | null
  }
  end_break: {
    Args: { break_id: string }
    Returns: Row<'break_sessions'>
  }
  is_admin: {
    Args: never
    Returns: boolean
  }
  mark_password_changed: {
    Args: never
    Returns: undefined
  }
  /** Service role only (admin-students edge function, after a password reset). */
  refresh_password_marker: {
    Args: { p_user_id: string }
    Returns: undefined
  }
  /** Service role only (admin-students edge function). */
  next_student_code: {
    Args: never
    Returns: string
  }
  record_answer: {
    Args: {
      session_id: string
      section: SectionKey
      question_id: string
      response: Json
      response_ms?: number | null
      hint_used?: boolean
      /** Idempotency key: a repeat with the same id returns the first result. */
      client_id?: string | null
    }
    Returns: AnswerResult
  }
  record_review_answer: {
    /** Graded EN→TR against the item's `tr`; does not change mastery. */
    Args: { session_id: string; package_id: string; item_id: string; chosen: string; response_ms?: number | null; client_id?: string | null }
    Returns: AnswerResult
  }
  record_session_event: {
    Args: { session_id: string; kind: SessionEventKind; data?: Json }
    Returns: undefined
  }
  record_vocab_answer: {
    Args: { session_id: string; item_id: string; direction: VocabDirection; chosen: string; response_ms?: number | null; client_id?: string | null }
    Returns: VocabAnswerResult
  }
  save_section_state: {
    Args: { session_id: string; section: SectionKey; state: Json; active_seconds_delta?: number }
    Returns: undefined
  }
  search_schools: {
    Args: { q: string }
    Returns: Row<'schools'>[]
  }
  start_break: {
    Args: { session_id: string; after_section: SectionKey; planned_minutes: BreakMinutes }
    Returns: Row<'break_sessions'>
  }
  start_or_resume_session: {
    Args: { lesson_id: string; kind?: SessionKind }
    Returns: SessionPayload
  }
  student_has_version: {
    Args: { p_version_id: string }
    Returns: boolean
  }
  student_open_break: {
    Args: { session_id: string }
    Returns: Row<'break_sessions'> | null
  }
  student_review_items: {
    Args: { lesson_id: string }
    Returns: ReviewItem[]
  }
  student_lesson_titles: {
    Args: never
    Returns: { id: string; title: string; sequence: number }[]
  }
  student_home: {
    Args: never
    Returns: StudentHome
  }
  student_learning_map: {
    Args: { assignment_id: string }
    Returns: StudentLearningMap
  }
  student_lesson_content: {
    Args: { lesson_id: string }
    Returns: StudentLessonContent
  }
  submit_assessment: {
    /** `answers`: `{ [questionId]: response }`; a missing question counts as wrong. */
    Args: { session_id: string; answers: Json; client_id?: string | null }
    Returns: AssessmentScore
  }
  update_my_profile: {
    Args: {
      first_name?: string | null
      last_name?: string | null
      display_name?: string | null
      grade?: number | null
      school_id?: string | null
      avatar_key?: string | null
    }
    Returns: Row<'student_profiles'>
  }
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12.2.3'
  }
  lugu: {
    Tables: LuguTables
    Views: {
      [_ in never]: never
    }
    Functions: LuguFunctions
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type LuguSchema = Database['lugu']

export type Tables<T extends keyof LuguSchema['Tables']> = LuguSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof LuguSchema['Tables']> = LuguSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof LuguSchema['Tables']> = LuguSchema['Tables'][T]['Update']
export type Functions<T extends keyof LuguSchema['Functions']> = LuguSchema['Functions'][T]
