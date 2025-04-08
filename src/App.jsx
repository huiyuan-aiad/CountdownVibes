import AppRoutes from './routes/AppRoutes';
import { ApiProvider } from './contexts/ApiContext';
import BottomNavBar from './components/BottomNavBar';
import './App.css';

function App() {
  return (
    <ApiProvider>
      <AppRoutes />
      <BottomNavBar />
    </ApiProvider>
  );
}

export default App;