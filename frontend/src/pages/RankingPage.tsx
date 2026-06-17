import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import { getRankingRequest } from "../features/auth/api";

function LinkedinIconLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white transition hover:bg-blue-700"
      title="LinkedIn profile"
    >
      in
    </a>
  );
}

export default function RankingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRankingRequest,
  });

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
              {t("home.badge")}
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              {t("home.title")}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {t("home.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? "/quizzes" : "/register"}
                className="rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {isAuthenticated ? t("home.primaryCta") : t("home.registerCta")}
              </Link>

              <a
                href="#leaderboard"
                className="rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                {t("home.secondaryCta")}
              </a>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="rounded-full px-6 py-4 text-sm font-bold text-slate-600 transition hover:text-slate-950"
                >
                  {t("home.loginCta")}
                </Link>
              ) : null}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-3xl">🎯</div>
                <p className="mt-3 text-sm font-bold text-slate-950">
                  {t("home.statQuestions")}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-3xl">🔁</div>
                <p className="mt-3 text-sm font-bold text-slate-950">
                  {t("home.statReview")}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-3xl">📈</div>
                <p className="mt-3 text-sm font-bold text-slate-950">
                  {t("home.statProgress")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  {t("common.appName")}
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Interview readiness
                </h2>
              </div>

              <div className="rounded-2xl bg-green-400 px-3 py-2 text-sm font-black text-slate-950">
                LIVE
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>JavaScript fundamentals</span>
                  <span className="font-bold text-green-300">82%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[82%] rounded-full bg-green-300" />
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>React interview topics</span>
                  <span className="font-bold text-blue-300">68%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[68%] rounded-full bg-blue-300" />
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>HTTP & API knowledge</span>
                  <span className="font-bold text-orange-300">74%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[74%] rounded-full bg-orange-300" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-5 text-slate-950">
              <p className="text-sm font-bold text-slate-500">
                Next recommended topic
              </p>
              <p className="mt-1 text-xl font-black">
                React reconciliation and keys
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Practice weak areas before they appear during the interview.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black text-slate-950">
            {t("home.featureTitle")}
          </h2>

          <p className="mt-3 text-slate-600">
            {t("home.featureSubtitle")}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl">
              🧠
            </div>
            <h3 className="text-xl font-black text-slate-950">
              {t("home.featureQuizzesTitle")}
            </h3>
            <p className="mt-3 text-slate-600">
              {t("home.featureQuizzesText")}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl">
              🔁
            </div>
            <h3 className="text-xl font-black text-slate-950">
              {t("home.featureReviewTitle")}
            </h3>
            <p className="mt-3 text-slate-600">
              {t("home.featureReviewText")}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl">
              🤝
            </div>
            <h3 className="text-xl font-black text-slate-950">
              {t("home.featureCommunityTitle")}
            </h3>
            <p className="mt-3 text-slate-600">
              {t("home.featureCommunityText")}
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-black text-slate-950">
            {t("home.howItWorksTitle")}
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                1
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {t("home.stepOneTitle")}
              </h3>
              <p className="mt-2 text-slate-600">
                {t("home.stepOneText")}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                2
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {t("home.stepTwoTitle")}
              </h3>
              <p className="mt-2 text-slate-600">
                {t("home.stepTwoText")}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                3
              </div>
              <h3 className="text-lg font-black text-slate-950">
                {t("home.stepThreeTitle")}
              </h3>
              <p className="mt-2 text-slate-600">
                {t("home.stepThreeText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="leaderboard" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950">
              {t("home.rankingTitle")}
            </h2>
            <p className="mt-2 text-slate-600">
              {t("home.rankingSubtitle")}
            </p>
          </div>

          <Link
            to={isAuthenticated ? "/quizzes" : "/register"}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {isAuthenticated ? t("home.primaryCta") : t("home.registerCta")}
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-6 text-slate-500">{t("common.loading")}</div>
          ) : isError ? (
            <div className="p-6 text-red-600">
              {error instanceof Error ? error.message : t("ranking.loadError")}
            </div>
          ) : data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">{t("common.user")}</th>
                    <th className="px-6 py-3">{t("ranking.linkedin")}</th>
                    <th className="px-6 py-3 text-right">{t("ranking.streak")}</th>
                    <th className="px-6 py-3 text-right">{t("ranking.contributionPoints")}</th>
                    <th className="px-6 py-3 text-right">{t("common.total")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.map((user, index) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 font-semibold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-950">
                          {user.username}
                        </div>

                        {user.role === "admin" ? (
                          <div className="mt-1 text-xs font-bold uppercase text-red-600">
                            {t("ranking.roleAdmin")}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-6 py-4">
                        {user.linkedin_url ? (
                          <LinkedinIconLink url={user.linkedin_url} />
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-amber-600">
                        ⚡ {user.current_streak}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-blue-600">
                        🧠 {user.contribution_points}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-orange-600">
                        🔥 {user.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-slate-500">
              {t("ranking.noUsers")}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
