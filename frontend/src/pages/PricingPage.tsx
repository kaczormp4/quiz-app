import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type PricingCardProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted = false,
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

      <Link
        to="/register"
        className={`mt-8 flex w-full justify-center rounded-2xl px-5 py-3 text-sm font-black transition ${
          highlighted
            ? "bg-white text-slate-950 hover:bg-slate-100"
            : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {cta}
      </Link>

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

export default function PricingPage() {
  const { t } = useTranslation();

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
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 lg:grid-cols-4">
        <PricingCard
          name={t("pricing.freeName")}
          price={t("pricing.freePrice")}
          period={t("pricing.freePeriod")}
          description={t("pricing.freeDescription")}
          cta={t("pricing.freeCta")}
          features={[
            t("pricing.freeFeatureOne"),
            t("pricing.freeFeatureTwo"),
            t("pricing.freeFeatureThree"),
            t("pricing.freeFeatureFour"),
          ]}
        />

        <PricingCard
          name={t("pricing.proName")}
          price={t("pricing.proPrice")}
          period={t("pricing.proPeriod")}
          description={t("pricing.proDescription")}
          cta={t("pricing.proCta")}
          highlighted
          features={[
            t("pricing.proFeatureOne"),
            t("pricing.proFeatureTwo"),
            t("pricing.proFeatureThree"),
            t("pricing.proFeatureFour"),
            t("pricing.proFeatureFive"),
          ]}
        />

        <PricingCard
          name={t("pricing.sprintName")}
          price={t("pricing.sprintPrice")}
          period={t("pricing.sprintPeriod")}
          description={t("pricing.sprintDescription")}
          cta={t("pricing.sprintCta")}
          features={[
            t("pricing.sprintFeatureOne"),
            t("pricing.sprintFeatureTwo"),
            t("pricing.sprintFeatureThree"),
            t("pricing.sprintFeatureFour"),
          ]}
        />

        <PricingCard
          name={t("pricing.lifetimeName")}
          price={t("pricing.lifetimePrice")}
          period={t("pricing.lifetimePeriod")}
          description={t("pricing.lifetimeDescription")}
          cta={t("pricing.lifetimeCta")}
          features={[
            t("pricing.lifetimeFeatureOne"),
            t("pricing.lifetimeFeatureTwo"),
            t("pricing.lifetimeFeatureThree"),
            t("pricing.lifetimeFeatureFour"),
          ]}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
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
