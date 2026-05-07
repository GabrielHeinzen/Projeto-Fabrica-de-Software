import { useState } from 'react';
import { FaEnvelope, FaLock, FaPhone, FaUser } from 'react-icons/fa';
import '../Login/Login.css';

const initialForm = {
  nome: '',
  email: '',
  senha: '',
  telefone: ''
};

function Register({ onShowLogin }) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setIsSubmitting(true);

    try {
      const resposta = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.sucesso) {
        alert('Cadastro realizado com sucesso');
        setFormData(initialForm);
        if (onShowLogin) {
          onShowLogin();
        }
      } else {
        alert(dados.mensagem || 'Erro ao cadastrar');
      }
    } catch (erro) {
      console.log(erro);
      alert('Erro ao conectar com backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Crie sua conta</h1>
        <br />
        <h6>Cadastre-se como contador:</h6>

        <div className="input-field">
          <FaUser className="icon" />
          <input
            type="text"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange('nome')}
            required
          />
        </div>

        <div className="input-field">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
        </div>

        <div className="input-field">
          <FaPhone className="icon" />
          <input
            type="tel"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange('telefone')}
          />
        </div>

        <div className="input-field">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange('senha')}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <div className="register">
          <p>
            Ja tem uma conta?{' '}
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (onShowLogin) {
                  onShowLogin();
                }
              }}
            >
              Entrar
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Register;
