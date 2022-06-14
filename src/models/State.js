// importação do mongoose com a conexão ao banco de dados
const mongoose = require('mongoose');

// importação do Schema para criação dos nossos esquemas e models
const { Schema } = mongoose;

// criação do Schema de 'State'
const stateSchema = new Schema({
    name: String
});

// nome do Model: 'State'
const stateModel = 'State';

// verifica se o Schema já existe dentro da conexão
// caso exista ele apenas re-exporta o mesmo Schema já existente
// caso NÃO exista então ele exporta este novo Schema para dentro da conexão
if(mongoose.connection && mongoose.connection.models[stateModel]){
    module.exports = mongoose.connection.models[stateModel];
}else{
    module.exports = mongoose.model(stateModel, stateSchema);
}