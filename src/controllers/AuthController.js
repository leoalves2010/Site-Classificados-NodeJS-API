const { validationResult, matchedData } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const State = require("../models/State");

module.exports = {
    signIn: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.mapped() });
            return;
        }

        const data = matchedData(req);

        // Validação do e-mail
        const user = await User.findOne({ email: data.email });
        if (user) {
            // Validação da senha
            const match = await bcrypt.compare(
                data.password,
                user.passwordHash
            );
            if (match) {
                // Realiza o login do usuário no sistema
                const payload = (Date.now() + Math.random()).toString();
                const token = await bcrypt.hash(payload, 10);

                user.token = token;
                await user.save();

                res.json({
                    email: user.email,
                    token: user.token,
                });
                return;
            }
        }

        // Retorno caso ocorra algum erro com a validação do e-mail e/ou senha informados pelo usuário
        res.json({ error: "E-mail e/ou senha inválidos." });
        return;
    },
    signUp: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.mapped() });
            return;
        }

        const data = matchedData(req);

        // Verifica se o usuário com o e-mail especificado já existe no sistema
        const user = await User.findOne({ email: data.email });
        if (user) {
            res.json({
                error: {
                    email: {
                        msg: "Este e-mail já possui cadastro no sistema.",
                    },
                },
            });
            return;
        }

        // Verifica se o 'Estado' informado pelo usuário no momento do cadastro existe no sistema.
        if (mongoose.isValidObjectId(data.state)) {
            const state = await State.findById({ _id: data.state });
            if (!state) {
                res.json({
                    error: {
                        state: {
                            msg: "O 'Estado' informado no cadastro é inválido/inexistente.",
                        },
                    },
                });
                return;
            }
        } else {
            res.json({
                error: {
                    state: {
                        msg: "Código de 'Estado' inválido",
                    },
                },
            });
            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            state: data.state,
            passwordHash: passwordHash,
            token: token,
        });

        await newUser.save((error, data) => {
            if (error) return handleError(error);
            res.json({
                id: data.id,
                token: data.token,
            });
            return;
        });
    },
};
