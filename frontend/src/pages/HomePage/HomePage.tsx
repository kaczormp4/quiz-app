import { Navigate } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";
import RankingPage from "../RankingPage";

export default function HomePage() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RankingPage />;
}

