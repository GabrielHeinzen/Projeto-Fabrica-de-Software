const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();


const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não informado'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuario;
    next();
  } catch (erro) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token expirado ou inválido'
    });
  }
}

app.use('/uploads', express.static('uploads'));

const fs = require('fs');

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + file.originalname;
    cb(null, nomeUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'application/pdf',
    'image/jpeg'
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas PDF e JPG são permitidos'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((erro) => {
  if (erro) {
    console.log('Erro ao conectar no banco');
    console.log(erro);
  } else {
    console.log('Banco conectado 🚀');
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const sql = `
    SELECT * FROM contador
    WHERE email = ? AND senha_login = ?
  `;

  db.query(sql, [email, senha], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor'
      });
    }

    if (resultado.length > 0) {
      const token = jwt.sign(
        {
          id: resultado[0].id_contador,
          nome: resultado[0].Nome,
          email: resultado[0].email
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        sucesso: true,
        usuario: resultado[0].Nome,
        token
      });
    } else {
      res.status(401).json({
        sucesso: false,
        mensagem: 'Email ou senha inválidos'
      });
    }
  });
});

app.post('/register', (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha os campos obrigatorios'
    });
  }

  const emailNormalizado = email.trim().toLowerCase();

  const checkSql = 'SELECT id_contador FROM contador WHERE email = ? LIMIT 1';

  db.query(checkSql, [emailNormalizado], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor'
      });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Email ja cadastrado'
      });
    }

    const insertSql = `
      INSERT INTO contador (Nome, email, senha_login, telefone)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [nome.trim(), emailNormalizado, senha, telefone || null],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar usuario'
          });
        }

        res.status(201).json({
          sucesso: true,
          mensagem: 'Cadastro realizado com sucesso',
          id_contador: result.insertId
        });
      }
    );
  });
});

app.get('/contador', (req, res) => {
  const sql = `
    SELECT id_contador, Nome AS nome, email, telefone
    FROM contador
    ORDER BY Nome
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar contadores'
      });
    }

    res.json(result);
  });
});

app.get('/contador/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id_contador, Nome AS nome, email, telefone
    FROM contador
    WHERE id_contador = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar contador'
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Contador nao encontrado'
      });
    }

    return res.json({
      sucesso: true,
      contador: result[0]
    });
  });
});

app.delete('/contador/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM contador WHERE id_contador = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao deletar contador'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Contador nao encontrado'
      });
    }

    return res.json({
      sucesso: true,
      mensagem: 'Contador excluido com sucesso'
    });
  });
});

app.put('/contador/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha os campos obrigatorios'
    });
  }

  const emailNormalizado = email.trim().toLowerCase();
  const senhaNormalizada = typeof senha === 'string' ? senha.trim() : '';

  const checkSql = `
    SELECT id_contador
    FROM contador
    WHERE email = ? AND id_contador <> ?
    LIMIT 1
  `;

  db.query(checkSql, [emailNormalizado, id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor'
      });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Email ja cadastrado'
      });
    }

    let updateSql = `
      UPDATE contador
      SET Nome = ?,
          email = ?,
          telefone = ?
    `;
    const params = [nome.trim(), emailNormalizado, telefone || null];

    if (senhaNormalizada) {
      updateSql += ', senha_login = ?';
      params.push(senhaNormalizada);
    }

    updateSql += ' WHERE id_contador = ?';
    params.push(id);

    db.query(updateSql, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao atualizar contador'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Contador nao encontrado'
        });
      }

      return res.json({
        sucesso: true,
        mensagem: 'Contador atualizado com sucesso'
      });
    });
  });
});

