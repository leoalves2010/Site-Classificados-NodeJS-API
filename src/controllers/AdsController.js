const Category = require('../models/Category');

module.exports = {
    getCategories: async (req, res) => {
        let cats = await Category.find({});

        let categories = [];

        for (const i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({categories});
        return;
    },
    addAction: async (req, res) => {

    },
    getList: async (req, res) => {

    },
    getItem: async (req, res) => {

    },
    editAction: async (req, res) => {
        
    }
}