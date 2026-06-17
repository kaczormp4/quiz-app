import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../app/providers/AuthProvider";
import {
  createCheckoutRequest,
  getBillingPlansRequest,
} from "../features/billing/api";
import type { BillingPlan } from "../features/billing/types";

type PricingCardProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  isLoading?: boolean;
  onSelectPlan: () => void;
  secondaryCta?: string;
  secondaryPrice?: string;
  secondaryPeriod?: string;
  onSelectSecondaryPlan?: () => void;
};

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted = false,
  isLoading = false,
  onSelectPlan,
  secondaryCta,
  secondaryPrice,
  secondaryPeriod,
  onSelectSecondaryPlan,
}: PricingCardProps) {
  const { t } = useTranslation();

  return (
    <article
      className={`relative rounded-[2rem] border p-6 shadow-sm ${
        highlighted
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      {highlighted ? (
        <div className="absolute right-5 top-5 rounded-full bg-orange-400 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-950">
          {t("pricing.popular")}
        </div>
      ) : null}

      <h2 className="text-2xl font-black">{name}</h2>

      <p
        className={`mt-3 text-sm ${
          highlighted ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {description}
      </p>

      <div className="mt-6 flex items-end gap-2">
        <span className="text-5xl font-black tracking-tight">{price}</span>
        <span
          className={`pb-2 text-sm font-semibold ${
            highlighted ? "text-slate-300" : "text-slate-500"
          }`}
        >
          / {period}
        </span>
      </div>

      {secondaryPrice ? (
        <div
          className={`mt-2 text-sm font-semibold ${
            highlighted ? "text-green-300" : "text-green-700"
          }`}
        >
          {secondaryPrice} / {secondaryPeriod}
        </div>
      ) : null}

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm font-medium">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                highlighted
                  ? "bg-green-300 text-slate-950"
                  : "bg-green-100 text-green-700"
              }`}
            >
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isLoading}
        onClick={onSelectPlan}
        className={`mt-8 flex w-full justify-center rounded-2xl px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
          highlighted
            ? "bg-white text-slate-950 hover:bg-slate-100"
            : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {isLoading ? t("common.loading") : cta}
      </button>

      {secondaryCta && onSelectSecondaryPlan ? (
        <button
          type="button"
          disabled={isLoading}
          onClick={onSelectSecondaryPlan}
          className={`mt-3 flex w-full justify-center rounded-2xl border px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
            highlighted
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {secondaryCta}
        </button>
      ) : null}

      <p
        className={`mt-3 text-center text-xs ${
          highlighted ? "text-slate-400" : "text-slate-400"
        }`}
      >
        {t("pricing.comingSoon")}
      </p>
    </article>
  );
}

function getFallbackFreeFeatures(t: (key: string) => string): string[] {
  return [
    t("pricing.freeFeatureOne"),
    t("pricing.freeFeatureTwo"),
    t("pricing.freeFeatureThree"),
    t("pricing.freeFeatureFour"),
  ];
}

function getFallbackProFeatures(t: (key: string) => string): string[] {
  return [
    t("pricing.proFeatureOne"),
    t("pricing.proFeatureTwo"),
    t("pricing.proFeatureThree"),
    t("pricing.proFeatureFour"),
    t("pricing.proFeatureFive"),
  ];
}

function formatPrice(plan: BillingPlan | undefined, fallback: string): string {
  if (!plan) {
    return fallback;
  }

  return `$${Math.round(plan.price_amount / 100)}`;
}

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ["billing-plans"],
    queryFn: getBillingPlansRequest,
  });

  const activePlans = plansQuery.data ?? [];

  const freePlan = useMemo(
    () => activePlans.find((plan) => plan.code === "free"),
    [activePlans],
  );

  const proMonthlyPlan = useMemo(
    () => activePlans.find((plan) => plan.code === "pro_monthly"),
    [activePlans],
  );

  const proYearlyPlan = useMemo(
    () => activePlans.find((plan) => plan.code === "pro_yearly"),
    [activePlans],
  );

  const checkoutMutation = useMutation({
    mutationFn: (planCode: string) => {
      if (!token) {
        throw new Error("You must be logged in to buy a package.");
      }

      return createCheckoutRequest(planCode, token);
    },
    onSuccess: (response) => {
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
        return;
      }

      setCheckoutMessage(response.message);
    },
    onError: (error) => {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Could not start checkout.",
      );
    },
  });

  const handleSelectPlan = (planCode: string) => {
    setCheckoutMessage(null);

    if (!isAuthenticated) {
      navigate("/register");
      return;
    }

    if (planCode === "free") {
      navigate("/quizzes");
      return;
    }

    checkoutMutation.mutate(planCode);
  };

  const freeFeatures =
    freePlan?.features?.length ? freePlan.features : getFallbackFreeFeatures(t);

  const proFeatures =
    proMonthlyPlan?.features?.length
      ? proMonthlyPlan.features
      : getFallbackProFeatures(t);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">
            {t("pricing.badge")}
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950">
            {t("pricing.title")}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t("pricing.subtitle")}
          </p>

          {checkoutMessage ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              {checkoutMessage}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-14 lg:grid-cols-2">
        <PricingCard
          name={freePlan?.name ?? t("pricing.freeName")}
          price={formatPrice(freePlan, t("pricing.freePrice"))}
          period={freePlan?.billing_period ?? t("pricing.freePeriod")}
          description={freePlan?.description ?? t("pricing.freeDescription")}
          cta={t("pricing.freeCta")}
          onSelectPlan={() => handleSelectPlan("free")}
          isLoading={checkoutMutation.isPending || plansQuery.isLoading}
          features={freeFeatures}
        />

        <PricingCard
          name="Pro"
          price={formatPrice(proMonthlyPlan, t("pricing.proPrice"))}
          period={t("pricing.proPeriod")}
          description={proMonthlyPlan?.description ?? t("pricing.proDescription")}
          cta={t("pricing.proMonthlyCta")}
          highlighted
          onSelectPlan={() => handleSelectPlan("pro_monthly")}
          isLoading={checkoutMutation.isPending || plansQuery.isLoading}
          secondaryCta={t("pricing.proYearlyCta")}
          secondaryPrice={formatPrice(proYearlyPlan, t("pricing.proYearlyPrice"))}
          secondaryPeriod={t("pricing.proYearlyPeriod")}
          onSelectSecondaryPlan={() => handleSelectPlan("pro_yearly")}
          features={proFeatures}
        />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">
            {t("pricing.faqTitle")}
          </h2>

          <p className="mt-3 max-w-3xl text-slate-600">
            {t("pricing.faqText")}
          </p>

          <div className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
            {t("pricing.note")}
          </div>
        </div>
      </section>
    </main>
  );
}
