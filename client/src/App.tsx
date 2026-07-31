import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/components/layout";
import { Toaster } from "@/components/ui";
import {
  AdminDashboard,
  AdminAvailabilityPage,
  AdminMeetsPage,
  BookingPage,
  MeetDetailPage,
  NotFoundPage,
} from "@/pages";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Navigate to="/booking" replace />} />

          <Route path="booking" element={<BookingPage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/availability" element={<AdminAvailabilityPage />} />
          <Route path="admin/meets" element={<AdminMeetsPage />} />
          <Route path="meets/:id" element={<MeetDetailPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
