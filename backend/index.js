const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
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
  const { cnpj, razao_social } = req.body;

  const sql = 'INSERT INTO empresa (cnpj, razao_social) VALUES (?, ?)';

  db.query(sql, [cnpj, razao_social], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao cadastrar empresa');
    }

    res.send('Empresa cadastrada com sucesso!');
  });
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});

//docker start mysql-contabilidade
//cd backend
//npx nodemon index.js