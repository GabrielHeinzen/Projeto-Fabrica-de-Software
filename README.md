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
