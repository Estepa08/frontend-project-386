import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { RootLayout } from "@/components/layout/RootLayout";
import {
  LoginPage,
  AdminDashboard,
  AdminAvailabilityPage,
  AdminMeetingTypesPage,
  AdminMeetsPage,
  UserDashboard,
  BookingPage,
  MeetDetailPage,
  NotFoundPage,
} from "@/pages";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<RootLayout />}>
          <Route index element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/availability" element={<AdminAvailabilityPage />} />
          <Route path="admin/meeting-types" element={<AdminMeetingTypesPage />} />
          <Route path="admin/meets" element={<AdminMeetsPage />} />
          <Route path="user" element={<UserDashboard />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="meets/:id" element={<MeetDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
