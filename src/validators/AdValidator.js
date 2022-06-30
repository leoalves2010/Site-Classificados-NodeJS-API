const { checkSchema } = require("express-validator");

module.exports = {
    addActions: checkSchema({
        token: {
            notEmpty: true,
        },
        category: {
            trim: true,
            isLength: {
                options: { min: 12 },
            },
            errorMessage: `Category ID should be at least 12 chars long`,
        },
        title: {
            trim: true,
            isLength: {
                options: { min: 3 },
            },
            errorMessage: `Title should be at least 3 chars long`,
        },
        price: {
            trim: true,
            notEmpty: true,
            errorMessage: `Price field is required`,
        },
        priceNegotiable: {
            optional: true,
        },
        description: {
            trim: true,
            isLength: {
                options: { min: 10 },
            },
            errorMessage: `Description should be at least 10 chars long`,
        },
    }),
};
