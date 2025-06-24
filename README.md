# Agendamento de Consultas Médicas

Repositório do projeto desenvolvido para a unidade curricular de Desenvolvimento Web 2 (DW2), ano letivo 2024/2025, na UMAIA. Desenvolvido pelo grupo `inf24dw2g36`.

## 🎯 Descrição do Tema

Este projeto consiste numa plataforma de agendamento de consultas médicas. Os utilizadores podem autenticar-se com a conta Google, agendar consultas com médicos disponíveis, consultar informações sobre especialidades e médicos, e os administradores podem gerir todos os recursos.

A API foi desenvolvida no Momento 1 com Node.js, Express e MySQL, protegida por autenticação OAuth2 com JWT. A aplicação cliente foi construída com ReactJS e consome os endpoints da API de forma protegida.

## 📁 Organização do Repositório

- [`/src`](./src): Código-fonte da API backend (Node.js + Express)
- [`/frontend`](./frontend): Código da aplicação cliente em React
- [`/sql`](./sql): Scripts SQL para criação e população da base de dados
- [`/doc`](./doc): Capítulos do relatório em Markdown
- [`docker-compose.yml`](./docker-compose.yml): Orquestração local de containers
- [`docker-compose_prod.yml`](./docker-compose_prod.yml): Versão para produção com imagens DockerHub
- [`README.md`](./README.md): Este documento

## 📄 Documento OpenAPI

A documentação da API encontra-se em formato OpenAPI (Swagger), especificando todos os endpoints REST, com autenticação, parâmetros, respostas e permissões.

- [openapi.json](./doc/openapi.json)

## 🖼️ Galeria

| Página Inicial | Login Google | Consultas do Admin | Consultas do Utilizador |
|----------------|--------------|---------------------|--------------------------|
| ![](./doc/img/home.png) | ![](./doc/img/login.png) | ![](./doc/img/admin-consultas.png) | ![](./doc/img/user-consultas.png) |

## 🛠️ Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [ReactJS](https://react.dev/)
- [Material UI (MUI)](https://mui.com/)
- [JWT](https://jwt.io/)
- [OAuth2 (Google)](https://developers.google.com/identity/protocols/oauth2)
- [Docker](https://www.docker.com/)
- [Swagger/OpenAPI](https://swagger.io/specification/)

## 📦 Bibliotecas e Ferramentas

- `jsonwebtoken`: autenticação por token
- `passport`, `passport-google-oauth20`: login Google
- `sequelize`: ORM para MySQL
- `cors`, `dotenv`, `axios`, etc.
- `react`, `react-dom`, `@mui/icons-material`, `@mui/material`

## 📚 Relatório

O relatório está organizado por capítulos em ficheiros Markdown na pasta `/doc`.

- [`doc/capitulo1.md`](./doc/capitulo1.md): Apresentação do projeto
- [`doc/capitulo2.md`](./doc/capitulo2.md): Recursos (API, Base de Dados, Auth)
- [`doc/capitulo3.md`](./doc/capitulo3.md): Produto (frontend + backend + docker)
- [`doc/capitulo4.md`](./doc/capitulo4.md): Apresentação e conclusões

## 👥 Elementos do Grupo

- João Pedro Freitas Gomes – nº045235 @joaoismai
- António Manuel Estrela Magriço de Oliveira – nº 044409 @A044409

---

