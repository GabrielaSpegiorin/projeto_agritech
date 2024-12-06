const { Pool } = require('pg');

const BD = new Pool ({
    connectionString: process.env.DATABASE_URL,
    // user: 'postgres', //Nome de usuário do banco de dados
    // host: 'localhost', //Endereço do servidor
    // database: 'projeto_agritech', //Nome do banco de dados
    // password: 'admin', //Senha do banco de dados
    // port: '5432', //Porta de conexão do servidor 
}) 

module.exports = BD
