import { Route, Routes } from "react-router-dom";

import { Header } from "./shared/ui/Header";
import { ProtectedRoute } from "./shared/ui/ProtectedRoute";
import CategoriesPage from "./pages/CategoriesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import QuestionPage from "./pages/QuestionPage";
import QuestionsPage from "./pages/QuestionsPage";
import RankingPage from "./pages/RankingPage";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <Routes>
        <Route path="/" element={<RankingPage />} />

        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories/:slug"
          element={
            <ProtectedRoute>
              <QuestionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/questions/:questionId"
          element={
            <ProtectedRoute>
              <QuestionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}
