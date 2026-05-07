import './App.css'
import { useState } from 'react';
import CadastroEmpresa from './Components/CadastroEmpresa/CadastroEmpresa';
import Login from './Components/Login/Login';

function App() {
  const [authUser, setAuthUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
  };

  return (
    <div className={`app-root ${authUser ? 'app-root--authed' : 'app-root--login'}`}>
      {authUser ? (
        <CadastroEmpresa userName={authUser.name} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App
