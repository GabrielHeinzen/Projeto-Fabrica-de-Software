import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import './Login.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const resposta = await fetch('https://fantastic-journey-x5r4qjjw4rvv3v4r4-3001.app.github.dev/login', {
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
      alert("Bem-vindo " + dados.usuario);
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

        <div className="recall-forget">
          <label>
            <input type="checkbox" />
            Lembre de mim
          </label>

          <a href="#">Esqueceu a senha?</a>
        </div>

        <button type="submit">Entrar</button>

        <div className="register">
          <p>
            Não tem uma conta? <a href="./register">Cadastre-se</a>
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