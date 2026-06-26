import { useState, useEffect } from 'react';
import { useToast } from '../Toast/ToastProvider';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './AnexoDocumentos.css';

function AnexoDocumentos({ userName = 'Usuario', onLogout, onNavigate }) {
    const { showToast } = useToast();

    const [documentos, setDocumentos] = useState([]);        // tipos de documentos cadastrados
    const [empresas, setEmpresas] = useState([]);             // lista de empresas disponíveis
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null); // empresa ativa no momento
    const [isLoading, setIsLoading] = useState(true);

    const [arquivosSelecionados, setArquivosSelecionados] = useState({}); // { idDocumento: File }
    const [documentosEnviados, setDocumentosEnviados] = useState({});     // { idDocumento: true }

    // Competência padrão: mês atual no formato YYYY-MM
    const [competencia, setCompetencia] = useState(
        new Date().toISOString().slice(0, 7)
    );

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Busca todas as empresas cadastradas no sistema
    const carregarEmpresas = async () => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/empresa`);
            if (!resposta.ok) throw new Error('Erro ao buscar empresas');
            const dados = await resposta.json();
            setEmpresas(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            console.log(erro);
        } finally {
            setIsLoading(false);
        }
    };

    // Busca os tipos de documentos exigidos (requer autenticação)
    const carregarDocumentos = async () => {
        const authUser = JSON.parse(localStorage.getItem('authUser'));
        const token = authUser?.token;
        if (!token) return;

        try {
            const resposta = await fetch(`${apiBaseUrl}/documentos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resposta.ok) throw new Error('Erro ao buscar documentos');

            const dados = await resposta.json();

            // Normaliza os campos para o padrão usado no componente
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

    // Verifica quais documentos já foram enviados para uma empresa em uma competência
    const carregarStatusDocumentos = async (idCliente, competenciaSelecionada = competencia) => {
        try {
            const resposta = await fetch(
                `${apiBaseUrl}/empresa/${idCliente}/documentos/status?competencia=${competenciaSelecionada}`
            );
            if (!resposta.ok) throw new Error('Erro ao buscar status dos documentos');

            const dados = await resposta.json();

            // Monta um mapa { idDocumento: true } apenas para os já enviados
            const enviados = {};
            dados.forEach((item) => {
                if (item.status === 'ENVIADO') {
                    enviados[item.id_tipo_documento] = true;
                }
            });

            setDocumentosEnviados(enviados);
        } catch (erro) {
            console.log(erro);
        }
    };

    // Carrega empresas e tipos de documentos ao montar o componente
    useEffect(() => {
        carregarEmpresas();
        carregarDocumentos();
    }, []);

    // Envia todos os arquivos selecionados para a empresa ativa
    const enviarDocumentos = async () => {
        const idsComArquivo = Object.keys(arquivosSelecionados);

        if (idsComArquivo.length === 0) {
            showToast('Anexe pelo menos um documento antes de enviar.', 'error', { title: 'Erro' });
            return;
        }

        try {
            const enviados = {};

            // Envia cada arquivo individualmente via multipart/form-data
            for (const idDocumento of idsComArquivo) {
                const arquivo = arquivosSelecionados[idDocumento];
                const formData = new FormData();
                formData.append('documento', arquivo);
                formData.append('id_tipo_documento', idDocumento);

                const resposta = await fetch(
                    `${apiBaseUrl}/empresa/${empresaSelecionada.id_cliente}/documentos`,
                    { method: 'POST', body: formData }
                );

                if (!resposta.ok) throw new Error('Erro ao enviar documento');
                enviados[idDocumento] = true;
            }

            // Marca os documentos recém-enviados sem sobrescrever os anteriores
            setDocumentosEnviados((prev) => ({ ...prev, ...enviados }));
            showToast('Documentos enviados com sucesso!', 'success', { title: 'Sucesso' });

        } catch (erro) {
            console.error(erro);
            showToast('Erro ao enviar documentos.', 'error', { title: 'Erro' });
        }
    };

    // Calcula a data limite real baseando-se no dia do documento + mês/ano da competência
    const formatarDataPorCompetencia = (dataLimite) => {
        if (!dataLimite || !competencia) return '';
        const dia = new Date(dataLimite).getDate();
        const [ano, mes] = competencia.split('-');
        const data = new Date(Number(ano), Number(mes) - 1, dia);
        return data.toLocaleDateString('pt-BR');
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
                    <button type="button" className="empresa-nav-item">Dashboard</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('empresas')}>Minhas Empresas</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('cadastro')}>Cadastro Empresa</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('usuarios')}>Usuários</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('documentos')}>Documentos</button>
                    <button type="button" className="empresa-nav-item is-active" onClick={() => onNavigate && onNavigate('anexo')}>Anexo de Documentos</button>
                    <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('recebidos')}>Documentos Recebidos</button>
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
                        <h1>Anexo de Documentos</h1>
                        <p>Selecione uma empresa e envie os documentos necessários.</p>
                    </div>
                    <div className="empresa-hero-badge">
                        <span>Empresas</span>
                        <strong>{empresas.length}</strong>
                    </div>
                </section>

                <div className="empresa-grid">
                    {/* Painel esquerdo: lista de empresas para seleção */}
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
                                        onClick={() => {
                                            setEmpresaSelecionada(empresa);
                                            // Ao selecionar, carrega o status dos documentos da competência atual
                                            carregarStatusDocumentos(empresa.id_cliente, competencia);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            // Destaca visualmente a empresa selecionada
                                            border: empresaSelecionada?.id_cliente === empresa.id_cliente
                                                ? '2px solid #0f766e'
                                                : ''
                                        }}
                                    >
                                        <div>
                                            <strong>{empresa.razao_social}</strong>
                                            <span>{empresa.cnpj}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Painel direito: documentos exigidos e upload */}
                    <section className="empresa-card">
                        <div className="empresa-card-header">
                            <h2>Documentos Necessários</h2>
                        </div>

                        {/* Filtro de competência — recarrega o status ao mudar */}
                        <div style={{ marginBottom: '12px' }}>
                            <label>
                                Competência:{' '}
                                <input
                                    type="month"
                                    value={competencia}
                                    onChange={(e) => {
                                        const novaCompetencia = e.target.value;
                                        setCompetencia(novaCompetencia);
                                        setArquivosSelecionados({}); // limpa seleções ao trocar mês
                                        if (empresaSelecionada) {
                                            carregarStatusDocumentos(empresaSelecionada.id_cliente, novaCompetencia);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        {!empresaSelecionada ? (
                            <p>Selecione uma empresa para anexar documentos.</p>
                        ) : (
                            <>
                                <p>Empresa selecionada: <strong> {empresaSelecionada.razao_social}</strong></p>

                                <ul className="empresa-doc-list">
                                    {documentos.map((doc) => (
                                        <li key={doc.id}>
                                            <div>
                                                <strong>{doc.nome}</strong>
                                                <span>Data limite: {formatarDataPorCompetencia(doc.validade)}</span>
                                            </div>

                                            <div className="empresa-doc-actions">
                                                {/* Botão de upload — o input fica oculto e o label o aciona */}
                                                <label className="empresa-upload-button">
                                                    +
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*,.pdf"
                                                        onChange={(e) => {
                                                            const arquivo = e.target.files[0];
                                                            if (!arquivo) return;
                                                            // Associa o arquivo ao id do documento
                                                            setArquivosSelecionados((prev) => ({
                                                                ...prev,
                                                                [doc.id]: arquivo
                                                            }));
                                                        }}
                                                    />
                                                </label>

                                                {/* Exibe o nome do arquivo selecionado */}
                                                {arquivosSelecionados[doc.id] && (
                                                    <span>{arquivosSelecionados[doc.id].name}</span>
                                                )}

                                                {/* Status: Enviado → Anexado → Pendente */}
                                                <span className="empresa-status">
                                                    {documentosEnviados[doc.id]
                                                        ? 'Enviado'
                                                        : arquivosSelecionados[doc.id]
                                                            ? 'Anexado'
                                                            : 'Pendente'}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="empresa-actions" style={{ marginTop: '20px' }}>
                                    <button type="button" className="empresa-primary" onClick={enviarDocumentos}>
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