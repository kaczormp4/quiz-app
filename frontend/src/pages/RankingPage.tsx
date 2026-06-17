import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

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
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRankingRequest,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quiz App
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Ranking użytkowników
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Ranking pokazuje punkty z quizów, streak oraz punkty za zaakceptowane pytania.
        </p>

        <div className="mt-6 flex gap-3">
          {isAuthenticated ? (
            <Link
              to="/quizzes"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Przejdź do quizów
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Zaloguj się
              </Link>

              <Link
                to="/register"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Zarejestruj się
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-950">Top users</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-500">Ładowanie rankingu...</div>
        ) : isError ? (
          <div className="p-6 text-red-600">
            {error instanceof Error ? error.message : "Nie udało się pobrać rankingu"}
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Użytkownik</th>
                  <th className="px-6 py-3">LinkedIn</th>
                  <th className="px-6 py-3 text-right">Streak</th>
                  <th className="px-6 py-3 text-right">Pytania</th>
                  <th className="px-6 py-3 text-right">Total</th>
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
                          admin
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
            Brak użytkowników w rankingu. Zarejestruj pierwsze konto.
          </div>
        )}
      </section>
    </main>
  );
}
