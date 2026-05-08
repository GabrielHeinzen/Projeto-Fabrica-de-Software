import { useState } from 'react';
import './CadastroEmpresa.css';

const initialForm = {
  razaoSocial: '',
  cnpj: '',
  regimeTributario: '',
  possuiFuncionarios: '',
  possuiNotasVenda: '',
  prestaServicos: ''
};

function CadastroEmpresa({ userName = 'Usuario', onLogout }) {
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
      const resposta = await fetch(`${apiBaseUrl}/empresa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cnpj: formData.cnpj,
          razao_social: formData.razaoSocial,
          regime_tributario: formData.regimeTributario,
          possui_funcionarios: formData.possuiFuncionarios === 'sim',
          possui_notas_venda: formData.possuiNotasVenda === 'sim',
          presta_servicos: formData.prestaServicos === 'sim'
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.sucesso) {
        alert('Empresa cadastrada com sucesso.');
        setFormData(initialForm);
      } else {
        alert(dados.mensagem || 'Erro ao cadastrar empresa');
      }
    } catch (erro) {
      console.log(erro);
      alert('Erro ao conectar com backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="empresa-page">
      <aside className="empresa-sidebar">
        <div className="empresa-brand">
          <div className="empresa-logo">ME</div>
          <div>
            <strong>MinhaEmpresa</strong>
            <span>Portal Contabil</span>
          </div>
        </div>

        <nav className="empresa-nav">
          <button type="button" className="empresa-nav-item">Dashboard</button>
          <button type="button" className="empresa-nav-item">Minha Empresa</button>
          <button type="button" className="empresa-nav-item is-active">Cadastrar Empresa</button>
          <button type="button" className="empresa-nav-item">Usuarios</button>
          <button type="button" className="empresa-nav-item">Documentos</button>
          <button type="button" className="empresa-nav-item">Solicitacoes</button>
          <button type="button" className="empresa-nav-item">Financeiro</button>
          <button type="button" className="empresa-nav-item">Suporte</button>
          <button type="button" className="empresa-nav-item">Configuracoes</button>
        </nav>

        <div className="empresa-support">
          <p>Precisa de ajuda?</p>
          <span>Nossa equipe esta pronta para te atender.</span>
          <button type="button" className="empresa-support-button">Falar com suporte</button>
        </div>
      </aside>

      <div className="empresa-content">
        <header className="empresa-topbar">
          <div className="empresa-breadcrumb">Minha Empresa / Cadastrar Empresa</div>
          <div className="empresa-user">
            <span className="empresa-user-name">{userName}</span>
            {onLogout && (
              <button type="button" className="empresa-logout" onClick={onLogout}>
                Sair
              </button>
            )}
          </div>
        </header>

        <section className="empresa-hero">
          <div>
            <p className="empresa-kicker">Minha Empresa</p>
            <h1>Cadastrar Empresa</h1>
            <p>Preencha os dados da sua empresa e envie os documentos necessarios para analise.</p>
          </div>
          <div className="empresa-hero-badge">
            <span>Cadastro</span>
            <strong>Em andamento</strong>
          </div>
        </section>

        <div className="empresa-grid">
          <form className="empresa-card empresa-card--form" onSubmit={handleSubmit}>
            <div className="empresa-card-header">
              <h2>Dados da Empresa</h2>
              <span className="empresa-badge">Obrigatorio</span>
            </div>

            <label className="empresa-field">
              <span>Razao Social *</span>
              <input
                id="razao-social"
                type="text"
                placeholder="Digite a razao social da empresa"
                value={formData.razaoSocial}
                onChange={handleChange('razaoSocial')}
                required
              />
            </label>

            <label className="empresa-field">
              <span>CNPJ *</span>
              <input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={handleChange('cnpj')}
                maxLength={18}
                required
              />
            </label>

            <label className="empresa-field">
              <span>Regime Tributario *</span>
              <select
                id="regime-tributario"
                value={formData.regimeTributario}
                onChange={handleChange('regimeTributario')}
                required
              >
                <option value="" disabled>
                  Selecione o regime
                </option>
                <option value="simples">Simples Nacional</option>
                <option value="presumido">Lucro Presumido</option>
                <option value="real">Lucro Real</option>
                <option value="mei">MEI</option>
              </select>
            </label>

            <div className="empresa-toggle-group">
              <span>Possui funcionarios? *</span>
              <div className="empresa-toggle-options">
                <label
                  className={`empresa-toggle-option ${
                    formData.possuiFuncionarios === 'sim' ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="possuiFuncionarios"
                    value="sim"
                    checked={formData.possuiFuncionarios === 'sim'}
                    onChange={handleChange('possuiFuncionarios')}
                    required
                  />
                  Sim
                </label>
                <label
                  className={`empresa-toggle-option ${
                    formData.possuiFuncionarios === 'nao' ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="possuiFuncionarios"
                    value="nao"
                    checked={formData.possuiFuncionarios === 'nao'}
                    onChange={handleChange('possuiFuncionarios')}
                  />
                  Nao
                </label>
              </div>
            </div>

            <div className="empresa-toggle-group">
              <span>Possui notas de vendas? *</span>
              <div className="empresa-toggle-options">
                <label
                  className={`empresa-toggle-option ${
                    formData.possuiNotasVenda === 'sim' ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="possuiNotasVenda"
                    value="sim"
                    checked={formData.possuiNotasVenda === 'sim'}
                    onChange={handleChange('possuiNotasVenda')}
                    required
                  />
                  Sim
                </label>
                <label
                  className={`empresa-toggle-option ${
                    formData.possuiNotasVenda === 'nao' ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="possuiNotasVenda"
                    value="nao"
                    checked={formData.possuiNotasVenda === 'nao'}
                    onChange={handleChange('possuiNotasVenda')}
                  />
                  Nao
                </label>
              </div>
            </div>

            <div className="empresa-toggle-group">
              <span>Presta servicos? *</span>
              <div className="empresa-toggle-options">
                <label
                  className={`empresa-toggle-option ${
                    formData.prestaServicos === 'sim' ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="prestaServicos"
                    value="sim"
                    checked={formData.prestaServicos === 'sim'}
                    onChange={handleChange('prestaServicos')}
                    required
                  />
                  Sim
                </label>
                <label
                  className={`empresa-toggle-option ${
                    formData.prestaServicos === 'nao' ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="prestaServicos"
                    value="nao"
                    checked={formData.prestaServicos === 'nao'}
                    onChange={handleChange('prestaServicos')}
                  />
                  Nao
                </label>
              </div>
            </div>

            <div className="empresa-note">
              Certifique-se de que o CNPJ informado esta correto. Nao utilizamos esses dados para consulta de credito.
            </div>

            <div className="empresa-actions">
              <button type="submit" className="empresa-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
              </button>
              <button type="button" className="empresa-secondary">Cancelar</button>
            </div>
          </form>

          <section className="empresa-card empresa-card--docs">
            <h2>Documentos Necessarios</h2>
            <p>Envie os documentos abaixo para validarmos sua empresa.</p>
            <ul className="empresa-doc-list">
              <li>
                <div>
                  <strong>Contrato Social ou Estatuto Social</strong>
                  <span>PDF ou JPG - ate 10MB</span>
                </div>
                <span className="empresa-status">Pendente</span>
              </li>
              <li>
                <div>
                  <strong>Comprovante de Inscricao e Situacao Cadastral (CNPJ)</strong>
                  <span>PDF ou JPG - ate 10MB</span>
                </div>
                <span className="empresa-status">Pendente</span>
              </li>
              <li>
                <div>
                  <strong>Documento de Identificacao do(s) Socio(s)</strong>
                  <span>PDF ou JPG - ate 10MB</span>
                </div>
                <span className="empresa-status">Pendente</span>
              </li>
              <li>
                <div>
                  <strong>Comprovante de Endereco</strong>
                  <span>PDF ou JPG - ate 10MB</span>
                </div>
                <span className="empresa-status">Pendente</span>
              </li>
              <li>
                <div>
                  <strong>Ultimo Balanco ou Demonstracao Contabil</strong>
                  <span>PDF ou JPG - ate 10MB</span>
                </div>
                <span className="empresa-status">Pendente</span>
              </li>
            </ul>
            <div className="empresa-doc-footer">
              Seus documentos estao seguros e serao usados apenas para validacao cadastral.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CadastroEmpresa;
