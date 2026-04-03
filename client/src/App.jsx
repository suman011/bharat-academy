import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Routes, Route } from "react-router-dom";
import { appTheme } from "./theme/muiTheme";
import ScrollToTop from "./components/ScrollToTop";
import AnimatedLayout from "./components/AnimatedLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./context/CartContext";
import Enrollments from "./pages/Enrollments";
import Orders from "./pages/Orders";
import AdminPanel from "./pages/AdminPanel";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import "./index.css";

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
    <CartProvider>
      <ScrollToTop />
      <Navbar />
      <main className="site-main" id="main-content">
        <Routes>
          <Route element={<AnimatedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseSlug" element={<CourseDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </CartProvider>
    </ThemeProvider>
  );
}
