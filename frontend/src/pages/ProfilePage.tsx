import { FormEvent, useState } from "react";

import { useAuth } from "../app/providers/AuthProvider";
import {
  changePasswordRequest,
  updateProfileRequest,
} from "../features/auth/api";

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
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
      const updatedUser = await updateProfileRequest({ username }, token);

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

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">Profil użytkownika</h1>
        <p className="mt-2 text-slate-500">
          Zarządzaj nickiem i hasłem konta.
        </p>
      </div>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Dane profilu</h2>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Punkty:</strong> {user.points}
            </p>
          </div>

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
