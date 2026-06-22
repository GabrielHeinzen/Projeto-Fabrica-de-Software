import { useEffect, useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import '../../Components/CadastroEmpresa/CadastroEmpresa.css';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard({ userName = 'Usuario', onLogout, onNavigate }) {
  const [geral, setGeral] = useState(null);
  const [obrigacoes, setObrigacoes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Pega o token salvo no login — fica dentro do objeto authUser
    const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    const token = authUser?.token;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Dispara as 3 requisições em paralelo
    Promise.all([
      fetch(`${API_URL}/dashboard`, { headers }),
      fetch(`${API_URL}/dashboard/obrigacoes`, { headers }),
      fetch(`${API_URL}/dashboard/empresas`, { headers }),
    ])
      .then(async ([resGeral, resObrig, resEmpresas]) => {
        if (!resGeral.ok || !resObrig.ok || !resEmpresas.ok) {
          throw new Error('Erro ao carregar dados do dashboard.');
        }
        const [dataGeral, dataObrig, dataEmpresas] = await Promise.all([
          resGeral.json(),
          resObrig.json(),
          resEmpresas.json(),
        ]);
        setGeral(dataGeral);
        setObrigacoes(dataObrig);
        setEmpresas(dataEmpresas);
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = geral?.total_obrigacoes ?? 0;
  const enviados = geral?.total_enviados ?? 0;
  const pendentes = geral?.total_pendentes ?? 0;
  const taxaPct = total > 0 ? Math.round((enviados / total) * 100) : 0;

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
            className="empresa-nav-item is-active"
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
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
            <h1>Dashboard</h1>
            <p>Acompanhe o status das obrigações e empresas em tempo real.</p>
          </div>
        </section>

        {loading ? (
          <div className="db-loading">
            <div className="db-spinner" />
            <p>Carregando dashboard...</p>
          </div>
        ) : erro ? (
          <div className="db-erro">
            <span>⚠</span>
            <p>{erro}</p>
          </div>
        ) : (
          <div className="db-wrapper">
            {/* Cards de resumo */}
            <section className="db-cards">
              <div className="db-card db-card--total">
                <span className="db-card-label">Total de obrigações</span>
                <span className="db-card-valor">{total}</span>
              </div>
              <div className="db-card db-card--enviado">
                <span className="db-card-label">Enviadas</span>
                <span className="db-card-valor">{enviados}</span>
              </div>
              <div className="db-card db-card--pendente">
                <span className="db-card-label">Pendentes</span>
                <span className="db-card-valor">{pendentes}</span>
              </div>
              <div className="db-card db-card--taxa">
                <span className="db-card-label">Taxa de envio</span>
                <span className="db-card-valor">{taxaPct}%</span>
                <div className="db-barra">
                  <div className="db-barra-fill" style={{ width: `${taxaPct}%` }} />
                </div>
              </div>
            </section>

            <div className="db-grid">
              {/* Tabela por obrigação */}
              <section className="db-secao">
                <h2 className="db-secao-titulo">Por tipo de obrigação</h2>
                {obrigacoes.length === 0 ? (
                  <p className="db-vazio">Nenhuma obrigação encontrada.</p>
                ) : (
                  <table className="db-tabela">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Enviados</th>
                        <th>Pendentes</th>
                        <th>Progresso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obrigacoes.map((item) => {
                        const tot = (item.enviados ?? 0) + (item.pendentes ?? 0);
                        const pct = tot > 0 ? Math.round(((item.enviados ?? 0) / tot) * 100) : 0;
                        return (
                          <tr key={item.nome}>
                            <td className="db-td-nome">{item.nome}</td>
                            <td className="db-td-env">{item.enviados ?? 0}</td>
                            <td className="db-td-pend">{item.pendentes ?? 0}</td>
                            <td>
                              <div className="db-barra db-barra--inline">
                                <div className="db-barra-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="db-pct">{pct}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>

              {/* Lista por empresa */}
              <section className="db-secao">
                <h2 className="db-secao-titulo">Por empresa</h2>
                {empresas.length === 0 ? (
                  <p className="db-vazio">Nenhuma empresa encontrada.</p>
                ) : (
                  <ul className="db-empresas">
                    {empresas.map((item) => {
                      const tot = (item.enviados ?? 0) + (item.pendentes ?? 0);
                      const pct = tot > 0 ? Math.round(((item.enviados ?? 0) / tot) * 100) : 0;
                      return (
                        <li key={item.razao_social} className="db-empresa">
                          <div className="db-empresa-header">
                            <span className="db-empresa-nome">{item.razao_social}</span>
                            <span className="db-empresa-pct">{pct}%</span>
                          </div>
                          <div className="db-badges">
                            <span className="db-badge db-badge--env">{item.enviados ?? 0} enviados</span>
                            <span className="db-badge db-badge--pend">{item.pendentes ?? 0} pendentes</span>
                          </div>
                          <div className="db-barra">
                            <div className="db-barra-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
