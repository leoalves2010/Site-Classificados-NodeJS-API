const AuthValidator = require('../validators/AuthValidator');
const { validationResult, matchedData } = require('express-validator');


module.exports = {
    signIn: async (req, res) => {

    },
    signUp: async (req, res) => {
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            res.json({errors: errors.mapped()});
            return;
        }
        
        const allData = matchedData(req);
        
        res.json({data: allData});
        return;
    }
}