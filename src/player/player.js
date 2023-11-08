let gameLog = null;
let currentEventIndex = -1;
const gameLogInput = document.getElementById('game-log-input');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const eventContainer = document.getElementById('event-container');
const eventIndexInput = document.getElementById('event-index');
const eventLog = document.getElementById('event-log');
const hexGrid = document.getElementById('hex-grid');
const tileTypeToResourceName = {
    0: 'desert',
    1: 'lumber',
    2: 'brick',
    3: 'wool',
    4: 'grain',
    5: 'ore'
};


eventIndexInput.addEventListener('change', (event) => {
    currentEventIndex = parseInt(event.target.value);
    updateEvent()
});

gameLogInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        gameLog = JSON.parse(reader.result);
        for (let i = 0; i < gameLog.length; i++) {
            const event = gameLog[i];
            if (event.data.type == 14) {
                currentEventIndex = i;
                const tiles = event.data.payload.tileState.tiles;
                for (const tile of tiles) {
                    const resourceName = tileTypeToResourceName[tile.tileType];
                    const hexFace = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                    hexFace.setAttribute('href', `#${resourceName}`);
                    const x = tile.hexFace.x * 100 + 50 * tile.hexFace.y;
                    const y = tile.hexFace.y * 75;
                    hexFace.setAttribute('x', x);
                    hexFace.setAttribute('y', y);
                    hexGrid.appendChild(hexFace);

                    if (resourceName != 'desert') {
                        const diceNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        diceNumber.setAttribute('x', x + 50);
                        diceNumber.setAttribute('y', y + 55);
                        diceNumber.textContent = tile._diceNumber
                        diceNumber.setAttribute('dominant-baseline', 'middle');
                        diceNumber.setAttribute('text-anchor', 'middle');
                        hexGrid.appendChild(diceNumber);

                        const diceProbability = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        diceProbability.setAttribute('x', x + 50);
                        diceProbability.setAttribute('y', y + 65);
                        diceProbability.textContent = "•".repeat(tile._diceProbability);
                        diceProbability.setAttribute('dominant-baseline', 'middle');
                        diceProbability.setAttribute('text-anchor', 'middle');
                        hexGrid.appendChild(diceProbability);
                    }
                }
                break;
            }
        }
        eventIndexInput.max = gameLog.length - 1;
        updateEvent();
    };
    reader.readAsText(file);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        prevEvent();
    } else if (event.key === 'ArrowRight') {
        nextEvent();
    }
});

function prevEvent() {
    if (currentEventIndex > 0) {
        currentEventIndex--;
        updateEvent();
    }

}

function nextEvent() {
    if (currentEventIndex < gameLog.length - 1) {
        currentEventIndex++;
        updateEvent();
    }

}

function updateEvent() {
    if (currentEventIndex === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    if (currentEventIndex === gameLog.length - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }

    const event = gameLog[currentEventIndex];
    const eventStr = JSON.stringify(event, null, 2);
    eventLog.innerHTML = `<pre>${eventStr}</pre>`;
    eventIndexInput.value = currentEventIndex;
}

prevBtn.addEventListener('click', prevEvent);
nextBtn.addEventListener('click', nextEvent);
