import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JobListingsPage from "./pages/JobListingsPage";
import JobDetailPage from "./pages/JobDetailPage";
import RecommendRolePage from "./pages/recommender/RecommendRolePage";
import RecommendStackPage from "./pages/recommender/RecommendStackPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobListingsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
        </Route>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route
          path="/recommend-role"
          element={
            <MainLayout>
              <ProtectedRoute>
                <RecommendRolePage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/recommend-stack"
          element={
            <MainLayout>
              <ProtectedRoute>
                <RecommendStackPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
