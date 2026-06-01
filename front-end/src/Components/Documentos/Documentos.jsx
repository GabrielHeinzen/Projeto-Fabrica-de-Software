import { useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './Documentos.css';

function Documentos({ userName = 'Usuario', onLogout, onNavigate }) {
  const [documentos] = useState([
    {
      id: 1,
      nome: 'Contrato Social',
      validade: '2026-12-12'
    },
    {
      id: 2,
      nome: 'Alvará de Funcionamento',
      validade: '2025-08-10'
    }
  ]);

  return (
    <div className="empresa-page">
      <aside className="empresa-sidebar">
        <div className="empresa-brand">
          <div className="empresa-logo">
            <img src={logoIcon} alt="C2R Contabilidade" />
          </div>

          <div>
            <strong>C2R Contabilidade</strong>
            <span>Portal Contábil</span>
          </div>
        </div>

        <nav className="empresa-nav">
          <button type="button" className="empresa-nav-item">
            Dashboard
          </button>

          <button
            type="button"
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('empresas')}
          >
            Minhas Empresas
          </button>

          <button
            type="button"
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('cadastro')}
          >
            Cadastro Empresa
          </button>

          <button
            type="button"
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('usuarios')}
          >
            Usuários
          </button>

          <button
            type="button"
            className="empresa-nav-item is-active"
            onClick={() => onNavigate && onNavigate('documentos')}
          >
            Documentos
          </button>
        </nav>
      </aside>

      <div className="empresa-content">
        <header className="empresa-topbar">
          <div className="empresa-breadcrumb"></div>

          <div className="empresa-user">
            <span className="empresa-user-name">
              {userName}
            </span>

            {onLogout && (
              <button
                type="button"
                className="empresa-logout"
                onClick={onLogout}
              >
                Sair
              </button>
            )}
          </div>
        </header>

        <section className="empresa-hero">
          <div>
            <span className="empresa-kicker">
              Gestão de documentos
            </span>

            <h1>Cadastro de Documentos</h1>

            <p>
              Gerencie os documentos utilizados no sistema.
            </p>
          </div>

          <div className="empresa-hero-badge">
            <span>Total cadastrados</span>
            <strong>{documentos.length}</strong>
          </div>
        </section>

        <div className="empresa-grid">
          <section className="empresa-card">
            <div className="empresa-card-header">
              <h2>Novo Documento</h2>
            </div>

            <label className="empresa-field">
              <span>Nome do documento</span>

              <input
                type="text"
                placeholder="Digite o nome do documento"
              />
            </label>

            <label className="empresa-field">
              <span>Validade</span>

              <input type="date" />
            </label>

            <div className="empresa-actions">
              <button
                type="button"
                className="empresa-primary"
              >
                Cadastrar Documento
              </button>
            </div>
          </section>

          <section className="empresa-card">
            <div className="empresa-card-header">
              <h2>Documentos Cadastrados</h2>

              <span className="empresa-badge">
                {documentos.length} ativos
              </span>
            </div>

            <ul className="empresa-doc-list">
              {documentos.map((doc) => (
                <li key={doc.id}>
                  <div>
                    <strong>{doc.nome}</strong>

                    <span>
                      Validade: {doc.validade}
                    </span>
                  </div>

                  <div className="empresa-doc-actions">
                    <span className="empresa-status">
                      Ativo
                    </span>

                    <button
                      type="button"
                      className="empresa-delete-button"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Documentos;