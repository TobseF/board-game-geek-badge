import fetch from 'node-fetch';
import fs from 'fs';
import xml2js from 'xml2js';
import core from '@actions/core';


let userName = "Topsee"

let templateFile = 'board-game-geek-count-template.svg'
let outputFile = 'board-game-geek-count.svg'
let apiURL = "https://boardgamegeek.com/xmlapi/collection/"
let repoCountUrl = apiURL + userName + "?own=1"

let xmlParser = new xml2js.Parser()

/**
 * We need a retry, because the xmlapi is lazy and may return just a message:
 * > `Please try again later for access`
 */
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

        setGameCount(gameCount)
        if (oldBadge === compiledBadge) {
            console.info("Badge data has not changed. Skipping commit.");
            setUpdateBanner(false)
        } else {
            console.info("🎲 New game count: " + gameCount);
            console.info("Updating badge ...");
            fs.writeFileSync("./" + outputFile, compiledBadge);
            console.info("Updated " + outputFile + " successfully");
            setUpdateBanner(true)
        }
    } catch (error) {
        if (retries > 0) {
            retries--
            console.info("Retry " + retries);
            setTimeout(() => {
                fetchApi()
            }, retryWaitMS);
        } else {
            console.error(error);
        }
    }
}

function setUpdateBanner(value) {
    setOutput("UPDATE_BADGE", value)
}

function setGameCount(count) {
    setOutput("GAME_COUNT", count)
}

/**
 * Output will be available to the next GitHub action step
 */
function setOutput(key, value) {
    core.setOutput(key, value);
}

function readFile(file) {
    return fs.readFileSync("./" + file, 'utf8')
}

function compileTemplate(template, gameCount) {
    return template.replaceAll("${gameCount}", gameCount)
}
