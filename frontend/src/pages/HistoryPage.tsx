import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";
import { getAnswerHistoryRequest } from "../features/auth/api";

export default function HistoryPage() {
  const { token } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["answer-history"],
    queryFn: () => getAnswerHistoryRequest(token!),
    enabled: Boolean(token),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Historia odpowiedzi</h1>
        <p className="mt-2 text-slate-500">
          Lista ostatnich odpowiedzi użytkownika.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Ładowanie historii...
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error instanceof Error ? error.message : "Nie udało się pobrać historii"}
        </div>
      ) : data && data.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Pytanie</th>
                  <th className="px-6 py-3">Odpowiedź</th>
                  <th className="px-6 py-3">Kategoria</th>
                  <th className="px-6 py-3">Akcja</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      {item.is_correct ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Dobrze
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Źle
                        </span>
                      )}
                    </td>

                    <td className="max-w-md px-6 py-4 font-medium text-slate-950">
                      {item.question}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.selected_answer_text}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.category_name}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/questions/${item.question_id}`}
                        className="text-sm font-semibold text-slate-950 hover:underline"
                      >
                        Otwórz
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Nie masz jeszcze historii odpowiedzi.
        </div>
      )}
    </main>
  );
}
