import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import LoginNeededRoute from './components/LoginNeededRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<LoginNeededRoute><Home /></LoginNeededRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;