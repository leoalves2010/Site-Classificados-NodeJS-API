const { checkSchema } = require('express-validator');

module.exports = {
    editAction: checkSchema({
        token: {
            notEmpty: true
        },
        name: {
            optional: true,
            trim: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: `Name should be at least 3 chars long`
        },
        email: {
            optional: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: `Email invalid`
        },
        password: {
            optional: true,
            trim: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: `Password should be at least 3 chars long`
        },
        state: {
            optional: true,
            notEmpty: true,
            errorMessage: `State can't be empty`
        }
    })
}