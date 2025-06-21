// Este ficheiro define as configurações de conexão à base de dados para diferentes ambientes.
// Ele carrega as variáveis de ambiente do seu ficheiro .env.

require('dotenv').config(); // Garante que as variáveis de ambiente são carregadas

module.exports = {
  development: {
    username: process.env.DB_USER,      // Lida do .env (root)
    password: process.env.DB_PASSWORD,  // Lida do .env (12345678)
    database: process.env.DB_NAME,      // Lida do .env (Scheduler)
    host: process.env.DB_HOST,          // Lida do .env (db - hostname do serviço Docker)
    dialect: 'mysql',                   // Tipo de base de dados
    logging: false,                     // Desativa o log das queries SQL na consola (opcional)
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'scheduler_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: 'mysql',
    logging: false,
  },
};
