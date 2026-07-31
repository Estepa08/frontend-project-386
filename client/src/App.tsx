import { Routes, Route } from "react-router-dom";
import { RootLayout, RoleGuard } from "@/components/layout";
import { Toaster } from "@/components/ui";
import {
  AdminDashboard,
  AdminAvailabilityPage,
  AdminEventTypesPage,
  AdminMeetsPage,
  BookingPage,
  LandingPage,
  MeetDetailPage,
  NotFoundPage,
} from "@/pages";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<LandingPage />} />

          <Route path="booking" element={<BookingPage />} />

          <Route element={<RoleGuard />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/availability" element={<AdminAvailabilityPage />} />
            <Route path="admin/event-types" element={<AdminEventTypesPage />} />
            <Route path="admin/meets" element={<AdminMeetsPage />} />
            <Route path="meets/:id" element={<MeetDetailPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
