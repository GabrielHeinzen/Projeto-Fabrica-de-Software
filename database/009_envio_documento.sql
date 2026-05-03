USE sistema_cont;

DROP TABLE IF EXISTS envio_documento;

CREATE TABLE envio_documento (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    mes_referencia DATE NOT NULL,
    data_envio DATE,
    status VARCHAR(20) DEFAULT 'PENDENTE',

    id_cliente INT NOT NULL,
    id_tipo_documento INT NOT NULL,

    CONSTRAINT fk_enviodoc_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES empresa_cliente(id_cliente),

    CONSTRAINT fk_enviodoc_tipodoc
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipo_documento(id_tipo_documento)
) ENGINE=InnoDB;