const { validationResult, matchedData } = require("express-validator");

const Category = require("../models/Category");
const Ad = require("../models/Ad");
const User = require("../models/User");
const State = require("../models/State");

const jimp = require("jimp");
const { v4: uuid } = require("uuid");

let addImg = async (buffer) => {
    let imgName = `${uuid()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`public/media/${imgName}`);
    return imgName;
};

module.exports = {
    getCategories: async (req, res) => {
        let cats = await Category.find({});

        let categories = [];

        for (const i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`,
            });
        }

        res.json({ categories });
        return;
    },
    addAction: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.mapped() });
            return;
        }

        const data = matchedData(req);
        const priceFormatted = parseFloat((data.price).replace('.', ''). replace(',', '.'));

        let user = await User.findOne({ token: data.token });

        let newAd = new Ad({
            idUser: user._id,
            state: user.state,
            category: data.category,
            dateCreated: new Date(),
            title: data.title,
            price: priceFormatted,
            priceNegotiable: data.priceNegotiable == "true" ? true : false,
            description: data.description,
            views: 0,
            status: true,
        });

        if (req.files && req.files.img) {
            if (req.files.img.length === undefined) {
                if (
                    ["image/jpeg", "image/png", "image/jpg"].includes(
                        req.files.img.mimetype
                    )
                ) {
                    let nameImg = await addImg(req.files.img.tempFilePath);
                    newAd.images.push({
                        name: nameImg,
                        imgDefault: false,
                    });
                } else {
                    res.json({ error: "Formato de arquivo inválido." });
                    return;
                }
            } else {
                for (let i = 0; i < req.files.img.length; i++) {
                    if (
                        ["image/jpeg", "image/png", "image/jpg"].includes(
                            req.files.img[i].mimetype
                        )
                    ) {
                        let nameImg = await addImg(req.files.img[i].tempFilePath);
                        newAd.images.push({
                            name: nameImg,
                            imgDefault: false,
                        });
                    } else {
                        res.json({ error: "Formato de arquivo inválido." });
                        return;
                    }
                }
            }
        }

        if(newAd.images.length > 0){
            newAd.images[0].imgDefault = true;
        }

        const info = await newAd.save();
        res.json({ id: info._id });
    },
    getList: async (req, res) => {
        let {state, category, queryTitle, order = 'asc', offset = 0, limit = 10} = req.query;
        let filters = {status: true};
        let total = 0;

        if(state){
            let s = await State.findOne({name: state.toUpperCase()}).exec();
            if(s){
                filters.state = s._id.toString();
            }
        }

        if(category){
            let c = await Category.findOne({slug: category.toLowerCase()}).exec();
            if(c){
                filters.category = c._id.toString();
            }
        }

        if(queryTitle){
            filters.title = {$regex: queryTitle, $options: 'i'};
        }

        const adsTotal = await Ad.find(filters).exec();
        total = adsTotal.length;

        const adsData = await Ad.find(filters).sort({title: (order=='asc') ? 1 : -1}).skip(parseInt(offset)).limit(parseInt(limit)).exec();

        let ads = [];
        for (const i in adsData) {
            let image;

            let imgDefault = adsData[i].images.find(img => img.imgDefault);
            
            if(imgDefault){
                image = `${process.env.BASE}/media/${imgDefault.name}`
            }else{
                image = `${process.env.BASE}/media/default.jpg`
            }

            ads.push({
                id: adsData[i].id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image
            });
        }
        res.json({ads, total});
        return;
    },
    getItem: async (req, res) => {},
    editAction: async (req, res) => {},
};
