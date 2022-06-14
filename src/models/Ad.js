// importação do mongoose com a conexão ao banco de dados
const mongoose = require('mongoose');

// importação do Schema para criação dos nossos esquemas e models
const { Schema } = mongoose;

// criação do Schema de 'Ad'
const adSchema = new Schema({
    idUser: String,
    state: String,
    category: String,
    images: [Object],
    dateCreated: Date,
    title: String,
    price: Number,
    priceNegotiable: Boolean,
    description: String,
    views: Number,
    status: String
});

// nome do Model: 'Ad'
const adModel = 'Ad';

// verifica se o Schema já existe dentro da conexão
// caso exista ele apenas re-exporta o mesmo Schema já existente
// caso NÃO exista então ele exporta este novo Schema para dentro da conexão
if(mongoose.connection && mongoose.connection.models[adModel]){
    module.exports = mongoose.connection.models[adModel];
}else{
    module.exports = mongoose.model(adModel, adSchema);
}