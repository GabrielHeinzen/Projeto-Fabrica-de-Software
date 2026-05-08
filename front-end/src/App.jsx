import './App.css'
import { useState } from 'react';
import CadastroEmpresa from './Components/CadastroEmpresa/CadastroEmpresa';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authView, setAuthView] = useState('login');

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
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

  return (
    <div className={`app-root ${authUser ? 'app-root--authed' : 'app-root--login'}`}>
      {authUser ? (
        <CadastroEmpresa userName={authUser.name} onLogout={handleLogout} />
      ) : authView === 'register' ? (
        <Register onShowLogin={handleShowLogin} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} onShowRegister={handleShowRegister} />
      )}
    </div>
  );
}

export default App
