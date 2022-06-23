const { checkSchema } = require('express-validator');

module.exports = {
    signUp: checkSchema({
        name: {
            trim: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: `Name should be at least 3 chars long`
        },
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: `Email invalid`
        },
        password: {
            trim: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: `Password should be at least 3 chars long`
        },
        state: {
            notEmpty: true,
            errorMessage: `State can't be empty`
        }
    }),
    signIn: checkSchema({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: `Email invalid`
        },
        password: {
            trim: true,
            isLength: {
                options: { min: 3 }
            },
            errorMessage: `Password should be at least 3 chars long`
        }
    })
}