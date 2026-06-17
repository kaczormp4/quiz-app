import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../app/providers/AuthProvider";
import { getMyBillingStatusRequest } from "./api";

const difficultyRank: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function isDifficultyAllowedByPlan(
  difficulty: string,
  maxDifficulty: string,
): boolean {
  const currentDifficultyRank = difficultyRank[difficulty] ?? 999;
  const maxDifficultyRank = difficultyRank[maxDifficulty] ?? 1;

  return currentDifficultyRank <= maxDifficultyRank;
}

export function useBillingAccess() {
  const { token } = useAuth();

  const billingQuery = useQuery({
    queryKey: ["my-billing"],
    queryFn: () => getMyBillingStatusRequest(token!),
    enabled: Boolean(token),
  });

  const plan = billingQuery.data?.current_plan ?? null;

  const canAnswerQuestions = plan?.can_answer_questions ?? false;
  const canViewExplanations = plan?.can_view_explanations ?? false;
  const canUseReview = plan?.can_use_review ?? false;
  const canSubmitQuestions = plan?.can_submit_questions ?? false;
  const hasUnlimitedQuestions = plan?.has_unlimited_questions ?? false;
  const maxDifficulty = plan?.max_difficulty ?? "easy";

  return {
    isLoading: billingQuery.isLoading,
    billing: billingQuery.data,
    plan,
    canAnswerQuestions,
    canViewExplanations,
    canUseReview,
    canSubmitQuestions,
    hasUnlimitedQuestions,
    maxDifficulty,
    isDifficultyAllowed: (difficulty: string) =>
      isDifficultyAllowedByPlan(difficulty, maxDifficulty),
  };
}
