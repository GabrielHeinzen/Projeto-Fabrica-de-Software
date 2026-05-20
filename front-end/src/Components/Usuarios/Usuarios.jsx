import { useCallback, useEffect, useMemo, useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import '../CadastroEmpresa/CadastroEmpresa.css';
import '../MinhasEmpresas/MinhasEmpresas.css';
import './Usuarios.css';
import { useToast } from '../Toast/ToastProvider';

const buildIniciais = (nome) => {
  if (!nome) {
    return 'U';
  }

  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] || '';
  const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] || '' : '';

  return `${primeira}${ultima}`.toUpperCase() || 'U';
};

const formatTexto = (valor) => valor || 'Nao informado';
const getUsuarioId = (usuario) => usuario.id_contador ?? usuario.id;

const initialForm = {
  nome: '',
  email: '',
  senha: '',
  telefone: ''
};

function Usuarios({ userName = 'Usuario', onLogout, onNavigate }) {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
  const { showToast } = useToast();

  const carregarUsuarios = useCallback(async () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setIsLoading(true);
    setErro('');

    try {
      const resposta = await fetch(`${apiBaseUrl}/contador`);

      if (!resposta.ok) {
        throw new Error('Falha ao carregar usuarios');
      }

      const dados = await resposta.json();
      setUsuarios(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.log(err);
      setErro('Nao foi possivel carregar os usuarios agora.');
      showToast('Nao foi possivel carregar os usuarios agora.', 'error', {
        title: 'Erro'
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleClear = () => {
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.nome || !formData.email || !formData.senha) {
      showToast('Preencha os campos obrigatorios.', 'warning', {
        title: 'Atencao'
      });
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setIsSubmitting(true);

    try {
      const resposta = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.ok && dados.sucesso) {
        showToast('Contador cadastrado com sucesso.', 'success', {
          title: 'Sucesso'
        });
        setFormData(initialForm);
        carregarUsuarios();
      } else {
        showToast(dados.mensagem || 'Erro ao cadastrar contador', 'error', {
          title: 'Erro'
        });
      }
    } catch (err) {
      console.log(err);
      showToast('Erro ao conectar com backend', 'error', {
        title: 'Erro'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (usuario) => {
    const usuarioId = getUsuarioId(usuario);

    if (!usuarioId) {
      showToast('Contador sem identificador.', 'warning', {
        title: 'Atencao'
      });
      return;
    }

    setUsuarioParaExcluir(usuario);
  };

  const handleDeleteCancel = () => {
    if (deletingId) {
      return;
    }

    setUsuarioParaExcluir(null);
  };

  const handleDelete = async (usuario) => {
    const usuarioId = getUsuarioId(usuario);

    if (!usuarioId) {
      showToast('Contador sem identificador.', 'warning', {
        title: 'Atencao'
      });
      return false;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setDeletingId(usuarioId);

    try {
      const resposta = await fetch(`${apiBaseUrl}/contador/${usuarioId}`, {
        method: 'DELETE'
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !dados.sucesso) {
        showToast(dados.mensagem || 'Erro ao excluir contador', 'error', {
          title: 'Erro'
        });
        return false;
      }

      setUsuarios((prev) => prev.filter((item) => getUsuarioId(item) !== usuarioId));

      showToast('Contador excluido com sucesso.', 'success', {
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

  const handleDeleteConfirm = async () => {
    if (!usuarioParaExcluir) {
      return;
    }

    const sucesso = await handleDelete(usuarioParaExcluir);

    if (sucesso) {
      setUsuarioParaExcluir(null);
    }
  };

  const resumo = useMemo(() => {
    const total = usuarios.length;
    const comTelefone = usuarios.filter((item) => item.telefone).length;

    return {
      total,
      comTelefone
    };
  }, [usuarios]);

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
          <button type="button" className="empresa-nav-item is-active">Usuarios</button>
          <button type="button" className="empresa-nav-item">Documentos</button>
          <button type="button" className="empresa-nav-item">Solicitacoes</button>
        </nav>
      </aside>

      <div className="empresa-content">
        <header className="empresa-topbar">
          <div className="empresa-breadcrumb">Usuarios</div>
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
            <span className="empresa-kicker">Gestao de usuarios</span>
            <h1>Usuarios cadastrados</h1>
            <p>Consulte todos os contadores cadastrados e acompanhe os dados principais.</p>
          </div>
          <div className="empresa-hero-badge">
            <span>Total cadastrados</span>
            <strong>{resumo.total}</strong>
            <span>Com telefone: {resumo.comTelefone}</span>
          </div>
        </section>

        <div className="empresa-grid">
          <section className="empresa-card empresa-card--list">
            <div className="empresa-card-header">
              <h2>Lista de contadores</h2>
              <div className="empresa-card-actions">
                <span className="empresa-badge">{resumo.total} usuarios</span>
                <button
                  type="button"
                  className="empresa-secondary"
                  onClick={carregarUsuarios}
                  disabled={isLoading}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar lista'}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="empresa-empty">Carregando usuarios...</div>
            ) : erro ? (
              <div className="empresa-empty empresa-empty--error">{erro}</div>
            ) : usuarios.length === 0 ? (
              <div className="empresa-empty">Nenhum usuario cadastrado ainda.</div>
            ) : (
              <ul className="empresa-list">
                {usuarios.map((usuario) => {
                  const usuarioId = getUsuarioId(usuario);
                  const isDeleting = deletingId === usuarioId;
                  const deleteDisabled = Boolean(deletingId && deletingId !== usuarioId);

                  return (
                  <li key={usuarioId || usuario.email} className="empresa-list-item">
                    <div className="usuarios-list-top">
                      <div className="usuarios-list-header">
                        <div className="usuarios-avatar" aria-hidden="true">
                          {buildIniciais(usuario.nome)}
                        </div>
                        <div>
                          <strong>{formatTexto(usuario.nome)}</strong>
                          <span className="empresa-list-subtitle">{formatTexto(usuario.email)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="empresa-danger empresa-action-button"
                        onClick={() => handleDeleteRequest(usuario)}
                        disabled={isDeleting || deleteDisabled}
                      >
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>

                    <div className="empresa-list-meta">
                      <div>
                        <span>ID do contador</span>
                        <strong>{usuario.id_contador ?? 'N/A'}</strong>
                      </div>
                      <div>
                        <span>Telefone</span>
                        <strong>{formatTexto(usuario.telefone)}</strong>
                      </div>
                    </div>
                  </li>
                );
                })}
              </ul>
            )}
          </section>

          <form className="empresa-card empresa-card--form" onSubmit={handleSubmit}>
            <div className="empresa-card-header">
              <h2>Novo contador</h2>
              <span className="empresa-badge">Cadastro</span>
            </div>

            <label className="empresa-field">
              <span>Nome *</span>
              <input
                type="text"
                placeholder="Digite o nome do contador"
                value={formData.nome}
                onChange={handleChange('nome')}
                required
              />
            </label>

            <label className="empresa-field">
              <span>Email *</span>
              <input
                type="email"
                placeholder="nome@contabilidade.com"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </label>

            <label className="empresa-field">
              <span>Telefone</span>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleChange('telefone')}
              />
            </label>

            <label className="empresa-field">
              <span>Senha *</span>
              <input
                type="password"
                placeholder="Defina uma senha"
                value={formData.senha}
                onChange={handleChange('senha')}
                required
              />
            </label>

            <div className="empresa-actions">
              <button type="submit" className="empresa-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar contador'}
              </button>
              <button
                type="button"
                className="empresa-secondary"
                onClick={handleClear}
                disabled={isSubmitting}
              >
                Limpar
              </button>
            </div>

            <div className="empresa-note">
              Os dados cadastrados ficam disponiveis para acesso no login do sistema.
            </div>
          </form>
        </div>
      </div>
      {usuarioParaExcluir && (
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
                Deseja realmente excluir este contador?
              </span>
              <span className="empresa-modal__empresa">
                {usuarioParaExcluir.nome || usuarioParaExcluir.email || 'Contador selecionado'}
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
    </div>
  );
}

export default Usuarios;
