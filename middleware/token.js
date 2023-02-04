require('dotenv').config();

const TOKEN = process.env.TOKEN;

module.exports = (req, res, next) => {
    if (!TOKEN || req.headers.authorization !== TOKEN)
        return res.status(401).send({
            type: 'error',
            message: 'Unauthorized'
        });
    next();
}