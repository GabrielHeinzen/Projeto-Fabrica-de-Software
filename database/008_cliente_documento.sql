USE sistema_cont;

CREATE TABLE cliente_documento (
    id_cliente_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_tipo_documento INT NOT NULL,

    CONSTRAINT fk_cd_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES empresa_cliente(id_cliente),

    CONSTRAINT fk_cd_tipo_doc
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipo_documento(id_tipo_documento)
) ENGINE=InnoDB;