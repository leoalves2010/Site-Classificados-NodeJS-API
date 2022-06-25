const { validationResult, matchedData } = require("express-validator");
const Category = require("../models/Category");
const Ad = require("../models/Ad");
const User = require("../models/User");
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

        let user = await User.findOne({ token: data.token });

        let newAd = new Ad({
            idUser: user._id,
            state: user.state,
            category: data.category,
            dateCreated: new Date(),
            title: data.title,
            price: data.price,
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
                    let img = await addImg(req.files.img.tempFilePath);
                    newAd.images.push({
                        img,
                        mainImg: false,
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
                        let img = await addImg(req.files.img[i].tempFilePath);
                        newAd.images.push({
                            img,
                            mainImg: false,
                        });
                    } else {
                        res.json({ error: "Formato de arquivo inválido." });
                        return;
                    }
                }
            }
        }

        const info = await newAd.save();
        res.json({ id: info._id });
    },
    getList: async (req, res) => {},
    getItem: async (req, res) => {},
    editAction: async (req, res) => {},
};
