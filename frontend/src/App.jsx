import { Navigate, Route, Routes } from 'react-router';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './pages/Dashboard/Dashboard';
import IncidentForm from './pages/IncidentForm/IncidentForm';
import TicketList from './pages/TicketList/TicketList';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Navigation />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/registrar-incidente"
            element={<IncidentForm />}
          />

          <Route
            path="/tickets"
            element={<TicketList />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;