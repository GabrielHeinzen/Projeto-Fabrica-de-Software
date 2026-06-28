import { useCallback, useEffect, useMemo, useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import '../CadastroEmpresa/CadastroEmpresa.css';
import './MinhasEmpresas.css';
import { useToast } from '../Toast/ToastProvider';

// Mapa de labels amigáveis para os regimes tributários
const regimeLabels = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
  mei: 'MEI'
};
const initialCadastroForm = {
  razaoSocial: '',
  cnpj: '',
  regimeTributario: '',
  possuiFuncionarios: '',
  possuiNotasVenda: '',
  prestaServicos: ''
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
  possui_notas_venda: parseFlag(empresa.possui_notas_venda) ? 'sim' : 'nao',
  presta_servicos: parseFlag(empresa.presta_servicos) ? 'sim' : 'nao'
});



function MinhasEmpresas({ userName = 'Usuario', onLogout, onNavigate }) {
  const [empresas, setEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState(null);
  const { showToast } = useToast();
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [cadastroForm, setCadastroForm] = useState(initialCadastroForm);
  const [isCreating, setIsCreating] = useState(false);

  // useCallback evita loop infinito no useEffect que depende desta função
  const carregarEmpresas = useCallback(async (mostrarToast = false) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setIsLoading(true);
    setErro('');

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa`);

      if (!resposta.ok) {
        throw new Error('Falha ao carregar as empresas');
      }

      const dados = await resposta.json();
      setEmpresas(Array.isArray(dados) ? dados : []);
      if (mostrarToast) {
        showToast('Lista atualizada com sucesso.', 'success', {
          title: 'Sucesso'
        });
      }
    } catch (err) {
      console.log(err);
      setErro('Nao foi possivel carregar as empresas agora.');
      if (mostrarToast) {
        showToast('Nao foi possivel carregar as empresas agora.', 'error', {
          title: 'Erro'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);
  // useMemo recalcula o resumo apenas quando a lista de empresas muda
  const resumo = useMemo(() => {
    const total = empresas.length;
    const comFuncionarios = empresas.filter((empresa) => parseFlag(empresa.possui_funcionarios)).length;
    const comNotas = empresas.filter((empresa) => parseFlag(empresa.possui_notas_venda)).length;
    const comServicos = empresas.filter((empresa) => parseFlag(empresa.presta_servicos)).length;

    return {
      total,
      comFuncionarios,
      comNotas,
      comServicos
    };
  }, [empresas]);

  const formatRegime = (value) => regimeLabels[value] || value || 'Nao informado';
  const formatSimNao = (value) => (parseFlag(value) ? 'Sim' : 'Nao');
  // Abre o formulário inline de edição para a empresa clicada
  const handleEditStart = (empresa) => {
    const empresaId = getEmpresaId(empresa);

    if (!empresaId) {
      showToast('Empresa sem identificador.', 'warning', {
        title: 'Atencao'
      });
      return;
    }

    setEditingId(empresaId);
    setEditForm(buildEditForm(empresa));
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };
  // Handler genérico para atualizar qualquer campo do formulário de edição
  const handleEditChange = (field) => (event) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUpdate = async (empresaId) => {
    if (!editForm) {
      return;
    }

    if (!editForm.cnpj || !editForm.razao_social || !editForm.regime_tributario) {
      showToast('Preencha os campos obrigatorios.', 'warning', {
        title: 'Atencao'
      });
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cnpj: editForm.cnpj,
          razao_social: editForm.razao_social,
          regime_tributario: editForm.regime_tributario,
          // Converte 'sim'/'nao' de volta para booleano
          possui_funcionarios: editForm.possui_funcionarios === 'sim',
          possui_notas_venda: editForm.possui_notas_venda === 'sim',
          presta_servicos: editForm.presta_servicos === 'sim',
          id_contador: idContadorAtual
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        showToast(dados.mensagem || 'Erro ao atualizar empresa', 'error', {
          title: 'Erro'
        });
        return;
      }

      setEmpresas((prev) => prev.map((empresa) => (
        getEmpresaId(empresa) === empresaId
          ? {
            ...empresa,
            cnpj: editForm.cnpj,
            razao_social: editForm.razao_social,
            regime_tributario: editForm.regime_tributario,
            possui_funcionarios: editForm.possui_funcionarios === 'sim',
            possui_notas_venda: editForm.possui_notas_venda === 'sim',
            presta_servicos: editForm.presta_servicos === 'sim'
          }
          : empresa
      )));

      handleEditCancel();
      showToast('Empresa atualizada com sucesso.', 'success', {
        title: 'Sucesso'
      });
    } catch (err) {
      console.log(err);
      showToast('Erro ao conectar com backend', 'error', {
        title: 'Erro'
      });
    } finally {
      setSavingId(null);
    }
  };

  // Abre o modal de confirmação antes de excluir
  const handleDeleteRequest = (empresa) => {
    const empresaId = getEmpresaId(empresa);

    if (!empresaId) {
      showToast('Empresa sem identificador.', 'warning', {
        title: 'Atencao'
      });
      return;
    }

    setEmpresaParaExcluir(empresa);
  };
  // Bloqueia fechar o modal enquanto a exclusão está em andamento
  const handleDeleteCancel = () => {
    if (deletingId) {
      return;
    }

    setEmpresaParaExcluir(null);
  };

  const handleDelete = async (empresa) => {
    const empresaId = getEmpresaId(empresa);

    if (!empresaId) {
      showToast('Empresa sem identificador.', 'warning', {
        title: 'Atencao'
      });
      return false;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setDeletingId(empresaId);

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa/${empresaId}`, {
        method: 'DELETE'
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        showToast(dados.mensagem || 'Erro ao excluir empresa', 'error', {
          title: 'Erro'
        });
        return false;
      }

      // Remove da lista local e fecha o formulário de edição se estiver aberto
      setEmpresas((prev) => prev.filter((item) => getEmpresaId(item) !== empresaId));

      if (editingId === empresaId) {
        handleEditCancel();
      }

      showToast('Empresa excluida com sucesso.', 'success', {
        title: 'Sucesso'
      });
      return true;
    } catch (err) {
      console.log(err);
      showToast('Erro ao conectar com backend', 'error', {
        title: 'Erro'
      });
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // Só fecha o modal se a exclusão foi bem-sucedida
  const handleDeleteConfirm = async () => {
    if (!empresaParaExcluir) {
      return;
    }

    const sucesso = await handleDelete(empresaParaExcluir);

    if (sucesso) {
      setEmpresaParaExcluir(null);
    }
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
            <span>Portal Contabil</span>
          </div>
        </div>

        <nav className="empresa-nav">
          <button
            type="button"
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('dashboard')}>Dashboard</button>
          <button type="button" className="empresa-nav-item is-active">
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
            Usuarios
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
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('anexo')}
          >
            Anexo de Documentos
          </button>
          <button
            type="button"
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('recebidos')}
          >
            Documentos Recebidos
          </button>
        </nav>
      </aside>

      <div className="empresa-content">
        <header className="empresa-topbar">
          <div className="empresa-breadcrumb"></div>
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
            <span className="empresa-kicker">Empresas cadastradas</span>
            <h1>Minhas Empresas</h1>
            <p>Visualize as empresas cadastradas no sistema e acompanhe o perfil de cada uma.</p>
          </div>
          <div className="empresa-hero-badge">
            <span>Total cadastradas</span>
            <strong>{resumo.total}</strong>
            <span>Com notas de venda: {resumo.comNotas}</span>
          </div>
        </section>

        <div className="empresa-grid">
          <section className="empresa-card empresa-card--list">
            <div className="empresa-card-header">
              <h2>Empresas cadastradas</h2>
              <div className="empresa-card-actions">
                <span className="empresa-badge">{resumo.total} empresas</span>
                <button type="button"
                  className="empresa-primary"
                  onClick={() => setShowCadastroModal(true)}>
                  + Cadastrar Empresa
                </button>
                <button
                  type="button"
                  className="empresa-secondary"
                  onClick={() => carregarEmpresas(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar lista'}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="empresa-empty">Carregando empresas...</div>
            ) : erro ? (
              <div className="empresa-empty empresa-empty--error">{erro}</div>
            ) : empresas.length === 0 ? (
              <div className="empresa-empty">Nenhuma empresa cadastrada ainda.</div>
            ) : (
              <ul className="empresa-list">
                {empresas.map((empresa) => {
                  const empresaId = getEmpresaId(empresa);
                  const isEditing = editingId === empresaId;
                  const isSaving = savingId === empresaId;
                  const isDeleting = deletingId === empresaId;
                  const editDisabled = Boolean(editingId && editingId !== empresaId);

                  return (
                    <li
                      key={empresaId || `${empresa.cnpj}-${empresa.razao_social}`}
                      className="empresa-list-item"
                    >
                      <div className="empresa-list-header">
                        <div>
                          <strong>{empresa.razao_social || 'Razao social nao informada'}</strong>
                          <span className="empresa-list-subtitle">
                            CNPJ: {empresa.cnpj || 'Nao informado'}
                          </span>
                        </div>
                        <div className="empresa-list-actions">
                          <span className="empresa-pill empresa-pill--primary">
                            {formatRegime(empresa.regime_tributario)}
                          </span>
                          <button
                            type="button"
                            className="empresa-secondary empresa-action-button"
                            onClick={() => handleEditStart(empresa)}
                            disabled={editDisabled || isEditing || isDeleting}
                          >
                            {isEditing ? 'Editando' : 'Editar'}
                          </button>
                          <button
                            type="button"
                            className="empresa-danger empresa-action-button"
                            onClick={() => handleDeleteRequest(empresa)}
                            disabled={isDeleting || isSaving}
                          >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      </div>

                      <div className="empresa-list-footer">
                        <span className={`empresa-pill ${parseFlag(empresa.possui_funcionarios)
                          ? 'empresa-pill--ok'
                          : 'empresa-pill--warn'
                          }`}
                        >
                          Funcionarios: {formatSimNao(empresa.possui_funcionarios)}
                        </span>
                        <span className={`empresa-pill ${parseFlag(empresa.possui_notas_venda)
                          ? 'empresa-pill--ok'
                          : 'empresa-pill--warn'
                          }`}
                        >
                          Notas de venda: {formatSimNao(empresa.possui_notas_venda)}
                        </span>
                        <span className={`empresa-pill ${parseFlag(empresa.presta_servicos)
                          ? 'empresa-pill--ok'
                          : 'empresa-pill--warn'
                          }`}
                        >
                          Servicos: {formatSimNao(empresa.presta_servicos)}
                        </span>
                      </div>

                      {isEditing && editForm && (
                        <div className="empresa-edit">
                          <div className="empresa-edit-grid">
                            <label className="empresa-field">
                              <span>Razao Social *</span>
                              <input
                                type="text"
                                value={editForm.razao_social}
                                onChange={handleEditChange('razao_social')}
                                required
                              />
                            </label>

                            <label className="empresa-field">
                              <span>CNPJ *</span>
                              <input
                                type="text"
                                value={editForm.cnpj}
                                onChange={handleEditChange('cnpj')}
                                maxLength={18}
                                required
                              />
                            </label>

                            <label className="empresa-field">
                              <span>Regime Tributario *</span>
                              <select
                                value={editForm.regime_tributario}
                                onChange={handleEditChange('regime_tributario')}
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

                          </div>

                          <div className="empresa-toggle-group">
                            <span>Possui funcionarios? *</span>
                            <div className="empresa-toggle-options">
                              <label
                                className={`empresa-toggle-option ${editForm.possui_funcionarios === 'sim' ? 'is-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`edit-funcionarios-${empresaId}`}
                                  value="sim"
                                  checked={editForm.possui_funcionarios === 'sim'}
                                  onChange={handleEditChange('possui_funcionarios')}
                                  required
                                />
                                Sim
                              </label>
                              <label
                                className={`empresa-toggle-option ${editForm.possui_funcionarios === 'nao' ? 'is-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`edit-funcionarios-${empresaId}`}
                                  value="nao"
                                  checked={editForm.possui_funcionarios === 'nao'}
                                  onChange={handleEditChange('possui_funcionarios')}
                                />
                                Nao
                              </label>
                            </div>
                          </div>

                          <div className="empresa-toggle-group">
                            <span>Possui notas de venda? *</span>
                            <div className="empresa-toggle-options">
                              <label
                                className={`empresa-toggle-option ${editForm.possui_notas_venda === 'sim' ? 'is-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`edit-notas-${empresaId}`}
                                  value="sim"
                                  checked={editForm.possui_notas_venda === 'sim'}
                                  onChange={handleEditChange('possui_notas_venda')}
                                  required
                                />
                                Sim
                              </label>
                              <label
                                className={`empresa-toggle-option ${editForm.possui_notas_venda === 'nao' ? 'is-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`edit-notas-${empresaId}`}
                                  value="nao"
                                  checked={editForm.possui_notas_venda === 'nao'}
                                  onChange={handleEditChange('possui_notas_venda')}
                                />
                                Nao
                              </label>
                            </div>
                          </div>

                          <div className="empresa-toggle-group">
                            <span>Presta servicos? *</span>
                            <div className="empresa-toggle-options">
                              <label
                                className={`empresa-toggle-option ${editForm.presta_servicos === 'sim' ? 'is-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`edit-servicos-${empresaId}`}
                                  value="sim"
                                  checked={editForm.presta_servicos === 'sim'}
                                  onChange={handleEditChange('presta_servicos')}
                                  required
                                />
                                Sim
                              </label>
                              <label
                                className={`empresa-toggle-option ${editForm.presta_servicos === 'nao' ? 'is-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`edit-servicos-${empresaId}`}
                                  value="nao"
                                  checked={editForm.presta_servicos === 'nao'}
                                  onChange={handleEditChange('presta_servicos')}
                                />
                                Nao
                              </label>
                            </div>
                          </div>

                          <div className="empresa-edit-actions">
                            <button
                              type="button"
                              className="empresa-primary"
                              onClick={() => handleUpdate(empresaId)}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
                            </button>
                            <button
                              type="button"
                              className="empresa-secondary"
                              onClick={handleEditCancel}
                              disabled={isSaving}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="empresa-card empresa-card--summary">
            <div className="empresa-card-header">
              <h2>Resumo rapido</h2>
            </div>

            <div className="empresa-summary">
              <div className="empresa-summary-item">
                <span>Total de empresas</span>
                <strong>{resumo.total}</strong>
              </div>
              <div className="empresa-summary-item">
                <span>Com funcionarios</span>
                <strong>{resumo.comFuncionarios}</strong>
              </div>
              <div className="empresa-summary-item">
                <span>Com notas de venda</span>
                <strong>{resumo.comNotas}</strong>
              </div>
              <div className="empresa-summary-item">
                <span>Prestam servicos</span>
                <strong>{resumo.comServicos}</strong>
              </div>
            </div>

            <div className="empresa-note">
              Estes dados refletem os cadastros enviados pelo modulo de Cadastro Empresa.
            </div>
          </section>
        </div>
      </div>
      {empresaParaExcluir && (
        <div className="empresa-modal" role="dialog" aria-modal="true">
          <div
            className="empresa-modal__backdrop"
            onClick={handleDeleteCancel}
          />
          <div className="empresa-modal__content" role="document">
            <div className="empresa-modal__icon" aria-hidden="true">!</div>
            <div className="empresa-modal__text">
              <span className="empresa-modal__title">Confirmar exclusao</span>
              <span className="empresa-modal__message">
                Deseja realmente excluir esta empresa?
              </span>
              <span className="empresa-modal__empresa">
                {empresaParaExcluir.razao_social || 'Empresa selecionada'}
              </span>
            </div>
            <div className="empresa-modal__actions">
              <button
                type="button"
                className="empresa-secondary"
                onClick={handleDeleteCancel}
                disabled={Boolean(deletingId)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="empresa-danger"
                onClick={handleDeleteConfirm}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCadastroModal && (
        <div className="empresa-modal" role="dialog" aria-modal="true">
          <div
            className="empresa-modal__backdrop"
            onClick={() => setShowCadastroModal(false)}
          />

          <div className="empresa-modal__content empresa-modal__content--form" role="document">
            <h2>Cadastrar Empresa</h2>

            <div className="empresa-edit-grid">

              <label className="empresa-field">
                <span>Razão Social *</span>

                <input
                  type="text"
                  value={cadastroForm.razaoSocial}
                  onChange={(e) =>
                    setCadastroForm({
                      ...cadastroForm,
                      razaoSocial: e.target.value
                    })
                  }
                />
              </label>

              <label className="empresa-field">
                <span>CNPJ *</span>

                <input
                  type="text"
                  value={cadastroForm.cnpj}
                  onChange={(e) =>
                    setCadastroForm({
                      ...cadastroForm,
                      cnpj: e.target.value
                    })
                  }
                />
              </label>

              <label className="empresa-field">
                <span>Regime Tributário *</span>

                <select
                  value={cadastroForm.regimeTributario}
                  onChange={(e) =>
                    setCadastroForm({
                      ...cadastroForm,
                      regimeTributario: e.target.value
                    })
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="simples">
                    Simples Nacional
                  </option>

                  <option value="presumido">
                    Lucro Presumido
                  </option>

                  <option value="real">
                    Lucro Real
                  </option>

                  <option value="mei">
                    MEI
                  </option>

                </select>
              </label>

            </div>

            <div className="empresa-modal__actions">
              <button
                type="button"
                className="empresa-secondary"
                onClick={() => setShowCadastroModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MinhasEmpresas;
