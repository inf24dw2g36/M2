
![UMAIA|Logo](/galeria/umaia.png)

# **Desenvolvimento Web II**
## Apresentação do projeto

- Nome do Projeto: Agenda para marcação de consultas.
- Objetivo Principal: Desenvolvimento de uma plataforma para agendamento online de consultas médicas
- Contexto: Trabalho desenvolvido no âmbito da disciplina de "Desenvolvimento Web II".
- Desenvolvido pelo Grupo 32: [@António Oliveira](https://github.com/@A044409), [@Antóno Filipe](https://github.com/AmFilipe) e [@João Gomes](https://github.com/joaoismai).

## Descrição Resumida do Tema

Este projeto consiste no desenvolvimento de uma API REST para uma plataforma de marcação de consultas médicas online. A aplicação permite a gestão de utilizadores, médicos, especialidades e marcações, com suporte a autenticação via OAuth 2.0 (Google Login) e autorização baseada em tokens JWT.

## Organização do repositório

O repositório está organizado da seguinte forma:
- **pasta Docs** - Capitulos com descrição do trabalho
- **pasta Galeria** - Contém imagens utilizados nos ficheiros Markedown
- **pasta Agenda** - Contém ficheiros Yaml, Ficheiros js das Routes, ficheiros js dos Models, Configuração do Middleware , Base Dados, respectivos dockerfile, docker-compose
- **pasta PostmanCollection**: Arquivo com a Collection do Postman para testar os endpoints da API.


## Testes com Postman

Na pasta `/postmanCollection` encontra-se a **coleção `.json`** com todos os endpoints da API prontos a serem testados via Postman.

## Galeria

| Funcionalidade | Imagem |
| --- | ----------- |
| Login |  ![Login](/galeria/login.png) |
| Users |  ![Users](/galeria/users.png) |
| Doctors |  ![Doctors](/galeria/doctors.png) |
| Appointments |  ![Appointments](/galeria/appointments.png) |
| Specialties |  ![Specialties](/galeria/specialties.png) |

## Tecnologias

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [OAuth 2.0](https://oauth.net/2/)
- [Docker & Docker Compose](https://www.docker.com/)
- [Postman](https://www.postman.com/)
- [OpenAPI 3.0](https://swagger.io/specification/)

### Frameworks e Bibliotecas

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Passport](https://www.passportjs.org/concepts/authentication/strategies/)

## Relatório

### Apresentação do Projeto
* Capítulo 1: [Apresentação o Projeto](docs/c1.md)

### Recursos
* Capítulo 2: [Recursos](docs/c2.md)

### Produto
* Capítulo 3: [Produto](docs/c3.md)

### Apresentação
* Capitulo 4: [Apresentação do trabalho](docs/c4.md)
---
## Link's dos repositórios do Docker Hub

### DEV
- **nodejs** - docker pull inf24dw1g32/node:dw2.m1
- **mysql** - docker pull inf24dw1g32/mysql:dw2.m1

### PROD
- **nodejs** - docker pull inf24dw1g32/node:dw2.m1prod
- **mysql** -docker pull inf24dw1g32/mysql:dw2.m1prod


## Elementos do Grupo
- António Manuel Estrela Magriço de Oliveira – nº 044409 @A044409
- António Manuel Ferreira Lopes dos Santos Filipe - nº 044351 @AmFilipe
- João Pedro Freitas Gomes – nº045235 @joaoismai
