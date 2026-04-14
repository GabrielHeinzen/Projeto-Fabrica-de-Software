import {FaUser, FaLock} from 'react-icons/fa';
import { useState } from 'react';
import './Login.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (event) => {
    event.preventDefault();

    alert(`Usuario: ${username}\nPassword: ${password}`);
  };

  return (
    <div className="container">
        <form onSubmit={handleSubmit}>
            <h1>Bem Vindo!</h1>
            <p>Acesse o sistema: </p>
            <br />
            <div className="input-field">
                <FaUser className='icon' />
                <input type="email" placeholder="Email" 
                onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="input-field">
                <FaLock className='icon' />
                <input type="password" placeholder="Senha"
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="recall-forget">
                <label>
                    <input type="checkbox" /> 
                    Lembre de mim
                </label>
                <a href="#">Esqueceu a senha?</a>
            </div>
            <button type="submit">Entrar</button>
            <div className="register">
                <p>Não tem uma conta? <a href="#">Cadastre-se</a></p>
            </div>
        </form>
    </div>
  );
}

export default Login;