app.post('/empresa', (req, res) => {
  const {
    cnpj,
    razao_social,
    regime_tributario,
    possui_funcionarios,
    possui_notas_venda,
    presta_servicos
  } = req.body;

  if (!cnpj || !razao_social || !regime_tributario) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha os campos obrigatórios'
    });
  }

  const sql = `
    INSERT INTO empresa_cliente
    (cnpj, razao_social, regime_tributario,
     possui_funcionarios, possui_notas_venda,
     presta_servicos)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [cnpj, razao_social, regime_tributario, possui_funcionarios, possui_notas_venda, presta_servicos],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao cadastrar empresa'
        });
      }

      res.json({
        sucesso: true,
        mensagem: 'Empresa cadastrada com sucesso',
        id_empresa: result.insertId
      });
    }
  );
});

app.get('/empresa', (req, res) => {
  const sql = 'SELECT * FROM empresa_cliente';

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar empresas'
      });
    }

    res.json(result);
  });
});

app.delete('/empresa/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM empresa_cliente WHERE id_cliente = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao deletar empresa'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Empresa não encontrada'
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Empresa deletada com sucesso'
    });
  });
});

app.put('/empresa/:id', (req, res) => {
  const { id } = req.params;

  const {
    cnpj,
    razao_social,
    regime_tributario,
    possui_funcionarios,
    possui_notas_venda,
    presta_servicos
  } = req.body;

  if (!cnpj || !razao_social || !regime_tributario) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha os campos obrigatórios'
    });
  }

  const sql = `
    UPDATE empresa_cliente
    SET 
      cnpj = ?,
      razao_social = ?,
      regime_tributario = ?,
      possui_funcionarios = ?,
      possui_notas_venda = ?,
      presta_servicos = ?
    WHERE id_cliente = ?
  `;

  db.query(
    sql,
    [cnpj, razao_social, regime_tributario, possui_funcionarios, possui_notas_venda, presta_servicos, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao atualizar empresa'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Empresa não encontrada'
        });
      }

      res.json({
        sucesso: true,
        mensagem: 'Empresa atualizada com sucesso'
      });
    }
  );
});

const { calcularProximoVencimento } = require('./utils/periodicidade');

app.post('/empresa/:id/documentos', upload.single('documento'), (req, res) => {
  const { id } = req.params;
  const { id_tipo_documento } = req.body;

  if (!req.file) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Nenhum arquivo enviado'
    });
  }

  if (!id_tipo_documento) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Informe o tipo do documento'
    });
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const mesReferencia = new Date();
  const urlArquivo = `/uploads/${req.file.filename}`;
  const nomeArquivo = req.file.originalname;
  mesReferencia.setDate(1);
  const mesReferenciaFormatado = mesReferencia.toISOString().slice(0, 10);

  const sql = `
  INSERT INTO envio_documento
  (
    mes_referencia,
    data_envio,
    status,
    id_cliente,
    id_tipo_documento,
    nome_arquivo,
    url_arquivo
  )
  VALUES (?, ?, 'ENVIADO', ?, ?, ?, ?)
`;

 db.query(
  sql,
  [
    mesReferenciaFormatado,
    hoje,
    id,
    id_tipo_documento,
    nomeArquivo,
    urlArquivo
  ],
  (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao registrar envio do documento'
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Documento enviado com sucesso',
      id_envio: result.insertId,
      id_empresa: id,
      id_tipo_documento,
      status: 'ENVIADO'
    });
  });
});

app.get('/dashboard', autenticarToken, (req, res) => {
  const sql = `
    SELECT
      SUM(CASE WHEN status = 'ENVIADO' THEN 1 ELSE 0 END) AS total_enviados,
      SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) AS total_pendentes,
      COUNT(*) AS total_obrigacoes
    FROM envio_documento
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar dashboard',
        erro: err.message
      });
    }

    res.json(result[0]);
  });
});

app.get('/dashboard/empresas', autenticarToken, (req, res) => {
  const sql = `
    SELECT
      e.razao_social,
      SUM(CASE WHEN ed.status = 'ENVIADO' THEN 1 ELSE 0 END) AS enviados,
      SUM(CASE WHEN ed.status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendentes
    FROM empresa_cliente e
    LEFT JOIN envio_documento ed
      ON e.id_cliente = ed.id_cliente
    GROUP BY e.id_cliente, e.razao_social
    ORDER BY e.razao_social
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar dashboard empresas'
      });
    }

    res.json(result);
  });
});

app.get('/dashboard/obrigacoes', autenticarToken, (req, res) => {
  const sql = `
    SELECT
      td.nome,
      SUM(CASE WHEN ed.status = 'ENVIADO' THEN 1 ELSE 0 END) AS enviados,
      SUM(CASE WHEN ed.status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendentes
    FROM tipo_documento td
    LEFT JOIN envio_documento ed
      ON td.id_tipo_documento = ed.id_tipo_documento
    GROUP BY td.id_tipo_documento, td.nome
    ORDER BY td.nome
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar dashboard obrigações'
      });
    }

    res.json(result);
  });
});

