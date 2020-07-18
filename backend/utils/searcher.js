const fs = require("fs");

papersJson = fs.readFileSync("papers.json")
papers = JSON.parse(papersJson)
papersMap = new Map()

papers.forEach(paper => {
    let cur = papersMap.get(paper[0])
    if(!cur)
        cur = []
    cur.push(paper[1])
    papersMap.set(paper[0], cur)
});

/**
 * returns all the papers of given code.
 * @param {string} code 
 */
function search(code) {
    if (!papersMap.get(code)) {
        return []
    } 
    return papersMap.get(code)
}

module.exports = search