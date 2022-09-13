# 🎫 BoardGameGeek Game Counter Badge
This is a [BoardGameGeek](https://boardgamegeek.com)-Badge SVG graphic which shows the number of owned games.
The counter gets automatically updated by a [GitHub CI workflow](https://resources.github.com/ci-cd/).

![board-game-count](https://raw.githubusercontent.com/TobseF/board-game-geek-badge/master/board-game-geek-count.svg)

## ⭐ Features
 ⭐ Customizable  
 ⭐ SVG graphic  
 ⭐ Always up to date  
 ⭐ Image hosted by GitHub  
 ⭐ Git based stats history  
 ⭐ No API key is needed

## 📖 How it works
This `update-badge-script.js` [Node.js](https://nodejs.org/en/) script reads 
the [BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API)
and writes the game stats into an SVG template file (`board-game-geek-count-template.svg`).
If the generated badge is newer then the file in the repository, it
commits the new generated `board-game-geek-count.svg` to this GIT repository.
The pipeline gets triggered by a cron job, which automatically updates the image every midnight.

You can link the generated file by:  
https://raw.githubusercontent.com/{userName}/github-badge/master/github-repo-count.svg

## 🛠 Config
The script can be configured to generate a badge for any user:
* `userName`: Your username on BoardGameGeek.  
   Example url: https://boardgamegeek.com/collection/user/Topsee  
   `userName` = `Topsee`
* `cron`: You can change the update time interval in the `.github/workflows/main.yml`:  
   On Line 6:  
   `- cron: '0 0 * * *'` (every day at midnight).
   Uses the [cron-job syntax](https://crontab.guru/every-midnight).
