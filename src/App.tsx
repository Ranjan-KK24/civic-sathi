
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import MyReports from "./pages/MyReports";
import ReportIssue from "./pages/ReportIssue";
import Profile from "./pages/Profile";
import ExploreMap from "./pages/ExploreMap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/map" element={<ExploreMap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
