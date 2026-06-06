import './App.css'
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './Components/Toast/ToastProvider';
import CadastroEmpresa from './Components/CadastroEmpresa/CadastroEmpresa';
import MinhasEmpresas from './Components/MinhasEmpresas/MinhasEmpresas';
import Usuarios from './Components/Usuarios/Usuarios';
import Login from './Components/Login/Login';
import Documentos from './Components/Documentos/Documentos';
import AnexoDocumentos from './Components/AnexoDocumentos/AnexoDocumentos';

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
    cadastro: '/Cadastro-de-Empresa',
    empresas: '/Minhas-Empresas',
    usuarios: '/Usuarios',
    documentos: '/Documentos',
    anexo: '/AnexoDocumentos'
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    window.localStorage.setItem('authUser', JSON.stringify(user));
    navigate('/Cadastro-de-Empresa', { replace: true });
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
                to={isAuthed ? '/Cadastro-de-Empresa' : '/Login'}
                replace
              />
            )}
          />
          <Route
            path="/Login"
            element={(
              isAuthed ? (
                <Navigate to="/Cadastro-de-Empresa" replace />
              ) : (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                />
              )
            )}
          />
          <Route
            path="/Cadastro-de-Empresa"
            element={(
              <RequireAuth authed={isAuthed}>
                <CadastroEmpresa
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
            path="*"
            element={(
              <Navigate
                to={isAuthed ? '/Cadastro-de-Empresa' : '/Login'}
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
