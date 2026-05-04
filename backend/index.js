const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

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

app.post('/empresa', (req, res) => {
   const {
    cnpj,
    razao_social,
    regime_tributario,
    possui_funcionarios,
    possui_notas_venda,
    presta_servicos,
    id_contador
  } = req.body;

  // validação básica
  if (!cnpj || !razao_social || !regime_tributario || !id_contador) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha os campos obrigatórios'
    });
  }

  const sql = `
    INSERT INTO empresa_cliente
    (cnpj, razao_social, regime_tributario,
     possui_funcionarios, possui_notas_venda,
     presta_servicos, id_contador)
    VALUES (?, ?, ?, ?, ?, ?, ?)
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
      id_contador
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

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});

//docker start mysql-contabilidade
//cd backend
//npx nodemon index.js