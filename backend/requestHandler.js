const zipper = require('./utils/zipper')
const paperRequest = require('./utils/paperRequest')
const searcher = require("./utils/searcher")

function requestHandler(app) {

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
            res.status(403).json("No URL provided")
            res.end();
            return;
        }
        data = await paperRequest(req.query.url);
        err = data.err
        body = data.data
        console.log(err)
        console.log(body)
        if (err) {
            console.log("can't download paper")
            res.status(403).json(err)
            res.end();
            return;
        }
        
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${req.params.code}.pdf`,
        });

        console.log("paper downloaded from gtu")
        pdf = body
        if (req.query.url.endsWith(".zip")) {
            pdf = zipper.zipToPDF(body);
        }
        res.write(pdf)
        res.end()
    })


    // create a zip bundle of multiple pdfs
    app.get("/pdfbundle/:name", async (req, res) => {
        console.log("bundle request")
        if (!req.query.codes) {
            console.log("no url")
            res.status(403).json("No URL Provided")
            res.end();
            return;
        }
        // write the head before so, that we can get more time to download pdfs and create zips.
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${req.params.name}.zip`,
        });
        // Still 55 seconds is too less time. Need to optimize it! 
        let codes = req.query.codes
        codes = codes.split(",")
        let pdfs = []
        let paths = []
        for(let i = 0; i < codes.length; i ++) {
            let code = codes[i];
            papers = searcher(code)
            for(let j = 0; j < papers.length; j ++) {
                let paper = papers[j] 
                let path = code + "/" + getNameFromUrl(paper) + ".pdf"
                data = await paperRequest(paper)
                err = data.err
                body = data.data
                if (err) {
                    console.log("can't download paper")
                    res.status(403).json(err)
                    res.end();
                    return;
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
        res.write(zip.toBuffer())
        res.end()
    })
}

function getNameFromUrl(url) {
    let isNewerVersion = url.includes("uploads");
    let urlSplit = url.split("/")
    let batch = urlSplit[urlSplit.length - (isNewerVersion ? 3 : 2)]
    let name = ""
    if (batch[0] == "W") {
        name = "Winter "
    } else {
        name = "Summer "
    }
    name += batch.substring(batch.length - 4)
    return name
}

module.exports = requestHandler