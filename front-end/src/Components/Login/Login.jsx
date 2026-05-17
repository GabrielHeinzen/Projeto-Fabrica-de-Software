import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import './Login.css';

function Login({ onLoginSuccess, onShowRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://legendary-robot-r7gpx4qxw6hx6r7-3001.app.github.dev';

    try {
      const resposta = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: username,
          senha: password
        })
      });

      console.log(resposta);

      const dados = await resposta.json();

      console.log(dados);

      if (dados.sucesso) {
        const nomeUsuario = dados.usuario || username;
        if (onLoginSuccess) {
          onLoginSuccess({ name: nomeUsuario, email: username });
        }
      } else {
        alert(dados.mensagem);
      }

    } catch (erro) {
      console.log(erro);
      alert("Erro ao conectar com backend");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Bem Vindo!</h1>
        <br />
        <h6>Acesse o sistema:</h6>

        <div className="input-field">
          <FaUser className="icon" />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-field">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>


        <button type="submit">Entrar</button>

        <div className="register">
          <p>
            Nao tem uma conta?{' '}
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (onShowRegister) {
                  onShowRegister();
                }
              }}
            >
              Cadastre-se
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;

//for file in database/*.sql; do
  //docker exec -i mysql_contabil mysql -u root -proot sistema_cont < "$file"
//done