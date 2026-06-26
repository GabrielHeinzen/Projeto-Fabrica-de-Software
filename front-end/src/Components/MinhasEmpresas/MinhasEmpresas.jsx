import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../Toast/ToastProvider';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import '../CadastroEmpresa/CadastroEmpresa.css';
import './MinhasEmpresas.css';

// Mapa de labels amigáveis para os regimes tributários
const regimeLabels = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
  mei: 'MEI'
};

// Normaliza o campo booleano que pode vir como true, 1, '1' ou 'true' do banco
const parseFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';

// Suporta APIs que retornam id_cliente ou id
const getEmpresaId = (empresa) => empresa.id_cliente ?? empresa.id;

// Monta o objeto do formulário de edição a partir dos dados da empresa
const buildEditForm = (empresa) => ({
  cnpj: empresa.cnpj || '',
  razao_social: empresa.razao_social || '',
  regime_tributario: empresa.regime_tributario || '',
  possui_funcionarios: parseFlag(empresa.possui_funcionarios) ? 'sim' : 'nao',
  possui_notas_venda:  parseFlag(empresa.possui_notas_venda)  ? 'sim' : 'nao',
  presta_servicos:     parseFlag(empresa.presta_servicos)     ? 'sim' : 'nao'
});

function MinhasEmpresas({ userName = 'Usuario', onLogout, onNavigate }) {
  const [empresas, setEmpresas]                 = useState([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [erro, setErro]                         = useState('');
  const [editingId, setEditingId]               = useState(null);  // id da empresa em edição
  const [editForm, setEditForm]                 = useState(null);  // dados do formulário de edição
  const [savingId, setSavingId]                 = useState(null);  // id da empresa sendo salva
  const [deletingId, setDeletingId]             = useState(null);  // id da empresa sendo excluída
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState(null); // empresa no modal de confirmação
  const { showToast } = useToast();

  // useCallback evita loop infinito no useEffect que depende desta função
  const carregarEmpresas = useCallback(async (mostrarToast = false) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    setIsLoading(true);
    setErro('');

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa`);
      if (!resposta.ok) throw new Error('Falha ao carregar as empresas');
      const dados = await resposta.json();
      setEmpresas(Array.isArray(dados) ? dados : []);
      if (mostrarToast) showToast('Lista atualizada com sucesso.', 'success', { title: 'Sucesso' });
    } catch (err) {
      console.log(err);
      setErro('Nao foi possivel carregar as empresas agora.');
      if (mostrarToast) showToast('Nao foi possivel carregar as empresas agora.', 'error', { title: 'Erro' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { carregarEmpresas(); }, [carregarEmpresas]);

  // useMemo recalcula o resumo apenas quando a lista de empresas muda
  const resumo = useMemo(() => ({
    total:           empresas.length,
    comFuncionarios: empresas.filter((e) => parseFlag(e.possui_funcionarios)).length,
    comNotas:        empresas.filter((e) => parseFlag(e.possui_notas_venda)).length,
    comServicos:     empresas.filter((e) => parseFlag(e.presta_servicos)).length,
  }), [empresas]);

  const formatRegime  = (value) => regimeLabels[value] || value || 'Nao informado';
  const formatSimNao  = (value) => (parseFlag(value) ? 'Sim' : 'Nao');

  // Abre o formulário inline de edição para a empresa clicada
  const handleEditStart = (empresa) => {
    const empresaId = getEmpresaId(empresa);
    if (!empresaId) { showToast('Empresa sem identificador.', 'warning', { title: 'Atencao' }); return; }
    setEditingId(empresaId);
    setEditForm(buildEditForm(empresa));
  };

  const handleEditCancel = () => { setEditingId(null); setEditForm(null); };

  // Handler genérico para atualizar qualquer campo do formulário de edição
  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleUpdate = async (empresaId) => {
    if (!editForm) return;

    if (!editForm.cnpj || !editForm.razao_social || !editForm.regime_tributario) {
      showToast('Preencha os campos obrigatorios.', 'warning', { title: 'Atencao' });
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Preserva o id_contador original da empresa ao salvar
    const empresaAtual = empresas.find((item) => getEmpresaId(item) === empresaId);
    const idContadorAtual = empresaAtual?.id_contador ?? null;

    setSavingId(empresaId);

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa/${empresaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: editForm.cnpj,
          razao_social: editForm.razao_social,
          regime_tributario: editForm.regime_tributario,
          // Converte 'sim'/'nao' de volta para booleano
          possui_funcionarios: editForm.possui_funcionarios === 'sim',
          possui_notas_venda:  editForm.possui_notas_venda === 'sim',
          presta_servicos:     editForm.presta_servicos === 'sim',
          id_contador: idContadorAtual
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        showToast(dados.mensagem || 'Erro ao atualizar empresa', 'error', { title: 'Erro' });
        return;
      }

      // Atualiza a empresa localmente sem precisar recarregar toda a lista
      setEmpresas((prev) => prev.map((empresa) =>
        getEmpresaId(empresa) === empresaId
          ? { ...empresa, ...editForm,
              possui_funcionarios: editForm.possui_funcionarios === 'sim',
              possui_notas_venda:  editForm.possui_notas_venda === 'sim',
              presta_servicos:     editForm.presta_servicos === 'sim' }
          : empresa
      ));

      handleEditCancel();
      showToast('Empresa atualizada com sucesso.', 'success', { title: 'Sucesso' });
    } catch (err) {
      console.log(err);
      showToast('Erro ao conectar com backend', 'error', { title: 'Erro' });
    } finally {
      setSavingId(null);
    }
  };

  // Abre o modal de confirmação antes de excluir
  const handleDeleteRequest = (empresa) => {
    const empresaId = getEmpresaId(empresa);
    if (!empresaId) { showToast('Empresa sem identificador.', 'warning', { title: 'Atencao' }); return; }
    setEmpresaParaExcluir(empresa);
  };

  // Bloqueia fechar o modal enquanto a exclusão está em andamento
  const handleDeleteCancel = () => { if (deletingId) return; setEmpresaParaExcluir(null); };

  const handleDelete = async (empresa) => {
    const empresaId = getEmpresaId(empresa);
    if (!empresaId) { showToast('Empresa sem identificador.', 'warning', { title: 'Atencao' }); return false; }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    setDeletingId(empresaId);

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa/${empresaId}`, { method: 'DELETE' });
      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        showToast(dados.mensagem || 'Erro ao excluir empresa', 'error', { title: 'Erro' });
        return false;
      }

      // Remove da lista local e fecha o formulário de edição se estiver aberto
      setEmpresas((prev) => prev.filter((item) => getEmpresaId(item) !== empresaId));
      if (editingId === empresaId) handleEditCancel();

      showToast('Empresa excluida com sucesso.', 'success', { title: 'Sucesso' });
      return true;
    } catch (err) {
      console.log(err);
      showToast('Erro ao conectar com backend', 'error', { title: 'Erro' });
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // Só fecha o modal se a exclusão foi bem-sucedida
  const handleDeleteConfirm = async () => {
    if (!empresaParaExcluir) return;
    const sucesso = await handleDelete(empresaParaExcluir);
    if (sucesso) setEmpresaParaExcluir(null);
  };

  // ... JSX de renderização omitido (estrutura idêntica aos demais componentes)
}

export default MinhasEmpresas;