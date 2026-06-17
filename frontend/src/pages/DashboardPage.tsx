import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import { getAnswerHistoryRequest, getWrongAnswersRequest } from "../features/auth/api";
import { useBillingAccess } from "../features/billing/hooks";
import { getCategories, getMyPendingQuestionsRequest } from "../features/quizzes/api";
import { LockedFeaturePreview } from "../shared/ui/LockedFeaturePreview";

type DashboardCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
};

function DashboardCard({ title, value, description, icon }: DashboardCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black text-slate-950">
            {value}
          </p>

          {description ? (
            <p className="mt-2 text-sm text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl">
            {icon}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function QuickAction({
  to,
  title,
  description,
  icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-lg font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

function formatPlanName(value: string | undefined): string {
  return value ?? "Free";
}

function formatDaysLeft(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return String(value);
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, token, isLoadingUser } = useAuth();
  const billingAccess = useBillingAccess();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const pendingQuestionsQuery = useQuery({
    queryKey: ["my-pending-questions"],
    queryFn: () => getMyPendingQuestionsRequest(token!),
    enabled: Boolean(token),
  });

  const wrongAnswersQuery = useQuery({
    queryKey: ["wrong-answers"],
    queryFn: () => getWrongAnswersRequest(token!),
    enabled: Boolean(token && billingAccess.canUseReview),
  });

  const historyQuery = useQuery({
    queryKey: ["answer-history"],
    queryFn: () => getAnswerHistoryRequest(token!),
    enabled: Boolean(token && billingAccess.canUseReview),
  });

  if (isLoadingUser) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          {t("common.loading")}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          You are not logged in.
        </div>
      </main>
    );
  }

  const currentPlan = billingAccess.billing?.current_plan;
  const accessStatus = billingAccess.billing?.access_status ?? "free";
  const daysLeft = billingAccess.billing?.days_left;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {t("dashboard.title")}
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                {t("dashboard.welcomeBack")}, {user.username}
              </h1>

              <p className="mt-2 text-slate-500">
                {t("dashboard.subtitle")}
              </p>
            </div>

            <Link
              to="/quizzes"
              className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              {t("dashboard.startLearning")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm lg:col-span-1">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {t("dashboard.currentPlan")}
            </p>

            <h2 className="mt-3 text-3xl font-black">
              {formatPlanName(currentPlan?.name)}
            </h2>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t("dashboard.accessStatus")}
                </p>

                <p className="mt-1 text-lg font-black capitalize">
                  {accessStatus}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t("dashboard.daysLeft")}
                </p>

                <p className="mt-1 text-lg font-black">
                  {formatDaysLeft(daysLeft)}
                </p>
              </div>
            </div>

            <Link
              to="/pricing"
              className="mt-5 inline-flex w-full justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              {t("dashboard.viewPricing")}
            </Link>
          </article>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            <DashboardCard
              title={t("dashboard.points")}
              value={user.points ?? 0}
              icon="🔥"
            />

            <DashboardCard
              title={t("dashboard.contributionPoints")}
              value={user.contribution_points ?? 0}
              icon="🧠"
            />

            <DashboardCard
              title={t("dashboard.currentStreak")}
              value={user.current_streak ?? 0}
              icon="⚡"
            />

            <DashboardCard
              title={t("dashboard.bestStreak")}
              value={user.longest_streak ?? 0}
              icon="🏆"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-4">
          <DashboardCard
            title={t("dashboard.categories")}
            value={categoriesQuery.data?.length ?? "—"}
            description={t("dashboard.learningStats")}
            icon="📚"
          />

          <DashboardCard
            title={t("dashboard.reviewQuestions")}
            value={billingAccess.canUseReview ? wrongAnswersQuery.data?.length ?? "—" : "Pro"}
            description={billingAccess.canUseReview ? t("dashboard.learningStats") : "Locked"}
            icon="🔁"
          />

          <DashboardCard
            title={t("dashboard.answerHistory")}
            value={billingAccess.canUseReview ? historyQuery.data?.length ?? "—" : "Pro"}
            description={billingAccess.canUseReview ? t("dashboard.learningStats") : "Locked"}
            icon="📈"
          />

          <DashboardCard
            title={t("dashboard.pendingQuestions")}
            value={pendingQuestionsQuery.data?.length ?? "—"}
            description={t("dashboard.learningStats")}
            icon="📝"
          />
        </div>

        {!billingAccess.canUseReview ? (
          <div className="mt-5">
            <LockedFeaturePreview
              title={t("dashboard.proFeatureTitle")}
              description={t("dashboard.proFeatureDescription")}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-black text-slate-950">Review mode</h3>
                  <div className="mt-4 space-y-3">
                    <div className="h-10 rounded-2xl bg-slate-100" />
                    <div className="h-10 rounded-2xl bg-slate-100" />
                    <div className="h-10 rounded-2xl bg-slate-100" />
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-black text-slate-950">Answer history</h3>
                  <div className="mt-4 space-y-3">
                    <div className="h-10 rounded-2xl bg-slate-100" />
                    <div className="h-10 rounded-2xl bg-slate-100" />
                    <div className="h-10 rounded-2xl bg-slate-100" />
                  </div>
                </article>
              </div>
            </LockedFeaturePreview>
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="text-2xl font-black text-slate-950">
            {t("dashboard.quickActions")}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-4">
            <QuickAction
              to="/quizzes"
              title={t("dashboard.startLearning")}
              description="Choose a category and practice interview-style questions."
              icon="🎯"
            />

            <QuickAction
              to={billingAccess.canUseReview ? "/review" : "/pricing"}
              title={t("dashboard.openReview")}
              description="Repeat wrong answers and focus on weak areas."
              icon="🔁"
            />

            <QuickAction
              to="/contribute"
              title={t("dashboard.addQuestion")}
              description="Submit new questions for admin approval."
              icon="✍️"
            />

            <QuickAction
              to={billingAccess.canUseReview ? "/history" : "/pricing"}
              title={t("dashboard.viewHistory")}
              description="Track your answers and preparation progress."
              icon="📈"
            />
          </div>
        </section>
      </section>
    </main>
  );
}
