USE sistema_cont;

create table setor(
  id_setor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL
);

INSERT INTO setor (nome) VALUES
('Fiscal'),
('Contábil'),
('RH');