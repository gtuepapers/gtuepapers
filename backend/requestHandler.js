const zipper = require('./utils/zipper')
const paperRequest = require('./utils/paperRequest')
const searcher = require("./utils/searcher")

function requestHandler(app) {
    console.log("here")

    // Search 
    app.get("/search/:code", (req, res) => {
        res.json(searcher(req.params.code));
        res.end()
    })

    // Convert one file to pdf
    app.get("/pdf/:code", async (req, res) => {
        console.log("pdf request")
        if (!req.query.url) {
            console.log("no url")
            res.status(403).json("...")
            res.end();
        }
        data = await paperRequest(req.query.url);
        err = data[0]
        body = data[1]
        if (err) {
            console.log("can't download paper")
            res.status(403).json(err)
            res.end();
        }
        console.log("paper downloaded from gtu")
        pdf = body
        if (req.query.url.endsWith(".zip")) {
            pdf = zipper.zipToPDF(body);
        }
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${req.params.code}.pdf`,
            'Content-Length': pdf.length
        });
        console.log("here12")
        res.write(pdf)
    })


    // create a zip bundle of multiple pdfs
    app.get("/pdfbundle/:name", async (req, res) => {
        console.log("bundle request")
        if (!req.query.codes) {
            console.log("no url")
            res.status(403).json("...")
            res.end();
        }
        let codes = req.query.codes
        codes = codes.split(",")
        let pdfs = []
        let paths = []
        for(let i = 0; i < codes.length; i ++) {
            let code = codes[i];
            papers = searcher(code)
            for(let j = 0; j < papers.length; j ++) {
                let paper = papers[j] 
                let paperSplit = paper.split("/")
                let path = code + "/" + paperSplit[paperSplit.length - 2] + ".pdf"
                data = await paperRequest(paper)
                // console.log(data)
                err = data.err
                body = data.data
                if (err) {
                    console.log("can't download paper")
                    res.status(403).json(err)
                    res.end();
                }
                pdf = body
                console.log(typeof pdf)
                if (paper.endsWith(".zip")) {
                    pdf = zipper.zipToPDF(body);
                }
                pdfs.push(pdf)
                paths.push(path)
                console.log(paths)
            }
        }
        console.log("All papers are downloaded now zipping them")
        // We have all the papers!
        // Now, get the zip
        zip = zipper.pdfsToZIP(pdfs, paths);
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${req.params.name}.zip`,
            'Content-Length': zip.toBuffer().length
        });
        res.write(zip.toBuffer())
        res.end()
    })
}
module.exports = requestHandler