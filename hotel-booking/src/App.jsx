import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import HotelDetails from "./pages/HotelDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import Wishlist from "./pages/Wishlist";
import MyBookings from "./pages/MyBookings";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";

import AdminLayout from "./admin/AdminLayout/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import ManageHotels from "./admin/pages/ManageHotel";
import ManageBookings from "./admin/pages/ManageBookings";
import ManageUsers from "./admin/pages/ManageUsers";
import GuestManagement from "./admin/pages/GuestManagement";
import ReviewsManagement from "./admin/pages/ReviewsManagement";

function App() {
  return (
    <Routes>
      {/* User pages */}
      <Route path="/" element={<Home />} />
      <Route path="/hotel/:id" element={<HotelDetails />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<MyProfile />} />

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin pages */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hotels" element={<ManageHotels />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="guests" element={<GuestManagement />} />
          <Route path="reviews" element={<ReviewsManagement />} />
        </Route>
    </Route>
    </Routes>
  );
}

export default App;
