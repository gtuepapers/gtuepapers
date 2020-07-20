
const serverUrl = "http://localhost:3000/"

const searchBtn = document.querySelector("#search_btn")
const searchInp = document.querySelector("#search_inp")
const searchForm = document.querySelector("#search_frm")
const formErrField = document.querySelector("#form_err")
const searchResultTemplate = `
<hr>
<div class="container bounce animated ">
    <!-- Start: Intro -->
    <div class="intro">
        <h2 class="text-center">Papers [ $1 ]</h2>
        <p class="text-center"></p>
    </div>
    <!-- End: Intro -->
    <!-- Start: Features -->
    <div id="searchResult" class="row justify-content-center bounce animated features features" style="padding-bottom: 20px;">
        
    </div>
</div>`

const searchResultItemTemplate = `
<div class="col-sm-6 col-md-5 col-lg-4 item ">
<div class="box hover_pointer search_item" onclick="downloadSinglePaper(this)" data-url="$2" data-code="$3">
    <h3 class="name">$1</h3>
</div>
</div>`

const searchResultAllDownloadButtonTemplate = `
<button class="btn btn-primary" type="button" onClick="downloadAllPapers(this)" data-codes="$1" data-name="$2"
    style="margin: 20px;margin-top: 0px;margin-bottom: 30px;margin-right: 30ox;margin-left: 35px;">Download
    All [ $1.zip ]</button>`

/**
 * Downloads Single Paper
 * @param {HTMLElement} element 
 */
async function downloadSinglePaper(element) {
    let paperUrl = element.getAttribute("data-url")
    let paperCode = element.getAttribute("data-code")
    let downloadUrl = serverUrl + "pdf/" + paperCode + "?url=" + paperUrl
    let link = document.createElement('a');
    link.href = downloadUrl;
    link.download = paperCode + '.pdf';
    link.dispatchEvent(new MouseEvent('click'));
}

function downloadAllPapers(element) {
    let paperCode = element.getAttribute("data-codes")
    let paperName = element.getAttribute("data-name")
    let downloadUrl = serverUrl + "pdfbundle/" + paperName + "?codes=" + paperCode
    let link = document.createElement('a');
    link.href = downloadUrl;
    link.download = paperName + '.zip';
    link.dispatchEvent(new MouseEvent('click'));
}

async function httpRequest(url) {
    console.log("Requesting to ", url)
    let response = await fetch(url)
    return response
}

function getNameFromUrl(url) {
    let urlSplit = url.split("/")
    let month = urlSplit[urlSplit.length - 2]
    let name = ""
    if (month[0] == "W") {
        name = "Winter "
    } else {
        name = "Summer "
    }
    name += month.substring(month.length - 4)
    return name
}

// search
searchInp.addEventListener("input", (event) => {
    formErrField.style.display = "none"
})

searchForm.addEventListener("submit", async (event) => {
    try {
        event.preventDefault()

        let tempSearchResultBox = document.querySelector("#searchResultBox")
        tempSearchResultBox?.remove()

        let code = searchInp.value
        let searchUrl = serverUrl + "search/" + code
        papers = await (await httpRequest(searchUrl)).json()
        console.log(papers)
        if (papers.length == 0) {
            throw new Error("No paper with code: " + code + " found!")
        }
        let searchResultDiv = document.createElement("div")
        searchResultDiv.id = "searchResultBox"
        searchResultDiv.classList.add("features-boxed")
        searchResultDiv.innerHTML = searchResultTemplate.replace("$1", code)
        searchForm.parentElement.parentElement.after(searchResultDiv)

        let searchResult = document.querySelector("#searchResult")
        papers.forEach(paperUrl => {
            searchResult.innerHTML += searchResultItemTemplate
                .replace("$1", getNameFromUrl(paperUrl))
                .replace("$2", paperUrl)
                .replace("$3", code)
        });
        searchResult.parentElement.innerHTML += searchResultAllDownloadButtonTemplate
            .replace(/\$1/g, code)
            .replace("$2", code)
    } catch (err) {
        formErrField.innerHTML = err.message
        formErrField.style.display = "block"
    }
})


// all papers
const showcase = document.querySelector("#all_papers_showcase")
const levels = ["departments"]

const paperShowcaseTemplate = `<div class="col-sm-6 col-md-5 col-lg-4 item">
<div class="box box hover_pointer search_item" onclick="paperShowCase(this)" data-json="$2">
    <h3 class="name">$1</h3>
</div>
</div>`
const paperShowcaseCodeTemplate = `<div class="col-sm-6 col-md-5 col-lg-4 item">
<div class="box box hover_pointer search_item" onclick="downloadSinglePaper(this)" data-url="$2" data-code="$3"
    <h3 class="name">$1</h3>
</div>
</div>`
const allPaperDownloadAllButtonTemplate =`<button id="all_paper_download_btn" class="btn btn-primary" type="button" onClick="downloadAllPapers(this)" data-codes="$1" data-name="$2"
style="margin: 20px;margin-top: 0px;margin-bottom: 30px;margin-right: 30ox;margin-left: 35px;">Download
All [ $2.zip ]</button>` 

var paperLevelShower = document.querySelector("#all_paper_levels");
paperLevelShower.style.display = "none";

paperLevelShower.addEventListener("click", (event) => {
    levels.pop()
    if (levels.length <= 1) {
        paperLevelShower.style.display = "none";
    }
    showcaseAllPapers(levels[levels.length - 1])
})

async function showcaseAllPapers(jsonFile) {
    const showcase = document.querySelector("#all_papers_showcase")
    document.querySelector("#all_paper_download_btn")?.remove()
    showcase.innerHTML = "Loading ..."
    jsonFileUrl = serverUrl + "json/" + jsonFile + ".json"
    json = await (await httpRequest(jsonFileUrl)).json()
    console.log(json)
    showcase.innerHTML = ""
    json.forEach(subcat => {
        showcase.innerHTML += paperShowcaseTemplate
            .replace("$1", subcat)
            .replace("$2", jsonFile.includes("sem") ? ("code:" + subcat) : ((jsonFile == "departments" ? "" : jsonFile + "-") + subcat))
        console.log(showcase.innerHTML)
    })
}

async function showcaseAllPapersOfCode(code) {
    const showcase = document.querySelector("#all_papers_showcase")
    showcase.innerHTML = "Loading ..."
    document.querySelector("#all_paper_download_btn")?.remove()
    console.log(showcase.innerHTML)
    jsonFileUrl = serverUrl + "search/" + code
    json = await (await httpRequest(jsonFileUrl)).json()
    console.log(json)
    showcase.innerHTML = ""
    json.forEach(url => {
        showcase.innerHTML += paperShowcaseCodeTemplate
            .replace("$1", getNameFromUrl(url))
            .replace("$2", url)
            .replace("$3", code)
    })
    showcase.parentElement.innerHTML += allPaperDownloadAllButtonTemplate
            .replace("$1", code)
            .replace(/\$2/g, code)
}

function showNextLevel(nextLevel) {
    if (nextLevel.includes("code:")) {
        code = nextLevel.split(":")[1]
        levels.push(code)
        showcaseAllPapersOfCode(code)
        paperLevelShower.style.display = "block";
    } else {
        levels.push(nextLevel)
        showcaseAllPapers(nextLevel)
        paperLevelShower.style.display = "block";
    }
}

function paperShowCase(element) {
    nextLevel = element.getAttribute("data-json")
    showNextLevel(nextLevel)
}

showcaseAllPapers(levels[0])