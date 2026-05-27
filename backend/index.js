const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use('/uploads', express.static('uploads'));

//config multer
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
    fileSize: 10 * 1024 * 1024
  }
});




const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'sistema_cont'
});

db.connect((erro) => {
  if (erro) {
    console.log('Erro ao conectar no banco');
    console.log(erro);
  } else {
    console.log('Banco conectado 🚀');
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
      res.json({
        sucesso: true,
        usuario: resultado[0].Nome
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

  // validação básica
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
    [
      cnpj,
      razao_social,
      regime_tributario,
      possui_funcionarios,
      possui_notas_venda,
      presta_servicos
    ],
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
    [
      cnpj,
      razao_social,
      regime_tributario,
      possui_funcionarios,
      possui_notas_venda,
      presta_servicos,
      id
    ],
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

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});

app.post('/empresa/:id/documentos', upload.single('documento'), (req, res) => {
  const { id } = req.params;
  const { tipo_documento } = req.body;

  if (!req.file) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Nenhum arquivo enviado'
    });
  }

  if (!tipo_documento) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Informe o tipo do documento'
    });
  }

  const caminhoArquivo = `/uploads/${req.file.filename}`;

  res.json({
    sucesso: true,
    mensagem: 'Documento enviado com sucesso',
    id_empresa: id,
    tipo_documento: tipo_documento,
    arquivo: caminhoArquivo
  });
});

//docker start mysql-contabilidade
//cd backend
//npx nodemon index.js  