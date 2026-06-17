import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

export function Header() {
  const { user, isAuthenticated, isLoadingUser, logout } = useAuth();

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
              `text-sm font-medium ${
                isActive ? "text-slate-950" : "text-slate-500"
              }`
            }
          >
            Kategorie
          </NavLink>

          {isLoadingUser ? (
            <span className="text-sm text-slate-500">Ładowanie...</span>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">
                  {user.username}
                </p>
                <p className="text-xs text-slate-500">{user.points} pkt</p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Wyloguj
              </button>
            </div>
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
