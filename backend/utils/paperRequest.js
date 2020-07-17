const request = require("request")
/**
 * calls the callback function with fetched papers and error if any. 
 * @param {string} paperUrl 
 * @param {function} callback
 */
function paperRequest(paperUrl, callback) {
    request(paperUrl, {encoding: null}, (err, res, body) => {
        callback(err, res, body)
    })
}

module.exports = paperRequest;