import AppRoutes from './routes/AppRoutes';
import { ApiProvider } from './contexts/ApiContext';
import './App.css';

function App() {
  return (
    <ApiProvider>
      <AppRoutes />
    </ApiProvider>
  );
}

export default App;