import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useAuth } from "../../app/providers/AuthProvider";
import { Seo } from "../../shared/seo";

type Plan = {
  id?: string;
  code: string;
  name: string;
  description: string;
  price_amount: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_active?: boolean;
  sort_order?: number;
};

type CheckoutResponse = {
  checkout_url?: string | null;
  provider?: string;
  message?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? "https://quiz-app-api-gujn.onrender.com"
    : "http://localhost:8000");

const FALLBACK_PLANS: Plan[] = [
  {
    code: "free",
    name: "Free",
    description: "Start learning for free with easy questions.",
    price_amount: 0,
    currency: "USD",
    billing_period: "forever",
    features: [
      "Easy level questions",
      "Correct answer for easy questions",
      "Community question submissions",
      "No explanations",
      "No review mode",
      "No answer history",
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    code: "pro_30_days",
    name: "30-Day Pass",
    description: "One payment for 30 days of full Pro access. No subscription.",
    price_amount: 1499,
    currency: "USD",
    billing_period: "one_time_30_days",
    features: [
      "30 days of Pro access",
      "One payment",
      "No subscription",
      "All difficulty levels",
      "Full explanations",
      "Review mode",
      "Answer history",
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    code: "pro_monthly",
    name: "Monthly Subscription",
    description: "Pay monthly with a minimum 12-month commitment.",
    price_amount: 999,
    currency: "USD",
    billing_period: "monthly_min_12",
    features: [
      "$9.99/month",
      "Minimum 12-month commitment",
      "Billed monthly",
      "All difficulty levels",
      "Full explanations",
      "Review mode",
      "Answer history",
      "Community question submissions",
    ],
    is_active: true,
    sort_order: 3,
  },
  {
    code: "pro_yearly",
    name: "Annual Upfront",
    description: "Pay upfront for one year. Best value.",
    price_amount: 9900,
    currency: "USD",
    billing_period: "yearly_upfront",
    features: [
      "$99 paid upfront",
      "One year of Pro access",
      "Equivalent to $8.25/month",
      "Save $20.88 vs monthly subscription",
      "All difficulty levels",
      "Full explanations",
      "Review mode",
      "Answer history",
      "Community question submissions",
    ],
    is_active: true,
    sort_order: 4,
  },
];

async function getPlans(): Promise<Plan[]> {
  const response = await fetch(`${API_BASE_URL}/billing/plans`);

  if (!response.ok) {
    throw new Error("Failed to load pricing plans");
  }

  return response.json();
}

async function createCheckout(
  planCode: string,
  token: string,
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE_URL}/billing/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan_code: planCode,
    }),
  });

  if (!response.ok) {
    throw new Error("Checkout could not be created");
  }

  return response.json();
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function getBadge(plan: Plan) {
  if (plan.code === "free") return "Start free";
  if (plan.code === "pro_30_days") return "One payment";
  if (plan.code === "pro_monthly") return "Commitment";
  if (plan.code === "pro_yearly") return "Best value";

  return "Plan";
}

function getPriceSuffix(plan: Plan) {
  if (plan.code === "free") return "/ forever";
  if (plan.code === "pro_30_days") return "/ 30 days";
  if (plan.code === "pro_monthly") return "/ month";
  if (plan.code === "pro_yearly") return "/ year";

  return "";
}

function getShortInfo(plan: Plan) {
  if (plan.code === "free") {
    return "Free forever";
  }

  if (plan.code === "pro_30_days") {
    return "Single payment. No subscription.";
  }

  if (plan.code === "pro_monthly") {
    return "Minimum 12 months. Total commitment: $119.88.";
  }

  if (plan.code === "pro_yearly") {
    return "Paid upfront. Equivalent to $8.25/month.";
  }

  return plan.billing_period;
}

function getHighlight(plan: Plan) {
  if (plan.code === "free") {
    return "Good for browsing and submitting questions.";
  }

  if (plan.code === "pro_30_days") {
    return "Best for one short interview sprint.";
  }

  if (plan.code === "pro_monthly") {
    return `${formatPrice(plan.price_amount, plan.currency)} / month, minimum 12 months.`;
  }

  if (plan.code === "pro_yearly") {
    return "Cheapest yearly option. Save $20.88 vs monthly subscription.";
  }

  return "";
}

function isRecommended(plan: Plan) {
  return plan.code === "pro_yearly";
}

function isPaidPlan(plan: Plan) {
  return plan.price_amount > 0;
}

