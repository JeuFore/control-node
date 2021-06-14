const TOKEN = require('../const/token');

exports.checkValidToken = (req, res, next) => {
    if (!TOKEN || req.headers.authorization !== TOKEN)
        return res.status(401).send({
            type: 'error',
            message: 'invalid token'
        });
    next();
}