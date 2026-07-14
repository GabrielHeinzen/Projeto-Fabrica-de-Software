import './App.css'
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './Components/Toast/ToastProvider';
import MinhasEmpresas from './Components/MinhasEmpresas/MinhasEmpresas';
import Usuarios from './Components/Usuarios/Usuarios';
import Login from './Components/Login/Login';
import Documentos from './Components/Documentos/Documentos';
import AnexoDocumentos from './Components/AnexoDocumentos/AnexoDocumentos';
import Dashboard from './Components/Dashboard/Dashboard_1';
import DocumentosRecebidos from './Components/DocumentosRecebidos/DocumentosRecebidos'

const loadStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem('authUser');

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch (err) {
    console.log(err);
    return null;
  }
};

function RequireAuth({ authed, children }) {
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  const [authUser, setAuthUser] = useState(loadStoredUser);
  const navigate = useNavigate();
  const isAuthed = Boolean(authUser);

  const routeMap = {
    empresas: '/Minhas-Empresas',
    usuarios: '/Usuarios',
    documentos: '/Documentos',
    anexo: '/AnexoDocumentos',
    dashboard: '/Dashboard',
    recebidos: '/DocumentosRecebidos',
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    window.localStorage.setItem('authUser', JSON.stringify(user));
    navigate('/Dashboard', { replace: true });
  };

  const handleLogout = () => {
    setAuthUser(null);
    window.localStorage.removeItem('authUser');
    navigate('/Login', { replace: true });
  };

  const handleNavigate = (view) => {
    const target = routeMap[view];
    if (target) {
      navigate(target);
    }
  };

  return (
    <ToastProvider>
      <div className={`app-root ${isAuthed ? 'app-root--authed' : 'app-root--login'}`}>
        <Routes>
          <Route
            path="/"
            element={(
              <Navigate
                to={isAuthed ? '/Dashboard' : '/Login'}
                replace
              />
            )}
          />
          <Route
            path="/Login"
            element={(
              isAuthed ? (
                <Navigate to="/Dashboard" replace />
              ) : (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                />
              )
            )}
          />
          <Route
            path="/Dashboard"
            element={(
              <RequireAuth authed={isAuthed}>
                <Dashboard
                  userName={authUser?.name}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </RequireAuth>
            )}
          />
          <Route
            path="/Minhas-Empresas"
            element={(
              <RequireAuth authed={isAuthed}>
                <MinhasEmpresas
                  userName={authUser?.name}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </RequireAuth>
            )}
          />
          <Route
            path="/Usuarios"
            element={(
              <RequireAuth authed={isAuthed}>
                <Usuarios
                  userName={authUser?.name}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </RequireAuth>
            )}
          />
          <Route
            path="/Documentos"
            element={(
              <RequireAuth authed={isAuthed}>
                <Documentos
                  userName={authUser?.name}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </RequireAuth>
            )}
          />
          <Route
            path="/AnexoDocumentos"
            element={(
              <RequireAuth authed={isAuthed}>
                <AnexoDocumentos
                  userName={authUser?.name}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </RequireAuth>
            )}
          />
          <Route
            path="/DocumentosRecebidos"
            element={(
              <RequireAuth authed={isAuthed}>
                <DocumentosRecebidos
                  userName={authUser?.name}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </RequireAuth>
            )}
          />
          <Route
            path="*"
            element={(
              <Navigate
                to={isAuthed ? '/Dashboard' : '/Login'}
                replace
              />
            )}
          />

        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App
