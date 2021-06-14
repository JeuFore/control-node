const axios = require('axios').default

async function httpRequest(url, method, data = {}) {
    let config = {
        method,
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data.body
    }
    if (data.apiKey)
        config.headers['Govee-API-Key'] = data.apiKey;
    return axios(config)
        .then(response => {
            return response.data;
        })
        .catch(e => {
            throw new Error('The server returned a negative response : ' + e.response.statusText);
        })
}

exports.httpRequest = httpRequest