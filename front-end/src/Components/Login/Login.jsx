import React from 'react';

const Login = () => {
  return (
    <div className="container">
        <form className="form">
            <h1>Acesse o sistema</h1>
            <div>
                <input type="usuario" placeholder="Usuário" />
            </div>
            <div>
                <input type="password" placeholder="Senha" />
            </div>
            <button type="submit">Entrar</button>
        </form>
    </div>
  );
}

export default Login;