const PORT = process.env.PORT || 3001;

app.get('/documentos', autenticarToken, (req, res) => {
  const sql = `
    SELECT 
      id_tipo_documento AS id,
      nome,
      dia_limite_envio,
      periodicidade
    FROM tipo_documento
    ORDER BY nome
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar documentos'
      });
    }

    res.json(result);
  });
});

app.post('/documentos', autenticarToken, (req, res) => {
  const { nome, data_limite, periodicidade } = req.body;

  if (!nome || !data_limite || !periodicidade) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha todos os campos obrigatórios'
    });
  }

  const sql = `
    INSERT INTO tipo_documento
    (nome, dia_limite_envio, periodicidade)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [nome, data_limite, periodicidade], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao cadastrar documento'
      });
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Documento cadastrado com sucesso',
      id: result.insertId
    });
  });
});

app.delete('/documentos/:id', autenticarToken, (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tipo_documento WHERE id_tipo_documento = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'Este documento possui envios vinculados e não pode ser excluído.'
        });
      }

      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao excluir documento'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Documento não encontrado'
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Documento excluído com sucesso'
    });
  });
});

// ✏️ NOVO — Editar documento
app.put('/documentos/:id', autenticarToken, (req, res) => {
  const { id } = req.params;
  const { nome, data_limite, periodicidade } = req.body;

  if (!nome || !data_limite || !periodicidade) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha todos os campos obrigatórios'
    });
  }

  const sql = `
    UPDATE tipo_documento
    SET nome = ?,
        dia_limite_envio = ?,
        periodicidade = ?
    WHERE id_tipo_documento = ?
  `;

  db.query(sql, [nome, data_limite, periodicidade, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar documento'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Documento não encontrado'
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Documento atualizado com sucesso'
    });
  });
});

async function verificarPrazosDocumentos() {
  console.log('Verificando documentos próximos do vencimento...');

  const sql = `
    SELECT
      ec.razao_social,
      td.nome,
      td.dia_limite_envio
    FROM envio_documento ed
    INNER JOIN empresa_cliente ec
      ON ec.id_cliente = ed.id_cliente
    INNER JOIN tipo_documento td
      ON td.id_tipo_documento = ed.id_tipo_documento
    WHERE ed.status = 'PENDENTE'
  `;

  db.query(sql, async (err, documentos) => {
    console.log('Documentos encontrados:', documentos.length);
    console.log(documentos);

    if (err) {
      console.error(err);
      return;
    }

    const hoje = new Date();

    for (const documento of documentos) {
      const vencimento = new Date(documento.dia_limite_envio);

      const diferencaDias = Math.ceil(
        (vencimento - hoje) / (1000 * 60 * 60 * 24)
      );

      console.log('Dias restantes:', diferencaDias);

      db.query('SELECT email FROM contador', async (erroEmails, contadores) => {
        if (erroEmails) {
          console.error(erroEmails);
          return;
        }

        const destinatarios = contadores.map(c => c.email);

        if (destinatarios.length === 0) return;

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: destinatarios.join(','),
            subject:
              diferencaDias === 7
                ? '⚠ Documento vence em 7 dias'
                : '🚨 Documento vence amanhã',
            text: `
Empresa: ${documento.razao_social}

Documento: ${documento.nome}

Prazo final:
${vencimento.toLocaleDateString('pt-BR')}

Dias restantes:
${diferencaDias}

Acesse o sistema para verificar os documentos pendentes.
            `
          });

          console.log(`Email enviado para documento ${documento.nome}`);
        } catch (erroEnvio) {
          console.error('Erro ao enviar email:', erroEnvio);
        }
      });
    }
  });
}

cron.schedule('0 0 * * *', () => {
  console.log('Executando rotina automática de notificações');
  verificarPrazosDocumentos();
});

verificarPrazosDocumentos();

app.get('/empresa/:id/documentos/status', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id_tipo_documento,
      status,
      data_envio
    FROM envio_documento
    WHERE id_cliente = ?
      AND mes_referencia = DATE_FORMAT(CURDATE(), '%Y-%m-01')
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar status dos documentos'
      });
    }

    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});