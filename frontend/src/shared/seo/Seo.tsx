import { Helmet } from "react-helmet-async";

const SITE_NAME = "ReadyWise";
const SITE_URL = "https://readywise.app";

type SeoProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const defaultTitle =
  "ReadyWise — Practice for interviews, exams and professional knowledge checks";

const defaultDescription =
  "Prepare for interviews, exams and professional knowledge checks with practical quizzes, explanations and progress tracking across IT, finance, engineering and more.";

export function Seo({
  title = defaultTitle,
  description = defaultDescription,
  canonicalPath = "/",
  noindex = false,
  type = "website",
  jsonLd,
}: SeoProps) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? "noindex,nofollow" : "index,follow"}
      />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
