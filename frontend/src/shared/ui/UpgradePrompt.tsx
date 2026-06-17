import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type UpgradePromptProps = {
  title?: string;
  description?: string;
};

export function UpgradePrompt({ title, description }: UpgradePromptProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-xl font-black text-amber-950">
        {title ?? t("access.upgradeTitle")}
      </h2>

      <p className="mt-2 text-sm font-medium text-amber-800">
        {description ?? t("access.upgradeDescription")}
      </p>

      <Link
        to="/pricing"
        className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        {t("access.upgradeCta")}
      </Link>
    </div>
  );
}
