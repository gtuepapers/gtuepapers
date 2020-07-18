const got = require("got")
/**
 * calls the callback function with fetched papers and error if any. 
 * @param {string} paperUrl 
 */
async function paperRequest(paperUrl) {
    if(!paperUrl.startsWith("http://old.gtu.ac.in") && !paperUrl.startsWith("http://files.gtu.ac.in/")) {
        console.error(paperUrl)
        return {err:1, data:"request out of domain"}
    }
    try {
        response = await got(paperUrl, {responseType:"buffer"})
        return {err:0, data:response.body}
    } catch(err) {
        return {err:1, data:err};
    }
}
module.exports = paperRequest;