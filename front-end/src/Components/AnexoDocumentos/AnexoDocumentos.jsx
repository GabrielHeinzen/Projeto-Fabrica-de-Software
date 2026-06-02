import { useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './AnexoDocumentos.css';

function Documentos({ userName = 'Usuario', onLogout, onNavigate }) {
    const [documentos, setDocumentos] = useState([
        {
            id: 1,
            nome: 'Contrato Social ou Estatuto Social',
            validade: '2026-12-31'
        },
        {
            id: 2,
            nome: 'Comprovante de Inscricao e Situacao Cadastral (CNPJ)',
            validade: '2026-12-31'
        },
        {
            id: 3,
            nome: 'Documento de Identificacao do(s) Socio(s)',
            validade: '2026-12-31'
        },
        {
            id: 4,
            nome: 'Comprovante de Endereco',
            validade: '2026-12-31'
        },
        {
            id: 5,
            nome: 'Ultimo Balanco ou Demonstracao Contabil',
            validade: '2026-12-31'
        }
    ]);

    const [novoDocumento, setNovoDocumento] = useState('');
    const [novaValidade, setNovaValidade] = useState('');

    const cadastrarDocumento = () => {
        if (!novoDocumento.trim() || !novaValidade.trim()) {
            return;
        }

        const novo = {
            id: Date.now(),
            nome: novoDocumento,
            validade: novaValidade
        };

        setDocumentos((prev) => [...prev, novo]);

        setNovoDocumento('');
        setNovaValidade('');
    };

    const excluirDocumento = (id) => {
        setDocumentos((prev) =>
            prev.filter((doc) => doc.id !== id)
        );
    };

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
                                value={novoDocumento}
                                onChange={(e) => setNovoDocumento(e.target.value)}
                            />
                        </label>

                        <label className="empresa-field">
                            <span>Data limite</span>

                            <input
                                type="date"
                                value={novaValidade}
                                onChange={(e) => setNovaValidade(e.target.value)}
                            />
                        </label>

                        <div className="empresa-actions">
                            <button
                                type="button"
                                className="empresa-primary"
                                onClick={cadastrarDocumento}
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
                                            Data limite: {new Date(doc.validade).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>

                                    <div className="empresa-doc-actions">
                                        <span className="empresa-status">
                                            Ativo
                                        </span>

                                        <button
                                            type="button"
                                            className="empresa-delete-button"
                                            onClick={() => excluirDocumento(doc.id)}
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