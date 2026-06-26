import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import { useToast } from '../Toast/ToastProvider';
import './Login.css';

  // Estados para os campos do formulário
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
     // Evita o recarregamento da página ao enviar o formulário
    event.preventDefault();

     // Usa a variável de ambiente ou cai no endereço local como fallback
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      // Envia as credenciais para a API de login
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
        // Monta o objeto do usuário logado com nome, email e token JWT
        const nomeUsuario = dados.usuario || username;

        const usuarioLogado = {
          name: nomeUsuario,
          email: username,
          token: dados.token
        };
         // Persiste a sessão no localStorage para uso em outras telas
        localStorage.setItem(
          'authUser',
          JSON.stringify(usuarioLogado)
        );

        // Notifica o componente pai sobre o login bem-sucedido
        if (onLoginSuccess) {
          onLoginSuccess(usuarioLogado);
        }

      } else {
         // Exibe a mensagem de erro retornada pela API
        showToast(dados.mensagem || 'Falha no login', 'error', {
          title: 'Erro'
        });
      }

    } catch (erro) {
      // Erro de rede ou servidor indisponível
      console.log(erro);
      showToast('Erro ao conectar com backend', 'error', {
        title: 'Erro'
      });
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Bem Vindo!</h1>
        <br />
        <h6>Acesse o sistema:</h6>

        {/* Campo de e-mail com ícone */}
        <div className="input-field">
          <FaUser className="icon" />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Campo de senha com ícone */}
        <div className="input-field">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>


        <button type="submit">Entrar</button>

      </form>
    </div>
  );
}

export default Login;

//for file in database/*.sql; do
//docker exec -i mysql_contabil mysql -u root -proot sistema_cont < "$file"
//done