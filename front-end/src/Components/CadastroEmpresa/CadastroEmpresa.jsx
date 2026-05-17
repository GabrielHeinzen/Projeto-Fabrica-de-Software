import { useState } from 'react';
import { useToast } from '../Toast/ToastProvider';
import logoIcon from '../../assets/IconeContabilidade.jpeg';
import './CadastroEmpresa.css';

const initialForm = {
  razaoSocial: '',
  cnpj: '',
  regimeTributario: '',
  possuiFuncionarios: '',
  possuiNotasVenda: '',
  prestaServicos: ''
};

function CadastroEmpresa({ userName = 'Usuario', onLogout, onNavigate }) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [documentos, setDocumentos] = useState({
    contratoSocial: null,
    comprovanteCnpj: null,
    documentoSocios: null,
    comprovanteEndereco: null,
    balancoContabil: null
  });

  const [datasEntrega, setDatasEntrega] = useState({
    dataEstimada: '',
    dataReal: ''
  });

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (campo) => (event) => {
    const arquivo = event.target.files[0];

    setDocumentos((prev) => ({
      ...prev,
      [campo]: arquivo
    }));
  };

  const handleDateChange = (campo) => (event) => {
    setDatasEntrega((prev) => ({
      ...prev,
      [campo]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!datasEntrega.dataEstimada) {
      showToast('Informe a data estimada da entrega dos documentos.', 'warning', {
        title: 'Atencao'
      });
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    setIsSubmitting(true);

    try {
      const resposta = await fetch(`${apiBaseUrl}/empresa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cnpj: formData.cnpj,
          razao_social: formData.razaoSocial,
          regime_tributario: formData.regimeTributario,
          possui_funcionarios: formData.possuiFuncionarios === 'sim',
          possui_notas_venda: formData.possuiNotasVenda === 'sim',
          presta_servicos: formData.prestaServicos === 'sim'
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.sucesso) {
        showToast('Empresa cadastrada com sucesso.', 'success', {
          title: 'Sucesso'
        });
        setFormData(initialForm);
      } else {
        showToast(dados.mensagem || 'Erro ao cadastrar empresa', 'error', {
          title: 'Erro'
        });
      }
    } catch (erro) {
      console.log(erro);
      showToast('Erro ao conectar com backend', 'error', {
        title: 'Erro'
      });
    } finally {
      setIsSubmitting(false);
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
          <button
            type="button"
            className="empresa-nav-item"
            onClick={() => onNavigate && onNavigate('empresas')}
          >
            Minhas Empresas
          </button>
          <button
            type="button"
            className="empresa-nav-item is-active"
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
          <button type="button" className="empresa-nav-item">Documentos</button>
          <button type="button" className="empresa-nav-item">Solicitacoes</button>
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
            <h1>Cadastrar Empresa</h1>
            <p>Preencha os dados e envie os documentos necessários.</p>
          </div>
        </section>

        <div className="empresa-grid">
          <form
            id="empresa-form"
            className="empresa-card empresa-card--form"
            onSubmit={handleSubmit}
          >
            <div className="empresa-card-header">
              <h2>Dados da Empresa</h2>
            </div>

            <label className="empresa-field">
              <span>Razao Social *</span>
              <input
                id="razao-social"
                type="text"
                placeholder="Digite a razao social da empresa"
                value={formData.razaoSocial}
                onChange={handleChange('razaoSocial')}
                required
              />
            </label>

            <label className="empresa-field">
              <span>CNPJ *</span>
              <input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={handleChange('cnpj')}
                maxLength={18}
                required
              />
            </label>

            <label className="empresa-field">
              <span>Regime Tributario *</span>
              <select
                id="regime-tributario"
                value={formData.regimeTributario}
                onChange={handleChange('regimeTributario')}
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

            <div className="empresa-toggle-group">
              <span>Possui funcionarios? *</span>
              <div className="empresa-toggle-options">
                <label
                  className={`empresa-toggle-option ${formData.possuiFuncionarios === 'sim' ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="possuiFuncionarios"
                    value="sim"
                    checked={formData.possuiFuncionarios === 'sim'}
                    onChange={handleChange('possuiFuncionarios')}
                    required
                  />
                  Sim
                </label>
                <label
                  className={`empresa-toggle-option ${formData.possuiFuncionarios === 'nao' ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="possuiFuncionarios"
                    value="nao"
                    checked={formData.possuiFuncionarios === 'nao'}
                    onChange={handleChange('possuiFuncionarios')}
                  />
                  Nao
                </label>
              </div>
            </div>

            <div className="empresa-toggle-group">
              <span>Possui notas de vendas? *</span>
              <div className="empresa-toggle-options">
                <label
                  className={`empresa-toggle-option ${formData.possuiNotasVenda === 'sim' ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="possuiNotasVenda"
                    value="sim"
                    checked={formData.possuiNotasVenda === 'sim'}
                    onChange={handleChange('possuiNotasVenda')}
                    required
                  />
                  Sim
                </label>
                <label
                  className={`empresa-toggle-option ${formData.possuiNotasVenda === 'nao' ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="possuiNotasVenda"
                    value="nao"
                    checked={formData.possuiNotasVenda === 'nao'}
                    onChange={handleChange('possuiNotasVenda')}
                  />
                  Nao
                </label>
              </div>
            </div>

            <div className="empresa-toggle-group">
              <span>Presta servicos? *</span>
              <div className="empresa-toggle-options">
                <label
                  className={`empresa-toggle-option ${formData.prestaServicos === 'sim' ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="prestaServicos"
                    value="sim"
                    checked={formData.prestaServicos === 'sim'}
                    onChange={handleChange('prestaServicos')}
                    required
                  />
                  Sim
                </label>
                <label
                  className={`empresa-toggle-option ${formData.prestaServicos === 'nao' ? 'is-selected' : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="prestaServicos"
                    value="nao"
                    checked={formData.prestaServicos === 'nao'}
                    onChange={handleChange('prestaServicos')}
                  />
                  Nao
                </label>
              </div>
            </div>
            <div className="empresa-actions">
              <button type="submit" className="empresa-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
              </button>
              <button type="button" className="empresa-secondary">Cancelar</button>
            </div>
          </form>

          <section className="empresa-card empresa-card--docs">
            <h2>Documentos Necessários</h2>
            <p>Envie os documentos abaixo para validarmos sua empresa.</p>
            <ul className="empresa-doc-list">
              <li>
                <div>
                  <strong>Contrato Social ou Estatuto Social</strong>

                  <span>
                    {documentos.contratoSocial
                      ? documentos.contratoSocial.name
                      : 'PDF ou JPG - ate 10MB'}
                  </span>
                </div>

                <div className="empresa-doc-actions">
                  <label className="empresa-upload-button">
                    +

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={handleFileChange('contratoSocial')}
                    />
                  </label>

                  <span className="empresa-status">
                    {documentos.contratoSocial ? 'Anexado' : 'Pendente'}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Comprovante de Inscricao e Situacao Cadastral (CNPJ)</strong>

                  <span>
                    {documentos.comprovanteCnpj
                      ? documentos.comprovanteCnpj.name
                      : 'PDF ou JPG - ate 10MB'}
                  </span>
                </div>

                <div className="empresa-doc-actions">
                  <label className="empresa-upload-button">
                    +

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={handleFileChange('comprovanteCnpj')}
                    />
                  </label>

                  <span className="empresa-status">
                    {documentos.comprovanteCnpj ? 'Anexado' : 'Pendente'}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Documento de Identificacao do(s) Socio(s)</strong>

                  <span>
                    {documentos.documentoSocios
                      ? documentos.documentoSocios.name
                      : 'PDF ou JPG - ate 10MB'}
                  </span>
                </div>

                <div className="empresa-doc-actions">
                  <label className="empresa-upload-button">
                    +

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={handleFileChange('documentoSocios')}
                    />
                  </label>

                  <span className="empresa-status">
                    {documentos.documentoSocios ? 'Anexado' : 'Pendente'}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Comprovante de Endereco</strong>

                  <span>
                    {documentos.comprovanteEndereco
                      ? documentos.comprovanteEndereco.name
                      : 'PDF ou JPG - ate 10MB'}
                  </span>
                </div>

                <div className="empresa-doc-actions">
                  <label className="empresa-upload-button">
                    +

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={handleFileChange('comprovanteEndereco')}
                    />
                  </label>

                  <span className="empresa-status">
                    {documentos.comprovanteEndereco ? 'Anexado' : 'Pendente'}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Ultimo Balanco ou Demonstracao Contabil</strong>

                  <span>
                    {documentos.balancoContabil
                      ? documentos.balancoContabil.name
                      : 'PDF ou JPG - ate 10MB'}
                  </span>
                </div>

                <div className="empresa-doc-actions">
                  <label className="empresa-upload-button">
                    +

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={handleFileChange('balancoContabil')}
                    />
                  </label>

                  <span className="empresa-status">
                    {documentos.balancoContabil ? 'Anexado' : 'Pendente'}
                  </span>
                </div>
              </li>
            </ul>
            <div className="empresa-datas">
              <label className="empresa-field">
                <span>Data estimada da entrega dos documentos *</span>

                <input
                  type="date"
                  form="empresa-form"
                  value={datasEntrega.dataEstimada}
                  onChange={handleDateChange('dataEstimada')}
                  required
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CadastroEmpresa;
