const admzip = require("adm-zip")
/**
 * extracts the first file
 * @param {Buffer} zipBuffer
 */
function zipToPDF(zipBuffer) {
    let zip = new admzip(zipBuffer)
    return zip.getEntries()[0].getData()
}

/**
 * Creates a Zip File for pdfs.
 * @param {Buffer[]} pdfs 
 * @param {String[]} paths
 */
function pdfsToZIP(pdfs, paths) {
    if(pdfs.length != paths.length) {
        throw new Error("Invalid argument, pdfs and paths length must be same")
    }
    let zip = new admzip()
    paths.forEach(path => {
        // if it contains a folders create them.
        console.log(path);
        path = path.split('/')
        console.log(path);
        let curPath = ''
        path.forEach(folder => {
            if(folder.includes('.')) return false
            curPath += folder + '/'
            
            zip.addFile(curPath, Buffer.from(""))
            console.log(curPath);
        })
    })
    for(let i = 0; i < pdfs.length; i ++) {
        zip.addFile(paths[i], pdfs[i])
    }
    
    return zip;
} 

module.exports = {zipToPDF, pdfsToZIP}