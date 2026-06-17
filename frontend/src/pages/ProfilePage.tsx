import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";
import {
  changePasswordRequest,
  updateProfileRequest,
} from "../features/auth/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url ?? "");
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
          linkedin_url: linkedinUrl.trim() ? linkedinUrl.trim() : null,
        },
        token,
      );

      setUser(updatedUser);
      setProfileMessage("Profil został zaktualizowany.");
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Nie udało się zapisać profilu",
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
      setPasswordMessage("Hasło zostało zmienione.");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Nie udało się zmienić hasła",
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-2xl font-bold text-white">
              {user.username.slice(0, 1).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-950">
                {user.username}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              <p className="mt-2 text-sm font-bold text-orange-600">
                🔥 {user.points} pkt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Wyloguj
          </button>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Dane profilu</h2>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nick</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
                minLength={3}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                LinkedIn URL
              </span>
              <input
                value={linkedinUrl}
                onChange={(event) => setLinkedinUrl(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
                placeholder="https://www.linkedin.com/in/twoj-profil"
              />
            </label>

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
              {isSavingProfile ? "Zapisywanie..." : "Zapisz profil"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Zmiana hasła</h2>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Aktualne hasło
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
                minLength={6}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Nowe hasło
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
                minLength={6}
                required
              />
            </label>

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
              {isChangingPassword ? "Zmiana hasła..." : "Zmień hasło"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
