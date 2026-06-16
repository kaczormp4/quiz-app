import { Route, Routes } from "react-router-dom";

import { CategoriesPage } from "./pages/CategoriesPage";
import { QuestionPage } from "./pages/QuestionPage";
import { QuestionsPage } from "./pages/QuestionsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CategoriesPage />} />
      <Route path="/categories/:slug" element={<QuestionsPage />} />
      <Route path="/questions/:questionId" element={<QuestionPage />} />
    </Routes>
  );
}
