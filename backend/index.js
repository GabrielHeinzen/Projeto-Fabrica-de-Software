const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'sistema_cont'
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