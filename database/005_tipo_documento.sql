USE sistema_cont;

CREATE TABLE tipo_documento (
    id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    dia_limite_envio INT NOT NULL,
    id_setor INT NOT NULL,
    origem ENUM('CLIENTE','CONTABILIDADE') NOT NULL,

    CONSTRAINT fk_tipo_documento_setor
        FOREIGN KEY (id_setor)
        REFERENCES setor(id_setor)
);