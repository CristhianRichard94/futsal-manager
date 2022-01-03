import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import ClubPage from "./pages/ClubPage";
import NotFoundPage from "./pages/NotFoundPage";
import ShiftPage from "./pages/ShiftPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user/" element={<UserPage />} />
        <Route path="/club/" element={<ClubPage />} />
        <Route path="/shifts/" element={<ShiftPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
