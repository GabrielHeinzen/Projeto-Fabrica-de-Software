USE sistema_cont;

CREATE TABLE envio_cliente(
    id_envio_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_envio DATE NOT NULL,
    mes_referencia DATE NOT NULL,
    situacao ENUM('ENVIADO','NAO_ENVIADO') DEFAULT 'NAO_ENVIADO',

    CONSTRAINT fk_envio_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES empresa_cliente(id_cliente)
) ENGINE=InnoDB;