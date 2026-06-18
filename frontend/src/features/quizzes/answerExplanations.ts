export type AnswerExplanationMode = "correct_only" | "selected_answer";

export type AnswerWithExplanation = {
  id: string;
  text: string;
  is_correct?: boolean;
  explanation_html?: string;
};

export type QuestionWithAnswerExplanations = {
  answers?: AnswerWithExplanation[];
  explanation_html?: string;
};

export function getCorrectAnswerExplanationHtml(
  question: QuestionWithAnswerExplanations,
) {
  const correctAnswer = question.answers?.find((answer) => answer.is_correct);

  return correctAnswer?.explanation_html ?? question.explanation_html ?? "";
}

export function getSelectedAnswerExplanationHtml(
  question: QuestionWithAnswerExplanations,
  selectedAnswerId: string | null,
) {
  const selectedAnswer = question.answers?.find(
    (answer) => answer.id === selectedAnswerId,
  );

  return selectedAnswer?.explanation_html ?? "";
}

export function getVisibleExplanationHtml(
  question: QuestionWithAnswerExplanations,
  selectedAnswerId: string | null,
  mode: AnswerExplanationMode = "correct_only",
) {
  if (mode === "selected_answer") {
    return getSelectedAnswerExplanationHtml(question, selectedAnswerId);
  }

  return getCorrectAnswerExplanationHtml(question);
}
