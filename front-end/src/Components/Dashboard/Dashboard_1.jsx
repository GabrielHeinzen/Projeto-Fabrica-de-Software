import { useEffect, useState } from 'react';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import '../../Components/CadastroEmpresa/CadastroEmpresa.css';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard({ userName = 'Usuario', onLogout, onNavigate }) {
  const [geral, setGeral] = useState(null);  // totais gerais (obrigações, enviados, pendentes)
  const [obrigacoes, setObrigacoes] = useState([]);  // breakdown por tipo de obrigação
  const [empresas, setEmpresas] = useState([]);    // breakdown por empresa
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [competencia, setCompetencia] = useState('');
  const [competencias, setCompetencias] = useState([]);

  useEffect(() => {
    const authUser = JSON.parse(
      localStorage.getItem('authUser') || 'null'
    );

    const token = authUser?.token;

    if (!token) {
      return;
    }

    fetch(`${API_URL}/dashboard/competencias`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (resposta) => {
        if (!resposta.ok) {
          throw new Error('Erro ao carregar competências');
        }

        return resposta.json();
      })
      .then((dados) => {
        const lista = Array.isArray(dados) ? dados : [];

        setCompetencias(lista);

        if (lista.length > 0) {
          setCompetencia(lista[0].competencia);
        }
      })
      .catch((erro) => {
        console.error(erro);
      });
  }, []);


  useEffect(() => {
    // Recupera o token JWT salvo no login
    const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    const token = authUser?.token;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Dispara as 3 requisições em paralelo para reduzir tempo de carregamento
    Promise.all([
      fetch(`${API_URL}/dashboard`, { headers }),
      fetch(`${API_URL}/dashboard/obrigacoes`, { headers }),
      fetch(`${API_URL}/dashboard/empresas`, { headers }),
    ])
      .then(async ([resGeral, resObrig, resEmpresas]) => {
        if (!resGeral.ok || !resObrig.ok || !resEmpresas.ok) {
          throw new Error('Erro ao carregar dados do dashboard.');
        }
        // Aguarda o parse de todos os JSONs antes de atualizar o estado
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

  // Valores com fallback para zero caso a API retorne nulo
  const total = geral?.total_obrigacoes ?? 0;
  const enviados = geral?.total_enviados ?? 0;
  const pendentes = geral?.total_pendentes ?? 0;

  // Taxa de envio em percentual, evitando divisão por zero
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
          <button type="button" className="empresa-nav-item is-active" onClick={() => onNavigate && onNavigate('dashboard')}>Dashboard</button>
          <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('empresas')}>Minhas Empresas</button>
          <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('usuarios')}>Usuarios</button>
          <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('documentos')}>Documentos</button>
          <button type="button" className="empresa-nav-item" onClick={() => onNavigate && onNavigate('anexo')}>Anexo de Documentos</button>
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

        <section className="empresa-hero dashboard-hero">
          <div className="dashboard-hero-content">

            <div>
              <span className="empresa-kicker">
                Painel de acompanhamento
              </span>

              <h1>Dashboard</h1>

              <p>
                Acompanhe o status das obrigações das empresas cadastradas.
              </p>
            </div>

            <select
              className="dashboard-competencia"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              disabled={competencias.length === 0}
            >
              {competencias.length === 0 ? (
                <option value="">
                  Nenhuma competência
                </option>
              ) : (
                competencias.map((item) => {
                  const [ano, mes] = item.competencia.split('-');

                  const nomeMes = new Date(
                    Number(ano),
                    Number(mes) - 1,
                    1
                  ).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                  });

                  return (
                    <option
                      key={item.competencia}
                      value={item.competencia}
                    >
                      {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
                    </option>
                  );
                })
              )}
            </select>

          </div>
        </section>

        {/* Renderização condicional: loading → erro → conteúdo */}
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
            {/* Cards de resumo geral */}
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
                {/* Barra de progresso visual proporcional à taxa */}
                <div className="db-barra">
                  <div className="db-barra-fill" style={{ width: `${taxaPct}%` }} />
                </div>
              </div>
            </section>

            <div className="db-grid">
              {/* Tabela de progresso por tipo de obrigação */}
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
                        // Percentual individual por tipo de obrigação
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

              {/* Lista de progresso por empresa */}
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