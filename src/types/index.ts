export type QuestionType = 'text' | 'video' | 'photo' | 'true_false' | 'multiple_choice';

export interface Team {
  id: string;
  name: string;
  device_id: string;
  created_at: string;
}

export interface Question {
  id: string;
  qr_code: string;
  type: QuestionType;
  title: string;
  description: string;
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  active: boolean;
  badge_icon: string | null;
  badge_image_url: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  team_id: string;
  question_id: string;
  answer_text: string | null;
  answer_file_url: string | null;
  is_correct: boolean | null;
  submitted_at: string;
  team?: Team;
  question?: Question;
}

export interface AnswerPayload {
  answer_text?: string;
  answer_file?: File;
  is_correct?: boolean;
}

export interface QuestionProps {
  question: Question;
  onSubmit: (answer: AnswerPayload) => Promise<void>;
  disabled?: boolean;
  isSubmitting?: boolean;
}
