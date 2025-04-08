import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CountdownDetail from '../pages/CountdownDetail';
import AddCountdown from '../pages/AddCountdown';
import EditCountdown from '../pages/EditCountdown';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import ForgotPassword from '../components/ForgotPassword';
import CalendarViewPage from '../pages/CalendarViewPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/countdown/:id" element={<CountdownDetail />} />
      <Route path="/add" element={<AddCountdown />} />
      <Route path="/edit/:id" element={<EditCountdown />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/calendar" element={<CalendarViewPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;