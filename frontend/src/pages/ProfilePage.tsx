import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import {
  changePasswordRequest,
  updateProfileRequest,
} from "../features/auth/api";
import { getMyBillingStatusRequest } from "../features/billing/api";
import type { BillingStatus } from "../features/billing/types";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: string, translate: (key: string) => string): string {
  const statusMap: Record<string, string> = {
    free: translate("billing.statusFree"),
    active: translate("billing.statusActive"),
    expired: translate("billing.statusExpired"),
    pending: translate("billing.statusPending"),
    cancelled: translate("billing.statusCancelled"),
  };

  return statusMap[status] ?? status;
}

function SubscriptionCard({
  billing,
  isLoading,
}: {
  billing: BillingStatus | undefined;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  const planName = billing?.current_plan?.name ?? t("billing.freePlan");
  const accessStatus = billing
    ? formatStatus(billing.access_status, t)
    : t("common.loading");

  const validUntil = billing?.subscription_expires_at
    ? formatDate(billing.subscription_expires_at)
    : billing?.current_plan?.billing_period === "lifetime"
      ? t("billing.lifetime")
      : "—";

  const nextPayment = billing?.next_payment_at
    ? formatDate(billing.next_payment_at)
    : t("billing.noNextPayment");

  const daysLeft =
    billing?.days_left !== null && billing?.days_left !== undefined
      ? String(billing.days_left)
      : "—";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {t("billing.title")}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {t("pricing.note")}
          </p>
        </div>

        <Link
          to="/pricing"
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {billing?.is_pro ? t("billing.managePlan") : t("billing.upgradePlan")}
        </Link>
      </div>

      {billing?.should_show_renewal_warning ? (
        <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {t("billing.renewalWarning")}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("billing.currentPackage")}
          </p>
          <p className="mt-2 text-lg font-black text-slate-950">
            {isLoading ? t("common.loading") : planName}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("billing.accessStatus")}
          </p>
          <p className="mt-2 text-lg font-black text-slate-950">
            {accessStatus}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("billing.validUntil")}
          </p>
          <p className="mt-2 text-lg font-black text-slate-950">
            {validUntil}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("billing.daysLeft")}
          </p>
          <p className="mt-2 text-lg font-black text-slate-950">
            {daysLeft}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("billing.nextPayment")}
          </p>
          <p className="mt-2 text-lg font-black text-slate-950">
            {nextPayment}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth();

  const billingQuery = useQuery({
    queryKey: ["my-billing"],
    queryFn: () => getMyBillingStatusRequest(token!),
    enabled: Boolean(token),
  });

  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url ?? "");
  const [githubUrl, setGithubUrl] = useState(user?.github_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(user?.website_url ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    setProfileMessage(null);
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      const updatedUser = await updateProfileRequest(
        {
          username,
          bio: bio.trim() ? bio.trim() : null,
          linkedin_url: linkedinUrl.trim() ? linkedinUrl.trim() : null,
          github_url: githubUrl.trim() ? githubUrl.trim() : null,
          website_url: websiteUrl.trim() ? websiteUrl.trim() : null,
        },
        token,
      );

      setUser(updatedUser);
      setProfileMessage(t("profile.profileUpdated"));
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : t("profile.profileError"),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    setPasswordMessage(null);
    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      await changePasswordRequest(
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        token,
      );

      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage(t("profile.passwordChanged"));
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : t("profile.passwordError"),
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-2xl font-bold text-white">
              {user.username.slice(0, 1).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-950">
                  {user.username}
                </h1>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                  {user.role}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">{user.email}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                  🔥 {user.points}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  🧠 {user.contribution_points}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                  ⚡ {t("ranking.streak")}: {user.current_streak}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                  {t("profile.bestStreak")}: {user.longest_streak}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            {t("profile.logout")}
          </button>
        </div>
      </section>

      <div className="grid gap-6">
        <SubscriptionCard
          billing={billingQuery.data}
          isLoading={billingQuery.isLoading}
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">{t("profile.publicProfile")}</h2>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("auth.username")}
              minLength={3}
              required
            />

            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("profile.bioPlaceholder")}
            />

            <input
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("profile.linkedinUrl")}
            />

            <input
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("profile.githubUrl")}
            />

            <input
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("profile.websiteUrl")}
            />

            {profileMessage ? (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {profileMessage}
              </div>
            ) : null}

            {profileError ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {profileError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isSavingProfile ? t("common.saving") : t("profile.saveProfile")}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">{t("profile.passwordChange")}</h2>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("auth.currentPassword")}
              minLength={6}
              required
            />

            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              placeholder={t("auth.newPassword")}
              minLength={6}
              required
            />

            {passwordMessage ? (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {passwordMessage}
              </div>
            ) : null}

            {passwordError ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {passwordError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isChangingPassword ? t("profile.changingPassword") : t("profile.passwordChange")}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
