import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type LockedFeaturePreviewProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LockedFeaturePreview({
  title,
  description,
  children,
}: LockedFeaturePreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-32 overflow-hidden bg-slate-50">
        <div className="pointer-events-none select-none opacity-50 blur-[2px]">
          {children}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-950 p-4 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm">
                🔒
              </span>

              <h3 className="truncate text-base font-black">
                {title}
              </h3>
            </div>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
              {description}
            </p>
          </div>

          <Link
            to="/pricing"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
          >
            {t("access.upgradeCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
