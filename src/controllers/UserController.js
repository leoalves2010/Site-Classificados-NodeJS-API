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
        
    }
}