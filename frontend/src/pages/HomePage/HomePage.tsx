import { Navigate } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";
import RankingPage from "../RankingPage";
import { Seo } from "../../shared/seo";

export default function HomePage() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <>
        <Seo
          canonicalPath="/"
          title="ReadyWise — Practice for interviews, exams and professional knowledge checks"
          description="Prepare for interviews, exams and professional knowledge checks with practical quizzes, explanations and progress tracking across IT, finance, engineering and more."
        />

        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Loading...
          </div>
        </main>
      </>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Seo
        canonicalPath="/"
        title="ReadyWise — Practice for interviews, exams and professional knowledge checks"
        description="Prepare for interviews, exams and professional knowledge checks with practical quizzes, explanations and progress tracking across IT, finance, engineering and more."
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ReadyWise",
            url: "https://readywise.app",
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ReadyWise",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            url: "https://readywise.app",
            description:
              "A learning platform for interview preparation, exams and professional knowledge checks.",
          },
        ]}
      />

      <RankingPage />
    </>
  );
}
