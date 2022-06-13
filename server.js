// variáveis de ambiente
require('dotenv').config();

// para criação do servidor
const express = require('express');

// para conexão com o banco de dados MongoDB
const mongoose = require('mongoose');

// para habilitar permissões de acesso às nossas APIs no navegador
const cors = require('cors');

// para auxiliar no upload de arquivos
const fileUpload = require('express-fileupload');

// para auxiliar no direcionamento da pasta pública do projeto
const path = require('path');

main().catch(err => console.log(err));

// conexão ao banco de dados
async function main() {
    await mongoose.connect(process.env.DATABASE);
}

// inicia o servidor
const server = express();

// habilita o cors para as permissões de acesso às APIs
server.use(cors());

// habilita o uso de JSON em nosso Express
server.use(express.json());

// habilita o envio de formulários HTML com POST/GET
server.use(express.urlencoded({extended: true}));

// habilita a dependência do express-fileupload
server.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// informa a pasta pública do nosso projeto
server.use(express.static(path.join(__dirname, '/public')));

// nossa primeira rota para teste do sistema
server.get('/ping', (req, res) => {
    res.json({pong: true});
});

// habilita e inicia o servidor na porta especificada no .env
server.listen(process.env.PORT, () => {
    console.log(`Servidor conectado com sucesso na porta ${process.env.PORT}`);
})
