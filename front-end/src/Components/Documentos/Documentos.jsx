import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../Toast/ToastProvider';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './Documentos.css';

// Remove barra final da URL para evitar dupla barra nas requisições
const getApiBaseUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

// Formata datas fixando o horário em 12h para evitar problemas de fuso horário
const formatarData = (dataStr) => {
    if (!dataStr) return '—';
    const data = new Date(`${dataStr.slice(0, 10)}T12:00:00`);
    return data.toLocaleDateString('pt-BR');
};

function Documentos({ userName = 'Usuario', onLogout, onNavigate }) {
    const { showToast } = useToast();
    const [documentos, setDocumentos] = useState([]);

    // Campos do formulário de novo documento
    const [novoDocumento, setNovoDocumento] = useState('');
    const [novaValidade, setNovaValidade]   = useState('');
    const [periodicidade, setPeriodicidade] = useState('UNICO');

    // Controle do modal de exclusão
    const [documentoParaExcluir, setDocumentoParaExcluir] = useState(null);

    // Controle do modal de edição e seus campos
    const [documentoParaEditar, setDocumentoParaEditar] = useState(null);
    const [editNome, setEditNome]                       = useState('');
    const [editValidade, setEditValidade]               = useState('');
    const [editPeriodicidade, setEditPeriodicidade]     = useState('UNICO');
    const [salvandoEdicao, setSalvandoEdicao]           = useState(false);

    // useCallback evita recriar a função a cada render, estabilizando a dependência do useEffect
    const carregarDocumentos = useCallback(async () => {
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const token = authUser?.token;
        if (!token) return;

        try {
            const apiBaseUrl = getApiBaseUrl();
            const resposta = await fetch(`${apiBaseUrl}/documentos`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const dados = await resposta.json().catch(() => []);
            if (!resposta.ok) { console.error('Erro ao buscar documentos:', dados); return; }

            // Normaliza os campos para o padrão interno do componente
            const documentosFormatados = Array.isArray(dados) ? dados.map((doc) => ({
                id: doc.id,
                nome: doc.nome,
                validade: doc.dia_limite_envio,
                periodicidade: doc.periodicidade
            })) : [];

            setDocumentos(documentosFormatados);
        } catch (erro) {
            console.error('Erro ao conectar para buscar documentos:', erro);
        }
    }, []);

    useEffect(() => { carregarDocumentos(); }, [carregarDocumentos]);

    const cadastrarDocumento = async () => {
        if (!novoDocumento.trim() || !novaValidade.trim()) {
            showToast('Preencha os campos obrigatórios.', 'warning', { title: 'Atenção' });
            return;
        }

        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const token = authUser?.token;
        if (!token) { showToast('Usuário não autenticado', 'error', { title: 'Erro' }); return; }

        try {
            const apiBaseUrl = getApiBaseUrl();
            const resposta = await fetch(`${apiBaseUrl}/documentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nome: novoDocumento, data_limite: novaValidade, periodicidade })
            });

            const dados = await resposta.json().catch(() => ({}));

            if (resposta.ok && dados.sucesso !== false) {
                showToast('Documento cadastrado com sucesso.', 'success', { title: 'Sucesso' });
                // Limpa o formulário e recarrega a lista
                setNovoDocumento('');
                setNovaValidade('');
                setPeriodicidade('UNICO');
                carregarDocumentos();
            } else {
                showToast(dados.mensagem || 'Erro ao cadastrar documento', 'error', { title: 'Erro' });
            }
        } catch (erro) {
            console.error('Erro ao cadastrar documento:', erro);
            showToast('Erro ao conectar com servidor.', 'error', { title: 'Erro' });
        }
    };

    // Abre o modal de edição pré-preenchido com os dados atuais do documento
    const handleEditRequest = (doc) => {
        setDocumentoParaEditar(doc);
        setEditNome(doc.nome);
        setEditValidade(doc.validade ? doc.validade.slice(0, 10) : '');
        setEditPeriodicidade(doc.periodicidade);
    };

    // Fecha o modal e limpa os campos de edição
    const handleEditCancel = () => {
        setDocumentoParaEditar(null);
        setEditNome('');
        setEditValidade('');
        setEditPeriodicidade('UNICO');
    };

    const handleEditConfirm = async () => {
        if (!editNome.trim() || !editValidade.trim()) {
            showToast('Preencha todos os campos.', 'warning', { title: 'Atenção' });
            return;
        }

        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const token = authUser?.token;
        setSalvandoEdicao(true);

        try {
            const apiBaseUrl = getApiBaseUrl();
            const resposta = await fetch(`${apiBaseUrl}/documentos/${documentoParaEditar.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nome: editNome, data_limite: editValidade, periodicidade: editPeriodicidade })
            });

            const dados = await resposta.json().catch(() => ({}));

            if (resposta.ok && dados.sucesso !== false) {
                showToast('Documento atualizado com sucesso.', 'success', { title: 'Sucesso' });
                handleEditCancel();
                carregarDocumentos();
            } else {
                showToast(dados.mensagem || 'Erro ao atualizar documento.', 'error', { title: 'Erro' });
            }
        } catch (erro) {
            console.error('Erro ao editar documento:', erro);
            showToast('Erro ao conectar com o servidor.', 'error', { title: 'Erro' });
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleDeleteRequest = (doc) => setDocumentoParaExcluir(doc);
    const handleDeleteCancel  = () => setDocumentoParaExcluir(null);

    const handleDeleteConfirm = async () => {
        if (!documentoParaExcluir) return;

        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const token = authUser?.token;

        try {
            const apiBaseUrl = getApiBaseUrl();
            const resposta = await fetch(`${apiBaseUrl}/documentos/${documentoParaExcluir.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!resposta.ok) {
                const errorData = await resposta.json().catch(() => ({}));
                showToast(errorData.mensagem || 'Erro ao excluir documento.', 'error', { title: 'Erro' });
                return;
            }

            // Remove o item localmente sem precisar recarregar toda a lista
            setDocumentos((prev) => prev.filter((doc) => doc.id !== documentoParaExcluir.id));
            showToast('Documento excluído com sucesso.', 'success', { title: 'Sucesso' });
            setDocumentoParaExcluir(null);
        } catch (erro) {
            console.error('Erro ao excluir documento:', erro);
            showToast('Erro ao conectar com o servidor.', 'error', { title: 'Erro' });
        }
    };

    return (
        <div className="empresa-page">
            {/* Sidebar e conteúdo omitidos por serem estruturalmente idênticos aos outros componentes */}
            {/* ... */}

            {/* Modal de edição */}
            {documentoParaEditar && (
                <div className="empresa-modal" role="dialog" aria-modal="true">
                    <div className="empresa-modal__backdrop" onClick={handleEditCancel} />
                    <div className="empresa-modal__content empresa-modal__content--edit" role="document">
                        {/* Campos pré-preenchidos com os dados do documento selecionado */}
                        <div className="empresa-modal__fields">
                            <label className="empresa-field">
                                <span>Nome do documento</span>
                                <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                            </label>
                            <label className="empresa-field">
                                <span>Data limite</span>
                                <input type="date" value={editValidade} onChange={(e) => setEditValidade(e.target.value)} />
                            </label>
                            <label className="empresa-field">
                                <span>Periodicidade</span>
                                <select value={editPeriodicidade} onChange={(e) => setEditPeriodicidade(e.target.value)}>
                                    <option value="UNICO">Único</option>
                                    <option value="MENSAL">Mensal</option>
                                    <option value="TRIMESTRAL">Trimestral</option>
                                    <option value="SEMESTRAL">Semestral</option>
                                    <option value="ANUAL">Anual</option>
                                </select>
                            </label>
                        </div>
                        <div className="empresa-modal__actions">
                            <button type="button" className="empresa-secondary" onClick={handleEditCancel} disabled={salvandoEdicao}>Cancelar</button>
                            <button type="button" className="empresa-primary" onClick={handleEditConfirm} disabled={salvandoEdicao}>
                                {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de exclusão com confirmação explícita do usuário */}
            {documentoParaExcluir && (
                <div className="empresa-modal" role="dialog" aria-modal="true">
                    <div className="empresa-modal__backdrop" onClick={handleDeleteCancel} />
                    <div className="empresa-modal__content" role="document">
                        <div className="empresa-modal__text">
                            <span className="empresa-modal__title">Confirmar exclusão</span>
                            <span className="empresa-modal__message">Deseja realmente excluir este documento?</span>
                            <span className="empresa-modal__empresa">{documentoParaExcluir.nome}</span>
                        </div>
                        <div className="empresa-modal__actions">
                            <button type="button" className="empresa-secondary" onClick={handleDeleteCancel}>Cancelar</button>
                            <button type="button" className="empresa-danger" onClick={handleDeleteConfirm}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Documentos;