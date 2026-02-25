import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Flights from './pages/Flights';
import { setRouterNavigate } from './main';

/** Registers React Router's navigate function globally so navigateToStep() works from any component. */
function NavigateRegistrar() {
  const navigate = useNavigate();
  useEffect(() => {
    setRouterNavigate(navigate);
    return () => setRouterNavigate(() => {});
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <NavigateRegistrar />
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Legacy flights route */}
        <Route path="/booking/flights" element={<Flights />} />

        {/* Per-step debug routes */}
        <Route path="/flights" element={<Flights />} />
        <Route path="/checkout" element={<Flights />} />
        <Route path="/signin" element={<Flights />} />
        <Route path="/info" element={<Flights />} />
        <Route path="/seats" element={<Flights />} />
        <Route path="/extras" element={<Flights />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
