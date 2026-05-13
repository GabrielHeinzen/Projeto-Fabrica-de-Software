import { useCallback, useEffect, useMemo, useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import '../CadastroEmpresa/CadastroEmpresa.css';
import './MinhasEmpresas.css';

const regimeLabels = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
  mei: 'MEI'
};

const parseFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';
const getEmpresaId = (empresa) => empresa.id_cliente ?? empresa.id;
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

  const carregarEmpresas = useCallback(async () => {
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
    } catch (err) {
      console.log(err);
      setErro('Nao foi possivel carregar as empresas agora.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

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

  const handleEditStart = (empresa) => {
    const empresaId = getEmpresaId(empresa);

    if (!empresaId) {
      alert('Empresa sem identificador.');
      return;
    }

    setEditingId(empresaId);
    setEditForm(buildEditForm(empresa));
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

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
      alert('Preencha os campos obrigatorios.');
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
          possui_funcionarios: editForm.possui_funcionarios === 'sim',
          possui_notas_venda: editForm.possui_notas_venda === 'sim',
          presta_servicos: editForm.presta_servicos === 'sim',
          id_contador: idContadorAtual
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        alert(dados.mensagem || 'Erro ao atualizar empresa');
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
    } catch (err) {
      console.log(err);
      alert('Erro ao conectar com backend');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (empresa) => {
    const empresaId = getEmpresaId(empresa);

    if (!empresaId) {
      alert('Empresa sem identificador.');
      return;
    }

    const confirmacao = window.confirm('Deseja realmente excluir esta empresa?');

    if (!confirmacao) {
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setDeletingId(empresaId);

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa/${empresaId}`, {
        method: 'DELETE'
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        alert(dados.mensagem || 'Erro ao excluir empresa');
        return;
      }

      setEmpresas((prev) => prev.filter((item) => getEmpresaId(item) !== empresaId));

      if (editingId === empresaId) {
        handleEditCancel();
      }
    } catch (err) {
      console.log(err);
      alert('Erro ao conectar com backend');
    } finally {
      setDeletingId(null);
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
          <button type="button" className="empresa-nav-item">Dashboard</button>
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
          <button type="button" className="empresa-nav-item">Usuarios</button>
          <button type="button" className="empresa-nav-item">Documentos</button>
          <button type="button" className="empresa-nav-item">Solicitacoes</button>
          <button type="button" className="empresa-nav-item">Financeiro</button>
          <button type="button" className="empresa-nav-item">Suporte</button>
          <button type="button" className="empresa-nav-item">Configuracoes</button>
        </nav>
      </aside>

      <div className="empresa-content">
        <header className="empresa-topbar">
          <div className="empresa-breadcrumb">Minhas Empresas</div>
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
                <button
                  type="button"
                  className="empresa-secondary"
                  onClick={carregarEmpresas}
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
                          onClick={() => handleDelete(empresa)}
                          disabled={isDeleting || isSaving}
                        >
                          {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </div>

                    <div className="empresa-list-meta">
                      <div>
                        <span>Funcionarios</span>
                        <strong>{formatSimNao(empresa.possui_funcionarios)}</strong>
                      </div>
                      <div>
                        <span>Notas de venda</span>
                        <strong>{formatSimNao(empresa.possui_notas_venda)}</strong>
                      </div>
                      <div>
                        <span>Servicos</span>
                        <strong>{formatSimNao(empresa.presta_servicos)}</strong>
                      </div>
                      <div>
                        <span>Contador</span>
                        <strong>{empresa.id_contador ? `#${empresa.id_contador}` : 'Nao atribuido'}</strong>
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
    </div>
  );
}

export default MinhasEmpresas;
