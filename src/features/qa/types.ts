export interface Question {
  id: string;
  text: string;
  answer: string | null;
  created_at: string;
  edit_reason?: string;
}
