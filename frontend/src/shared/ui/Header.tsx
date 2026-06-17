import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

export function Header() {
  const { user, isAuthenticated, isLoadingUser } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-bold text-slate-950">
          Quiz App
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-slate-950" : "text-slate-500"}`
            }
          >
            Ranking
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/quizzes"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-950" : "text-slate-500"}`
                }
              >
                Quizy
              </NavLink>

              <NavLink
                to="/contribute"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-950" : "text-slate-500"}`
                }
              >
                Dodaj pytania
              </NavLink>

              <NavLink
                to="/review"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-950" : "text-slate-500"}`
                }
              >
                Powtórki
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-950" : "text-slate-500"}`
                }
              >
                Historia
              </NavLink>

              {user?.role === "admin" ? (
                <NavLink
                  to="/admin/pending"
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-slate-950" : "text-red-600"}`
                  }
                >
                  Admin
                </NavLink>
              ) : null}
            </>
          ) : null}

          {isLoadingUser ? (
            <span className="text-sm text-slate-500">Ładowanie...</span>
          ) : isAuthenticated && user ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:border-slate-300 hover:bg-white"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {user.username.slice(0, 1).toUpperCase()}
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">
                  {user.username}
                </p>
                <p className="text-xs font-semibold text-orange-600">
                  🔥 {user.points} pkt · ⚡ {user.current_streak}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logowanie
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Rejestracja
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
