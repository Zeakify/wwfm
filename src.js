let pageMap = wwf.page.Manager[wwf.page.Manager.__pageMap ? '__pageMap' : 'pageMap'];
window.displayValidationResults = window.displayValidationResults || pageMap.game.displayValidationResults;
window.addMove = window.addMove || pageMap.game.__serviceClient.addMove;
window.__processTiles = window.__processTiles || pageMap.game.currentMove.constructor.prototype.__processTiles;
window.calculateWords = window.calculateWords || pageMap.game.currentMove.constructor.prototype.calculateWords;

let customWords = false;
let pointsPerPlay;

pageMap.game.displayValidationResults = function (board, wordData, a, b) {
    wordData.valid = true;
    window.displayValidationResults.call(this, board, wordData, a, b);
};

pageMap.game.__serviceClient.wordOrNot = function (word, callback) {
    callback({});
};

pageMap.game.__serviceClient.addMove = function (move, a, b) {
    if (pointsPerPlay === undefined) {
        pointsPerPlay = move.points;
    }
    move.words = customWords ? ["custom"] : [getSetWord()];
    move.points = pointsPerPlay;
    return window.addMove.call(this, move, a, b);
};

pageMap.game.currentMove.constructor.prototype.__processTiles = function () {
    let retVal = window.__processTiles.apply(this, arguments);
    retVal.valid = true;
    return retVal;
};

pageMap.game.currentMove.constructor.prototype.validate = function (callback) {
    callback(true, null);
};

pageMap.game.currentMove.constructor.prototype.calculateWords = function () {
    let retVal = window.calculateWords.apply(this, arguments);

    if (retVal.words.length == 0 && pageMap.game.currentMove.tiles.length > 0) {
        return {
            "words": [pageMap.game.currentMove.tiles],
            "error": null
        };
    }
    return retVal;
};

let lastSetWord = "";

function setLetters(str) {
    let uppercaseWord = str.toUpperCase();
    lastSetWord = str.toLowerCase();

    let lettersToSet = uppercaseWord.split("");
    let myList = [];
    lettersToSet.forEach((letter) => {
        let id = pageMap.game.__bag.__letters.find(all => all.letter == letter)?.id || undefined;
        if (id) {
            myList.push({ letter: letter, id: id });
        }
    });

    let letters = {
        [wwf.user.Manager.getMyself().get("id")]: myList
    };

    pageMap.game.__setLetters(letters);
}

function getSetWord() {
    return lastSetWord;
}

(function createMenu() {
    const menuStyles = `
        #wwfMenu {
            position: fixed;
            top: 10px;
            left: 10px;
            width: 220px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            z-index: 10000;
            backdrop-filter: blur(5px);
            cursor: move;
        }
        #wwfMenu h3 {
            margin: 0;
            font-size: 16px;
            text-align: center;
            margin-bottom: 10px;
            color: white;
        }
        #wwfMenu label {
            font-size: 14px;
            display: block;
            margin-bottom: 8px;
            color: white;
        }
        #wwfMenu input[type="text"], #wwfMenu input[type="number"] {
            width: 100%;
            margin-top: 4px;
            padding: 6px;
            border: 1px solid transparent;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
        }
        #wwfMenu input[type="checkbox"] {
            margin-left: 6px;
            margin-top: 2px;
            background: rgba(0, 0, 0, 0.7);
            cursor: pointer;
        }
        #wwfMenu input[type="checkbox"]:checked {
            background: rgba(0, 0, 0, 0.8);
        }
        #wwfMenu .deleteMenuCheckbox {
            border: 2px solid red;
            color: red;
        }
        #wwfMenu button {
            position: absolute;
            top: 5px;
            right: 5px;
            background: red;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 2px 6px;
            cursor: pointer;
            font-size: 12px;
        }
        #wwfMenu button:hover {
            background: darkred;
        }
        #wwfMenu .toggleText {
            font-size: 12px;
            color: grey;
            text-align: center;
            font-style: italic;
            margin-top: 10px;
        }
    `;

    const menuHTML = `
        <div id="wwfMenu">
            <h3>WWFM v1.1.43</h3>
            <label>
                Points Per Play:
                <input type="number" id="pointsInput" placeholder="Auto">
            </label>
            <label>
                Letters:
                <input type="text" id="lettersInput" placeholder="Auto">
            </label>
            <label>
                <input type="checkbox" id="customWordsCheckbox"> Custom Words
            </label>
            <label>
                <input type="checkbox" id="deleteMenuCheckbox" class="deleteMenuCheckbox"> <span style="color: red;">Delete Menu</span>
            </label>
            <div class="toggleText">"Shift + T" to toggle menu</div>
        </div>
    `;

    const styleTag = document.createElement("style");
    styleTag.textContent = menuStyles;
    document.head.appendChild(styleTag);

    const menuContainer = document.createElement("div");
    menuContainer.innerHTML = menuHTML;
    document.body.appendChild(menuContainer);

    const menu = document.getElementById("wwfMenu");
    const customWordsCheckbox = document.getElementById("customWordsCheckbox");
    const deleteMenuCheckbox = document.getElementById("deleteMenuCheckbox");
    const lettersInput = document.getElementById("lettersInput");
    const pointsInput = document.getElementById("pointsInput");

    let isDragging = false;
    let offsetX, offsetY;

    menu.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - menu.getBoundingClientRect().left;
        offsetY = e.clientY - menu.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            menu.style.left = `${e.clientX - offsetX}px`;
            menu.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    customWordsCheckbox.addEventListener("change", (e) => {
        customWords = e.target.checked;
        console.log(`Custom Words: ${customWords}`);
    });

    deleteMenuCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            menu.style.display = 'none';
            console.log('Menu deleted.');
        }
    });

    lettersInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const lettersValue = e.target.value.trim();
            if (lettersValue) {
                setLetters(lettersValue);
                console.log(`Set Letters: ${lettersValue}`);
            }
        }
    });

    pointsInput.addEventListener("input", (e) => {
        const pointsValue = e.target.value.trim();
        pointsPerPlay = pointsValue === "" ? undefined : parseInt(pointsValue, 10);
        console.log(`Points Per Play: ${pointsPerPlay}`);
    });

    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key.toLowerCase() === "t") {
            menu.style.display = menu.style.display === "none" ? "block" : "none";
        }
    });
})();
