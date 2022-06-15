const User = require('../models/User');

module.exports = {
    private: async (req, res, next) => {
        let token = req.body.token || req.query.token;

        if(token){
            const user = await User.findOne({token});
            if(user) return next();
        }

        res.json({notAllowed: true});
        return;
    }
}