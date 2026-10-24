import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HotelDetails from "./pages/HotelDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import Wishlist from "./pages/Wishlist";
import MyBookings from "./pages/MyBookings";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotel/:id" element={<HotelDetails />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<MyProfile />} />
    </Routes>
  );
}

export default App;
