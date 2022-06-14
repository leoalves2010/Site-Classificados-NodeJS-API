// importação do mongoose com a conexão ao banco de dados
const mongoose = require('mongoose');

// importação do Schema para criação dos nossos esquemas e models
const { Schema } = mongoose;

// criação do Schema de 'Category'
const categorySchema = new Schema({
    name: String,
    slug: String
});

// nome do Model: 'Category'
const categoryModel = 'Category';

// verifica se o Schema já existe dentro da conexão
// caso exista ele apenas re-exporta o mesmo Schema já existente
// caso NÃO exista então ele exporta este novo Schema para dentro da conexão
if(mongoose.connection && mongoose.connection.models[categoryModel]){
    module.exports = mongoose.connection.models[categoryModel];
}else{
    module.exports = mongoose.model(categoryModel, categorySchema);
}