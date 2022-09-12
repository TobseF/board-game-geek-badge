import fetch from 'node-fetch';
import fs from 'fs';
import xml2js from 'xml2js';


let userName = "Topsee"

let debug = false
let templateFile = 'board-game-geek-count-template.svg'
let outputFile = 'board-game-geek-count.svg'
let apiURL = "https://boardgamegeek.com/xmlapi/collection/"
let repoCountUrl = apiURL + userName + "?own=1"

let xmlParser = new xml2js.Parser()

let retries = 10
let retryWaitMS = 500

fetchApi()

function fetchApi() {
    fetch(repoCountUrl, {
        method: 'get',
        headers: {'Content-Type': 'application/json'}
    })
        .then((res) => res.text())
        .then((xml) => xmlParser.parseStringPromise(xml))
        .then((parsed) => {
            updateBadge(parsed)
        });
}

function updateBadge(xmlResult) {
    try {
        let gameCount = xmlResult.items.$.totalitems
        console.log("Received " + gameCount + " games from BoardGameGeek API");
        if (gameCount < 1) {
            throw new Error("Didn't received game count");
        }
        let templateData = readFile(templateFile);
        let compiledBadge = compileTemplate(templateData, gameCount);
        let oldBadge = readFile(outputFile);

        if (oldBadge === compiledBadge) {
            console.log("Badge data has not changed. Skipping commit.");
            setUpdateBannerEnv("false")
        } else {
            console.log("Updating badge ...");
            fs.writeFileSync("./" + outputFile, compiledBadge);
            console.log("Updated " + outputFile + " successfully");
            setGameCountEnv(gameCount)
            setUpdateBannerEnv("true")
        }
    } catch (error) {
        if (retries > 0) {
            retries--
            setTimeout(() => {
                console.log("This is the first function")
            }, retryWaitMS);
            console.info("Retry " + retries);
        } else {
            console.error(error);
        }
    }
}

function setUpdateBannerEnv(value) {
    setEnv("UPDATE_BADGE", value)
}

function setGameCountEnv(count) {
    setEnv("GAME_COUNT", count)
}

function setEnv(key, value) {
    if (!debug) {
        console.log("Setting Property: " + key + "=" + value);
        fs.writeFileSync(process.env.GITHUB_ENV, key + "=" + value);
    }else{
        console.log("New Property: " + key + "=" + value);
    }
}

function readFile(file) {
    return fs.readFileSync("./" + file, 'utf8')
}

function compileTemplate(template, gameCount) {
    return template.replaceAll("${gameCount}", gameCount)
}