# [code, url]
import sys
import json
import time
from pathlib import Path
import requests
from bs4 import BeautifulSoup as bs
from urllib.parse import urljoin
allPapers = list()
# [url]
crawled = set()
# [code] [branch][code]
codes = dict()

branches = "BE,BA,BC,BD,BESP,BH,BI,BL,BM,BP,BPSP,BT,BV,DA,DI,DISP,DP,DV,FD,HM,IC,MA,MB,MC,MCSP,ME,ML,MN,MP,MR,MT,PD,PH,PM,PP,PR,TE,VM".split(
    ",")
print(branches)


def savePaperJson():
    global allPapers
    # convert the list to JSON!
    papers_json = json.dumps(allPapers)

    # Write out the list to file.
    file = open("./papers.json", "w+")
    file.write(papers_json)
    file.close()


def page(url, check=False):
    global allPapers
    # check if site is indeed an PDF Or Zip
    status_code = 200
    content_type = "pdf"
    # don't add if year < 2014, code length < 7
    # Split Paper link with '/' to get Department and Year.. And also remove prefix *http://old.gtu.ac.in/GTU_Papers/*

    if check:
        res = requests.head(url)
        status_code = res.status_code
        content_type = res.headers["Content-Type"]

    if ((not content_type.__contains__("html") and status_code < 400) and (url.endswith(".zip") or url.endswith(".pdf"))):
        t2 = url.split("/")
        t2 = t2[t2.__len__() - 1]
        if not check:
            urlSplit = ""
            if(url.startswith("http://old.gtu.ac.in/GTU_Papers/")):
                urlSplit = url.split(
                    "http://old.gtu.ac.in/GTU_Papers/")[1].split("/")
            else:
                urlSplit = url.split(
                    "http://files.gtu.ac.in/GTU_Papers/")[1].split("/")
            # Check Year

            urlSplit[1] = urlSplit[1].replace("_", " ")
            if urlSplit[1][-4:].isnumeric() and int(urlSplit[1][-4:]) < 2014:
                return False

            # Remove .pdf or .zip from subject code
            urlSplit[urlSplit.__len__(
            ) - 1] = urlSplit[urlSplit.__len__() - 1].replace(".pdf", "")
            urlSplit[urlSplit.__len__(
            ) - 1] = urlSplit[urlSplit.__len__() - 1].replace(".zip", "")

            if len(urlSplit[2]) < 7:
                return False

        code = t2.split(".")[0]
        for branch in branches:
            # if url.__contains__(branch):
            if not codes.__contains__(branch):
                codes[branch] = set()
            codes[branch].add(code)

        curPaper = [code, url]

        allPapers.append(curPaper)
        # print("Added", curPaper)
        return True
    else:
        print("File at", url, "is not pdf or zip!")
        rec(url)
        return False


def rec(baseURL):
    basePage = requests.get(baseURL).text
    aTags = bs(basePage, "html.parser").find_all("a")
    for a in aTags:
        hreflink = urljoin(baseURL, a.get("href"))
        valid = ((
            hreflink.startswith("http://www.gtu.ac.in")) or (hreflink.startswith(
                "http://old.gtu.ac.in")) or (hreflink.startswith("http://files.gtu.ac.in")))
        if((hreflink == "http://www.gtu.ac.in") or (hreflink == "http://gtu.ac.in/Download1.aspx") or (hreflink == "http://www.gtu.ac.in/")):
            continue
        else:
            if valid:
                if(not crawled.__contains__(hreflink)):
                    crawled.add(hreflink)
                    page(hreflink)
            else:
                print("Link not in crawling domain!", hreflink)

# recursively got for all the papers!
base = "http://old.gtu.ac.in/Qpaper.html"
rec(base)
savePaperJson()

print(len(codes["BE"]))

base = "https://www.gtu.ac.in/uploads"
sems = ["W2019", "S2018", "W2018", "S2019", "W2017"]

for sem in sems:
    for branch in branches:
        # try:
            for code in codes[branch]:
                # try:
                        ans = page(base+"/"+sem+"/"+branch +
                                   "/"+code+".pdf", check=True)
                # except:
                    # print(sys.exc_info()[0])
        # except:
            # print(sys.exc_info()[0])

savePaperJson()