export default function PricingPage() {
  const { token, isAuthenticated } = useAuth();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ["billing-plans"],
    queryFn: getPlans,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planCode: string) => {
      if (!token) {
        throw new Error("You need to be logged in to continue.");
      }

      return createCheckout(planCode, token);
    },
    onSuccess: (response) => {
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
        return;
      }

      setCheckoutMessage(
        response.message ??
          "Payments are not enabled yet. Checkout will be available soon.",
      );
    },
    onError: (error) => {
      setCheckoutMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating checkout.",
      );
    },
  });

  const plans = useMemo(() => {
    const fetchedByCode = new Map(
      (plansQuery.data ?? []).map((plan) => [plan.code, plan]),
    );

    // UI pricing is source-of-truth here, so the page stays consistent
    // even when the deployed API still has old cached/seeded plan data.
    return FALLBACK_PLANS.map((fallbackPlan) => {
      const fetchedPlan = fetchedByCode.get(fallbackPlan.code);

      return {
        ...fallbackPlan,
        ...(fetchedPlan ?? {}),
        id: fetchedPlan?.id ?? fallbackPlan.id,
        is_active: fetchedPlan?.is_active ?? fallbackPlan.is_active,
      };
    })
      .filter((plan) => plan.is_active !== false)
      .sort((left, right) => {
        const leftOrder = left.sort_order ?? 999;
        const rightOrder = right.sort_order ?? 999;

        return leftOrder - rightOrder;
      });
  }, [plansQuery.data]);

  const handlePlanClick = (plan: Plan) => {
    setCheckoutMessage(null);

    if (!isAuthenticated) {
      window.location.href = "/register";
      return;
    }

    if (!isPaidPlan(plan)) {
      window.location.href = "/quizzes";
      return;
    }

    checkoutMutation.mutate(plan.code);
  };

  return (
    <>
      <Seo
        canonicalPath="/pricing"
        title="ReadyWise pricing — Interview and exam preparation plans"
        description="Choose a ReadyWise plan and prepare for interviews, exams and professional knowledge checks with practical quizzes and explanations."
      />

      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
              Pricing
            </p>

            <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-black tracking-tight text-slate-950">
              Choose how you want to unlock Pro
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Free access stays useful. Pro can be bought for 30 days, paid
              monthly with a 12-month commitment, or paid upfront for the best
              yearly price.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          {plansQuery.isError ? (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-800">
              Pricing API could not be loaded. Showing fallback pricing.
            </div>
          ) : null}

          {checkoutMessage ? (
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-sm">
              {checkoutMessage}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.code}
                className={`relative flex flex-col rounded-[2rem] border p-6 shadow-sm ${
                  isRecommended(plan)
                    ? "border-slate-950 bg-slate-950 text-white shadow-2xl"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-black uppercase tracking-wide ${
                        isRecommended(plan)
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {getBadge(plan)}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">{plan.name}</h2>
                  </div>

                  {isRecommended(plan) ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-950">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <p
                  className={`mt-4 min-h-16 text-sm leading-6 ${
                    isRecommended(plan) ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-7">
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="text-5xl font-black tracking-tight">
                      {formatPrice(plan.price_amount, plan.currency)}
                    </span>

                    <span
                      className={`pb-2 text-sm font-bold ${
                        isRecommended(plan)
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {getPriceSuffix(plan)}
                    </span>
                  </div>

                  <p
                    className={`mt-3 text-sm font-bold ${
                      isRecommended(plan)
                        ? "text-emerald-300"
                        : "text-slate-600"
                    }`}
                  >
                    {getHighlight(plan)}
                  </p>

                  <p
                    className={`mt-2 text-xs font-semibold uppercase tracking-wide ${
                      isRecommended(plan) ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {getShortInfo(plan)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  disabled={checkoutMutation.isPending}
                  className={`mt-7 w-full rounded-2xl px-5 py-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isRecommended(plan)
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.code === "free"
                    ? "Start free"
                    : checkoutMutation.isPending
                      ? "Preparing checkout..."
                      : "Choose plan"}
                </button>

                <ul className="mt-7 grow space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex gap-3 text-sm leading-6 ${
                        isRecommended(plan)
                          ? "text-slate-200"
                          : "text-slate-600"
                      }`}
                    >
                      <span
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          isRecommended(plan)
                            ? "bg-white text-slate-950"
                            : "bg-slate-100 text-slate-950"
                        }`}
                      >
                        âś“
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">Free</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Free access gives users a real product preview, not just a
                  landing page.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-950">
                  30-Day Pass
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Best for people who want one short interview preparation
                  sprint.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-950">Monthly</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Lower monthly price, but with a minimum 12-month commitment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-950">Annual</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cheapest yearly option. Paid upfront for one year.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-slate-950 hover:underline"
            >
              Log in
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
