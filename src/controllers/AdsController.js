const { validationResult, matchedData } = require("express-validator");
const fs = require("fs").promises;

const mongoose = require("mongoose");

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

let delImgs = async (ad) => {
    for (const i in ad.images) {
        await fs.unlink(`public/media/${ad.images[i].name}`, function (err) {
            if (err) throw err;
            return;
        });
    }
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
        const priceFormatted = parseFloat(
            data.price.replace(".", "").replace(",", ".")
        );

        let user = await User.findOne({ token: data.token });
        let cat = '';

        if(mongoose.isValidObjectId(data.category.toString())){
            cat = await Category.findById({_id: data.category}).exec();

            if(!cat){
                res.json({ error: 'Categoria inexistente/inválida.' });
                return;
            }
        }else{
            res.json({ error: 'ID da categoria é inválido.' });
            return;
        }

        let newAd = new Ad({
            idUser: user._id,
            state: user.state,
            category: cat._id.toString(),
            dateCreated: new Date(),
            title: data.title,
            price: priceFormatted,
            priceNegotiable: data.priceNegotiable == "true" ? true : false,
            description: data.description,
            views: 0,
            status: true,
        });

        if (req.files && req.files.images) {
            if (req.files.images.length === undefined) {
                if (
                    ["image/jpeg", "image/png", "image/jpg"].includes(
                        req.files.images.mimetype
                    )
                ) {
                    let nameImg = await addImg(req.files.images.tempFilePath);
                    newAd.images.push({
                        name: nameImg,
                        imgDefault: false,
                    });
                } else {
                    res.json({ error: "Formato de arquivo inválido." });
                    return;
                }
            } else {
                for (let i = 0; i < req.files.images.length; i++) {
                    if (
                        ["image/jpeg", "image/png", "image/jpg"].includes(
                            req.files.images[i].mimetype
                        )
                    ) {
                        let nameImg = await addImg(
                            req.files.images[i].tempFilePath
                        );
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

        if (newAd.images.length > 0) {
            newAd.images[0].imgDefault = true;
        }

        const info = await newAd.save();
        res.json({ id: info._id });
    },
    getList: async (req, res) => {
        let {
            state,
            category,
            queryTitle,
            order = "asc",
            offset = 0,
            limit = 10,
        } = req.query;
        let filters = { status: true };
        let total = 0;

        if (state) {
            let s = await State.findOne({ name: state.toUpperCase() }).exec();
            if (s) {
                filters.state = s._id.toString();
            }
        }

        if (category) {
            let c = await Category.findOne({
                slug: category.toLowerCase(),
            }).exec();
            if (c) {
                filters.category = c._id.toString();
            }
        }

        if (queryTitle) {
            filters.title = { $regex: queryTitle, $options: "i" };
        }

        const adsTotal = await Ad.find(filters).exec();
        total = adsTotal.length;

        const adsData = await Ad.find(filters)
            .sort({ title: order == "asc" ? 1 : -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();

        let ads = [];
        for (const i in adsData) {
            let image;

            let imgDefault = adsData[i].images.find((img) => img.imgDefault);

            if (imgDefault) {
                image = `${process.env.BASE}/media/${imgDefault.name}`;
            } else {
                image = `${process.env.BASE}/media/default.jpg`;
            }

            ads.push({
                id: adsData[i].id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image,
            });
        }
        res.json({ ads, total });
        return;
    },
    getItem: async (req, res) => {
        let id = req.params.id;
        let other = req.query.other || null;

        if (id && mongoose.isValidObjectId(id)) {
            let ad = await Ad.findOne({ status: true, _id: id }).exec();

            if (ad) {
                let user = await User.findById({ _id: ad.idUser }).exec();
                let state = await State.findById({ _id: ad.state }).exec();
                let category = await Category.findById({
                    _id: ad.category,
                }).exec();

                let images = [];

                for (const i in ad.images) {
                    images.push(
                        `${process.env.BASE}/media/${ad.images[i].name}`
                    );
                }

                ad.views++;
                await ad.save();

                let others = [];

                if (other) {
                    let otherData = await Ad.find({
                        status: true,
                        idUser: ad.idUser,
                    }).exec();

                    for (const i in otherData) {
                        if (otherData[i]._id.toString() != ad._id.toString()) {
                            let image = `${process.env.BASE}/media/default.jpg`;
                            let imgDefault = otherData[i].images.find(
                                (img) => img.imgDefault
                            );

                            if (imgDefault) {
                                image = `${process.env.BASE}/media/${imgDefault.name}`;
                            }

                            others.push({
                                id: otherData[i]._id,
                                title: otherData[i].title,
                                price: otherData[i].price,
                                priceNegotiable: otherData[i].priceNegotiable,
                                image,
                            });
                        }
                    }
                }

                res.json({
                    userInfo: {
                        name: user.name,
                        email: user.email,
                    },
                    id: ad._id,
                    state: state.name,
                    category: category,
                    images,
                    dateCreated: ad.dateCreated,
                    title: ad.title,
                    price: ad.price,
                    priceNegotiable: ad.priceNegotiable,
                    description: ad.description,
                    views: ad.views,
                    others,
                });
                return;
            } else {
                res.json({ error: "Anúncio não encontrado." });
                return;
            }
        } else {
            res.json({ error: "ID inválido/inexistente." });
            return;
        }
    },
    editAction: async (req, res) => {
        let { id } = req.params;
        let {
            category,
            title,
            price,
            priceNegotiable,
            description,
            status,
            token,
        } = req.body;

        if (id && mongoose.isValidObjectId(id)) {
            let ad = await Ad.findById(id).exec();
            if (ad) {
                let user = await User.findOne({ token }).exec();
                if (user && user._id.toString() === ad.idUser.toString()) {
                    let fieldsUpdates = {};

                    if (req.files && req.files.images) {
                        let { images } = req.files;
                        let imgs = [];

                        if (images.length === undefined) {
                            if (
                                [
                                    "image/jpeg",
                                    "image/png",
                                    "image/jpg",
                                ].includes(images.mimetype)
                            ) {
                                let nameImg = await addImg(images.tempFilePath);
                                imgs.push({
                                    name: nameImg,
                                    imgDefault: false,
                                });
                            } else {
                                res.json({
                                    error: "Formato de arquivo inválido.",
                                });
                                return;
                            }
                        } else {
                            for (let i = 0; i < images.length; i++) {
                                if (
                                    [
                                        "image/jpeg",
                                        "image/png",
                                        "image/jpg",
                                    ].includes(images[i].mimetype)
                                ) {
                                    let nameImg = await addImg(
                                        images[i].tempFilePath
                                    );
                                    imgs.push({
                                        name: nameImg,
                                        imgDefault: false,
                                    });
                                } else {
                                    res.json({
                                        error: "Formato de arquivo inválido.",
                                    });
                                    return;
                                }
                            }
                        }

                        if (imgs.length > 0) {
                            imgs[0].imgDefault = true;
                        }

                        await delImgs(ad);

                        fieldsUpdates.images = imgs;
                    }

                    if (category) {
                        let c = await Category.findOne({
                            slug: category.toLowerCase().trim(),
                        }).exec();
                        if (c) {
                            fieldsUpdates.category = c._id.toString();
                        } else {
                            res.json({
                                error: "Categoria inválida/não encontrada.",
                            });
                            return;
                        }
                    }

                    if (title) {
                        fieldsUpdates.title = title.trim();
                    }

                    if (price) {
                        priceFormatted = parseFloat(
                            price.replace(".", "").replace(",", ".")
                        );
                        fieldsUpdates.price = priceFormatted;
                    }

                    if (priceNegotiable) {
                        fieldsUpdates.priceNegotiable = priceNegotiable;
                    }

                    if (description) {
                        fieldsUpdates.description = description.trim();
                    }

                    if (status) {
                        fieldsUpdates.status = status;
                    }

                    await Ad.findByIdAndUpdate(id, {
                        $set: fieldsUpdates,
                    }).exec();

                    res.json({ success: "Anúncio modificado com sucesso." });
                    return;
                } else {
                    res.json({
                        error: "Anúncio não pertence ao usuário especificado.",
                    });
                    return;
                }
            } else {
                res.json({ error: "Anúncio não encontrado." });
                return;
            }
        } else {
            res.json({ error: "ID inválido/inexistente." });
            return;
        }
    },
};
