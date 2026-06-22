import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../Toast/ToastProvider';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './DocumentosRecebidos.css';

const getApiBaseUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const formatarData = (dataStr) => {
    if (!dataStr) return '—';
    const data = new Date(`${dataStr.slice(0, 10)}T12:00:00`);
    return data.toLocaleDateString('pt-BR');
};

function DocumentosRecebidos({ userName = 'Usuario', onLogout, onNavigate }) {
    const { showToast } = useToast();
    const [documentos, setDocumentos] = useState([]);

    const carregarDocumentos = useCallback(async () => {
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const token = authUser?.token;
        if (!token) return;

        try {
            const apiBaseUrl = getApiBaseUrl();
            const resposta = await fetch(`${apiBaseUrl}/documentos-enviados`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const dados = await resposta.json().catch(() => []);
            if (!resposta.ok) { console.error('Erro ao buscar documentos:', dados); return; }

            const documentosFormatados = Array.isArray(dados) ? dados.map((doc) => ({
                id: doc.id_envio,
                empresa: doc.razao_social,
                documento: doc.documento,
                arquivo: doc.nome_arquivo,
                url: doc.url_arquivo,
                data: doc.data_envio

            })) : [];

            setDocumentos(documentosFormatados);
        } catch (erro) {
            console.error('Erro ao conectar para buscar documentos:', erro);
        }
    }, []);

    useEffect(() => { carregarDocumentos(); }, [carregarDocumentos]);

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
                    <button type="button" className="empresa-nav-item">Dashboard</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('empresas')}>Minhas Empresas</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('cadastro')}>Cadastro Empresa</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('usuarios')}>Usuários</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('documentos')}>Documentos</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('anexo')}>Anexo de Documentos</button>
                    <button type="button" className="empresa-nav-item is-active" onClick={() => onNavigate && onNavigate('recebidos')}>Documentos Recebidos
                    </button>
                </nav>
            </aside>

            <div className="empresa-content">
                <header className="empresa-topbar">
                    <div className="empresa-breadcrumb"></div>
                    <div className="empresa-user">
                        <span className="empresa-user-name">{userName}</span>
                        {onLogout && (
                            <button type="button" className="empresa-logout" onClick={onLogout}>Sair</button>
                        )}
                    </div>
                </header>

                <section className="empresa-hero">
                    <div>
                        <span className="empresa-kicker">Gestão de documentos</span>
                        <h1>Documentos recebidos</h1>
                        <p>Visualize todos os arquivos enviados pelas empresas.</p>
                    </div>
                    <div className="empresa-hero-badge">
                        <span>Total cadastrados</span>
                        <strong>{documentos.length}</strong>
                    </div>
                </section>

                <div className="empresa-grid">
                    <section className="empresa-card">
                        <div className="empresa-card-header">
                            <h2>Documentos Cadastrados</h2>
                            <span className="empresa-badge">{documentos.length} ativos</span>
                        </div>

                        <ul className="empresa-doc-list">
                            {documentos.map((doc) => (
                                <li key={doc.id}>
                                    <div>
                                        <strong>{doc.nome}</strong>
                                        <span>Data limite: {formatarData(doc.validade)}</span>
                                    </div>
                                    <div className="empresa-doc-actions">
                                        <span className="empresa-status">Ativo</span>
                                        <a
                                            href={`${getApiBaseUrl()}${doc.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="empresa-primary"
                                        >
                                            Visualizar
                                        </a>
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

export default DocumentosRecebidos;