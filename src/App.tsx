import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import ClubHome from "@/pages/ClubHome";
import ActivityDetail from "@/pages/ActivityDetail";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClubs from "@/pages/admin/Clubs";
import AdminActivities from "@/pages/admin/Activities";
import AdminFinances from "@/pages/admin/Finances";
import AdminReviews from "@/pages/admin/Reviews";

import LeaderDashboard from "@/pages/leader/Dashboard";
import LeaderClub from "@/pages/leader/Club";
import LeaderMembers from "@/pages/leader/Members";
import LeaderActivities from "@/pages/leader/Activities";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/club/:clubId" element={<ClubHome />} />
        <Route path="/activity/:activityId" element={<ActivityDetail />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clubs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <AdminClubs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activities"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <AdminActivities />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finances"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <AdminFinances />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin">
                <AdminReviews />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leader/dashboard"
          element={
            <ProtectedRoute allowedRoles={["leader"]}>
              <DashboardLayout role="leader">
                <LeaderDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/club"
          element={
            <ProtectedRoute allowedRoles={["leader"]}>
              <DashboardLayout role="leader">
                <LeaderClub />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/members"
          element={
            <ProtectedRoute allowedRoles={["leader"]}>
              <DashboardLayout role="leader">
                <LeaderMembers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leader/activities"
          element={
            <ProtectedRoute allowedRoles={["leader"]}>
              <DashboardLayout role="leader">
                <LeaderActivities />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-serif font-bold text-brand-900 mb-4">404</h1>
                <p className="text-gray-500 mb-6">页面不存在</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
