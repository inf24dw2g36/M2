# Agendamento de Consultas Médicas

Repositório do projeto desenvolvido para a unidade curricular de Desenvolvimento Web 2 (DW2), ano letivo 2024/2025, na UMAIA. Desenvolvido pelo grupo `inf24dw2g36`.

## 🎯 Descrição do Tema

Este projeto consiste numa plataforma de agendamento de consultas médicas. Os utilizadores podem autenticar-se com a conta Google, agendar consultas com médicos disponíveis, consultar informações sobre especialidades e médicos, e os administradores podem gerir todos os recursos.

A API foi desenvolvida no Momento 1 com Node.js, Express e MySQL, protegida por autenticação OAuth2 com JWT. A aplicação cliente foi construída com ReactJS e consome os endpoints da API de forma protegida.

## 📁 Organização do Repositório

- **pasta src** - Código-fonte da API backend (Node.js + Express)
- **pasta frontend** - Código da aplicação cliente em React
- **pasta sql** - Scripts SQL para criação e população da base de dados
  
## 📄 Documento OpenAPI

A documentação da API encontra-se em formato OpenAPI (Swagger), especificando todos os endpoints REST, com autenticação, parâmetros, respostas e permissões.

👉 [API de Agendamento de Consultas.postman_collection.json](./M2-main/M1-main/PostmanCollection/API%20de%20Agendamento%20de%20Consultas.postman_collection.json)

## 🖼️ Galeria

| Funcionalidade | Imagem |
| --- | ----------- |
| Página Inicial |  ![Login](/galeria/PaginaInicial.png) |
| Login Google |  ![Users](/galeria/LoginGoogle.png) |
| Consultas do Admin |  ![Doctors](/galeria/ConsultasAdmin.png) |
| Consultas do Utilizador |  ![Appointments](/galeria/Consultas_do_Utilizador.png) |

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

### Apresentação do Projeto
* Capítulo 1: [Apresentação o Projeto](docs/c1.md)

### Recursos
* Capítulo 2: [Recursos](docs/c2.md)

### Produto
* Capítulo 3: [Produto](docs/c3.md)

### Apresentação
* Capitulo 4: [Apresentação do trabalho](docs/c4.md)

## Link's dos repositórios do Docker Hub

### DEV
- **nodejs** - docker pull inf24dw1g36/node:dw2.m2
- **mysql** - docker pull inf24dw1g36/mysql:dw2.m2

### PROD
- **nodejs** - docker pull inf24dw1g36/node:dw2.m2prod
- **mysql** -docker pull inf24dw1g36/mysql:dw2.m2prod

## 👥 Elementos do Grupo

- João Pedro Freitas Gomes – nº045235 @joaoismai
- António Manuel Estrela Magriço de Oliveira – nº 044409 @A044409

---

