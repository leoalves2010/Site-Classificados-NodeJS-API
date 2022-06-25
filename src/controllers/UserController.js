const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const State = require('../models/State');
const User = require('../models/User');
const Ad = require('../models/Ad');
const Category = require('../models/Category');

module.exports = {
    getStates: async (req, res) => {
        let states = await State.find();
        res.json({states});
    },
    getInfo: async (req, res) => {
        let token = req.query.token;
        let user = await User.findOne({token});
        let state = await State.findById(user.state);
        let ad = await Ad.find({idUser: user._id.toString()});

        let adList = [];

        for(let i in ad){
            let cat = await Category.findById(ad[i].category);
            
            adList.push({
                ...ad[i],
                category: cat.slug
            });
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            adList
        });
        return;
    },
    editAction: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.mapped() });
            return;
        }

        const data = matchedData(req);

        const updates = {}

        if(data.name){
            updates.name = data.name;
        }

        if(data.email){
            updates.email = data.email;
        }

        if(data.password){
            updates.password = await bcrypt.hash(data.password, 10);
        }

        if(data.state){
            if(mongoose.isValidObjectId(data.state)){
                const state = await State.findById({ _id: data.state });
                if (!state) {
                    res.json({error: "O 'Estado' informado no cadastro é inválido/inexistente."});
                    return;
                }
                updates.state = data.state;
            } else {
                res.json({error: "Código de 'Estado' inválido."});
                return;
            }
        }
        
        await User.findOneAndUpdate({token: data.token}, {$set: updates})
        
        res.json({});
        return;
    }
}