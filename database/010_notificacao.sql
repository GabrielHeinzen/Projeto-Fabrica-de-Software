USE sistema_cont;

CREATE TABLE notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(30),
    mensagem TEXT,
    data_envio_email DATE,

    id_contador INT NOT NULL,

    CONSTRAINT fk_notificacao_contador
        FOREIGN KEY (id_contador)
        REFERENCES contador(id_contador)
);