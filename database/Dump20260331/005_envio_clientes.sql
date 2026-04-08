USE sistema_cont;

CREATE TABLE envio_cliente(
id_envio_cliente INT PRIMARY KEY AUTO_INCREMENT,
data_envio DATE NOT NULL,
mes_referencia DATE NOT NULL,
situacao ENUM('ENVIADO','NAO_ENVIADO')
DEFAULT 'NAO_ENVIADO',
FOREIGN KEY (id_cliente) REFERENCES empresa_cliente(id_cliente)
);