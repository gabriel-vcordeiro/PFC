import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ResetPasswordPage from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ConsentPolicy from './pages/ConsentPolicy';
import LoginNeededRoute from './components/LoginNeededRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/consent-policy" element={<ConsentPolicy />} />
        <Route path="/home" element={<LoginNeededRoute><Home /></LoginNeededRoute>} />
        <Route path="/profile" element={<LoginNeededRoute><Profile /></LoginNeededRoute>} />
        <Route path="/settings" element={<LoginNeededRoute><Settings /></LoginNeededRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;