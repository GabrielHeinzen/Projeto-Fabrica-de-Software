import './App.css'
import { useState } from 'react';
import CadastroEmpresa from './Components/CadastroEmpresa/CadastroEmpresa';
import MinhasEmpresas from './Components/MinhasEmpresas/MinhasEmpresas';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [authedView, setAuthedView] = useState('cadastro');

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setAuthedView('cadastro');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthView('login');
  };

  const handleShowRegister = () => {
    setAuthView('register');
  };

  const handleShowLogin = () => {
    setAuthView('login');
  };

  const handleNavigate = (view) => {
    setAuthedView(view);
  };

  return (
    <div className={`app-root ${authUser ? 'app-root--authed' : 'app-root--login'}`}>
      {authUser ? (
        authedView === 'empresas' ? (
          <MinhasEmpresas
            userName={authUser.name}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        ) : (
          <CadastroEmpresa
            userName={authUser.name}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )
      ) : authView === 'register' ? (
        <Register onShowLogin={handleShowLogin} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} onShowRegister={handleShowRegister} />
      )}
    </div>
  );
}

export default App
