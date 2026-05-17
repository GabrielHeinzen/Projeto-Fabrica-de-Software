# Como rodar o projeto

## Banco de dados

Na raiz do projeto:
```
docker-compose up -d
```
Caso o banco esteja vazio, rodar:

```
for file in database/*.sql; do
  docker exec -i mysql_contabil mysql -u root -proot sistema_cont < "$file"
done
```
LISTA CONTADORES DO BANCO: 

```
docker exec -it mysql_contabil mysql -u root -proot -e "USE sistema_cont; SELECT * FROM contador;"
```
EXCLUI CONTADOR PELO ID:

```
docker exec -it mysql_contabil mysql -u root -proot -e "USE sistema_cont; DELETE FROM contador WHERE id_contador = ;"
```
LISTA EMPRESAS CADASTRADAS: 
```
docker exec -it mysql_contabil mysql -u root -proot -e "USE sistema_cont; SELECT * FROM empresa_cliente;"
```


---

## Backend

```
cd backend
npm install
npm start
```

---

## Frontend

```
cd front-end
npm install
npm run dev
```

---

## Codespaces

A porta 3001  deve estar Public.

Caso a URL mude, atualizar no arquivo:

front-end/src/components/Login/Login.jsx


na linha do fetch('/login').

---

## Git

```
git pull
```

Para salvar alterações:

```
git add .
git commit -m "mensagem"
git push
```

---

## Collection Postman

A collection utilizada para testes da API está disponível em:

`/postman/API Sistema Cont.postman_collection.json`

Para utilizar, basta abrir o Postman, clicar em **Import** e selecionar o arquivo.