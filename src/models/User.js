// importação do mongoose com a conexão ao banco de dados
const mongoose =  require('mongoose');

// importação do Schema para criação dos nossos esquemas e models
const { Schema } = mongoose;

// criação do Schema de 'User'
const userSchema = new Schema({
    name: String,
    email: String,
    state: String,
    passwordHash: String,
    token: String
});

// nome do Model: 'User'
const userModel = 'User';

// verifica se o Schema já existe dentro da conexão
// caso exista ele apenas re-exporta o mesmo Schema já existente
// caso NÃO exista então ele exporta este novo Schema para dentro da conexão
if(mongoose.connection && mongoose.connection.models[userModel]){
    module.exports = mongoose.connection.models[userModel];
}else{
    module.exports = mongoose.model(userModel, userSchema);
}