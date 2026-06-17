import { useState, useEffect } from 'react';
import { useToast } from '../Toast/ToastProvider';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './AnexoDocumentos.css';

function AnexoDocumentos({ userName = 'Usuario', onLogout, onNavigate }) {
    const [documentos, setDocumentos] = useState([]);

    const [empresas, setEmpresas] = useState([]);
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const apiBaseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const carregarEmpresas = async () => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/empresa`);

            if (!resposta.ok) {
                throw new Error('Erro ao buscar empresas');
            }

            const dados = await resposta.json();

            setEmpresas(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            console.log(erro);
        } finally {
            setIsLoading(false);
        }
    };

    const carregarDocumentos = async () => {
        const authUser = JSON.parse(localStorage.getItem('authUser'));
        const token = authUser?.token;

        if (!token) {
            return;
        }

        try {
            const resposta = await fetch(`${apiBaseUrl}/documentos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resposta.ok) {
                throw new Error('Erro ao buscar documentos');
            }

            const dados = await resposta.json();

            const documentosFormatados = dados.map((doc) => ({
                id: doc.id,
                nome: doc.nome,
                validade: doc.dia_limite_envio,
                periodicidade: doc.periodicidade
            }));

            setDocumentos(documentosFormatados);

        } catch (erro) {
            console.log(erro);
        }
    };

    useEffect(() => {
        carregarEmpresas();
        carregarDocumentos();
    }, []);

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
                        className="empresa-nav-item"
                        onClick={() => onNavigate && onNavigate('documentos')}
                    >
                        Documentos
                    </button>
                    <button
                        type="button"
                        className="empresa-nav-item is-active"
                        onClick={() => onNavigate && onNavigate('anexo')}
                    >
                        Anexo de Documentos
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

                        <h1>Anexo de Documentos</h1>

                        <p>
                            Selecione uma empresa e envie os documentos necessários.
                        </p>
                    </div>

                    <div className="empresa-hero-badge">
                        <span>Empresas</span>
                        <strong>{empresas.length}</strong>
                    </div>
                </section>

                <div className="empresa-grid">

                    <section className="empresa-card">
                        <div className="empresa-card-header">
                            <h2>Empresas Cadastradas</h2>
                        </div>

                        {isLoading ? (
                            <p>Carregando empresas...</p>
                        ) : (
                            <ul className="empresa-doc-list">

                                {empresas.map((empresa) => (
                                    <li
                                        key={empresa.id_cliente}
                                        onClick={() => setEmpresaSelecionada(empresa)}
                                        style={{
                                            cursor: 'pointer',
                                            border:
                                                empresaSelecionada?.id_cliente === empresa.id_cliente
                                                    ? '2px solid #0f766e'
                                                    : ''
                                        }}
                                    >
                                        <div>
                                            <strong>
                                                {empresa.razao_social}
                                            </strong>

                                            <span>
                                                {empresa.cnpj}
                                            </span>
                                        </div>
                                    </li>
                                ))}

                            </ul>
                        )}
                    </section>

                    <section className="empresa-card">

                        <div className="empresa-card-header">
                            <h2>Documentos Necessários</h2>
                        </div>


                        {!empresaSelecionada ? (
                            <p>
                                Selecione uma empresa para anexar documentos.
                            </p>
                        ) : (
                            <>
                                <p>
                                    Empresa selecionada:
                                    <strong>
                                        {' '}
                                        {empresaSelecionada.razao_social}
                                    </strong>
                                </p>

                                <ul className="empresa-doc-list">
                                    {documentos.map((doc) => (
                                        <li key={doc.id}>
                                            <div>
                                                <strong>{doc.nome}</strong>

                                                <span>
                                                    Data limite:
                                                    {' '}
                                                    Dia limite: {doc.validade}
                                                </span>
                                            </div>

                                            <div className="empresa-doc-actions">
                                                <label className="empresa-upload-button">
                                                    +

                                                    <input
                                                        type="file"
                                                        hidden
                                                    />
                                                </label>

                                                <span className="empresa-status">
                                                    Pendente
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div
                                    className="empresa-actions"
                                    style={{ marginTop: '20px' }}
                                >
                                    <button
                                        type="button"
                                        className="empresa-primary"
                                    >
                                        Enviar Documentos
                                    </button>
                                </div>
                            </>
                        )}

                    </section>
                </div>
            </div>
        </div>
    );
}


export default AnexoDocumentos;