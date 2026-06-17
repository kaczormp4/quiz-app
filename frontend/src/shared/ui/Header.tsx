import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../app/providers/AuthProvider";
import { useBillingAccess } from "../../features/billing/hooks";

export function Header() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoadingUser } = useAuth();
  const billingAccess = useBillingAccess();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="text-lg font-bold text-slate-950"
        >
          {t("common.appName")}
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-slate-950" : "text-slate-500"
              }`
            }
          >
            {t("nav.pricing")}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/quizzes"
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive ? "text-slate-950" : "text-slate-500"
                  }`
                }
              >
                {t("nav.quizzes")}
              </NavLink>

              <NavLink
                to="/contribute"
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive ? "text-slate-950" : "text-slate-500"
                  }`
                }
              >
                {t("nav.contribute")}
              </NavLink>

              {billingAccess.canUseReview ? (
                <NavLink
                  to="/review"
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? "text-slate-950" : "text-slate-500"
                    }`
                  }
                >
                  {t("nav.review")}
                </NavLink>
              ) : (
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1 text-sm font-medium ${
                      isActive ? "text-slate-950" : "text-slate-500"
                    }`
                  }
                >
                  {t("nav.review")}
                  <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    Pro
                  </span>
                </NavLink>
              )}

              {billingAccess.canUseReview ? (
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? "text-slate-950" : "text-slate-500"
                    }`
                  }
                >
                  {t("nav.history")}
                </NavLink>
              ) : (
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1 text-sm font-medium ${
                      isActive ? "text-slate-950" : "text-slate-500"
                    }`
                  }
                >
                  {t("nav.history")}
                  <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    Pro
                  </span>
                </NavLink>
              )}

              {user?.role === "admin" ? (
                <NavLink
                  to="/admin/pending"
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? "text-slate-950" : "text-red-600"
                    }`
                  }
                >
                  {t("nav.admin")}
                </NavLink>
              ) : null}
            </>
          ) : null}

          {isLoadingUser ? (
            <span className="text-sm text-slate-500">
              {t("common.loading")}
            </span>
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
                  🔥 {user.points} · ⚡ {user.current_streak}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t("nav.login")}
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
