USE sistema_cont;

CREATE TABLE documento_obrigatorio (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    nome_documento VARCHAR(100) NOT NULL,
    dia_limite_envio INT NOT NULL,

    id_setor INT NOT NULL,

    CONSTRAINT fk_documento_setor
        FOREIGN KEY (id_setor)
        REFERENCES setor(id_setor)
);