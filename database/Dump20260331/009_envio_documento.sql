USE sistema_cont;

CREATE TABLE envio_documento (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    mes_referencia DATE NOT NULL,
    data_envio DATE,
    status VARCHAR(20) DEFAULT 'PENDENTE',

    id_cliente INT NOT NULL,
    id_tipo_documento INT NOT NULL,

    CONSTRAINT fk_envio_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente),

    CONSTRAINT fk_envio_tipo_doc
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipo_documento(id_tipo_documento)
);