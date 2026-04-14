USE sistema_cont;

INSERT INTO tipo_documento (nome, dia_limite_envio, id_setor, origem) VALUES
('DAS - Simples Nacional', 20, 1, 'CONTABILIDADE'),
('DIME', 10, 1, 'CONTABILIDADE'),
('EFD REINF', 15, 1, 'CONTABILIDADE'),
('SPED Fiscal', 15, 1, 'CONTABILIDADE'),
('DCTF', 15, 1, 'CONTABILIDADE'),
('ECF - Escrituração Contábil Fiscal', 31, 2, 'CONTABILIDADE'),
('ECD - Escrituração Contábil Digital', 31, 2, 'CONTABILIDADE'),
('SEFIP/FGTS', 7, 3, 'CONTABILIDADE');

INSERT INTO tipo_documento (nome, dia_limite_envio, id_setor, origem) VALUES
('Notas fiscais de venda', 5, 1, 'CLIENTE'),
('Notas fiscais de serviço', 5, 1, 'CLIENTE'),
('Notas fiscais de compra', 5, 1, 'CLIENTE'),
('Extrato bancário', 5, 2, 'CLIENTE'),
('Fatura de cartão de crédito', 5, 2, 'CLIENTE'),
('Folha de pagamento', 7, 3, 'CLIENTE'),
('Pró-labore', 7, 3, 'CLIENTE'),
('Admissões e demissões', 5, 3, 'CLIENTE'),
('Comprovantes de despesas', 5, 2, 'CLIENTE');