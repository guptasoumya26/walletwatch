export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is the name of your best friend from childhood?",
  "What was the make of your first car?",
  "What is your favorite food?",
  "What was the name of your favorite teacher?",
  "What street did you grow up on?",
  "What is your favorite color?",
  "What was the name of your first boss?",
  "What is your father's middle name?",
  "What was your favorite subject in school?"
] as const

export type SecurityQuestion = typeof SECURITY_QUESTIONS[number]