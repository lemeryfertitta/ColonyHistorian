let gameLog = null;
let currentEventIndex = 0;
const gameLogInput = document.getElementById('game-log-input');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const eventContainer = document.getElementById('event-container');
const eventIndexInput = document.getElementById('event-index');
const eventLog = document.getElementById('event-log');
const hexGrid = document.getElementById('hex-grid');

// Tile IDs in WebSocket messages
const tileTypeToResourceName = {
    0: 'desert',
    1: 'lumber',
    2: 'brick',
    3: 'wool',
    4: 'grain',
    5: 'ore'
};

// Port IDs in WebSocket messages
const portTypeToResourceName = {
    1: 'any',
    2: 'lumber',
    3: 'brick',
    4: 'wool',
    5: 'grain',
    6: 'ore'
}

// Color IDs in WebSocket messages
const colorIdMap = {
    // TODO: Figure out remaining colors
    1: 'red',
    2: 'blue',
    3: 'orange',
    5: 'black',
}

// Event IDs in WebSocket messages
const BOARD_DESCRIPTION_EVENT = 14;
const PLAYER_UPDATE_EVENT = 12;
const PLACE_ROAD_EVENT = 15;
const PLACE_SETTLEMENT_EVENT = 16;

// Scaling factor for hex grid
const HEX_SIZE = 50;


eventIndexInput.addEventListener('change', (event) => {
    const newEventIndex = parseInt(event.target.value);
    if (newEventIndex < currentEventIndex) {
        removeEvents(newEventIndex, currentEventIndex);
    } else if (newEventIndex > currentEventIndex) {
        drawEvents(currentEventIndex, newEventIndex);
    } else {
        console.log("Event index did not change");
    }
    currentEventIndex = newEventIndex;
    displayCurrentEventLog();
});

gameLogInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        gameLog = JSON.parse(reader.result);
        for (let i = 0; i < gameLog.length; i++) {
            const event = gameLog[i];
            currentEventIndex = i;
            if (event.data.type == BOARD_DESCRIPTION_EVENT) {
                // Draw pointy-top hex grid
                // See https://www.redblobgames.com/grids/hexagons/ for explanation of hex grid coordinates
                for (const tile of event.data.payload.tileState.tiles) {
                    const resourceName = tileTypeToResourceName[tile.tileType];
                    const hexFace = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                    setImageSource(hexFace, 'tile', resourceName);
                    hexFace.setAttribute('width', getHexWidth(HEX_SIZE));
                    hexFace.setAttribute('height', getHexHeight(HEX_SIZE));
                    const drawCoordinates = hexFaceToCoords(tile.hexFace);
                    hexFace.setAttribute('x', drawCoordinates.x);
                    hexFace.setAttribute('y', drawCoordinates.y);
                    hexGrid.appendChild(hexFace);

                    if (resourceName != 'desert') {
                        const diceNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        diceNumber.setAttribute('x', drawCoordinates.x + getHexWidth() / 2);
                        diceNumber.setAttribute('y', drawCoordinates.y + getHexHeight() / 2);
                        diceNumber.textContent = tile._diceNumber
                        diceNumber.setAttribute('dominant-baseline', 'middle');
                        diceNumber.setAttribute('text-anchor', 'middle');
                        hexGrid.appendChild(diceNumber);

                        const diceProbability = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        diceProbability.setAttribute('x', drawCoordinates.x + getHexWidth() / 2);
                        diceProbability.setAttribute('y', drawCoordinates.y + getHexHeight() / 2 + HEX_SIZE / 5);
                        diceProbability.textContent = "•".repeat(tile._diceProbability);
                        diceProbability.setAttribute('dominant-baseline', 'middle');
                        diceProbability.setAttribute('text-anchor', 'middle');
                        hexGrid.appendChild(diceProbability);
                    } else {
                        const robber = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                        setImageSource(robber, 'icon', 'robber');
                        robber.setAttribute('x', drawCoordinates.x + getHexWidth() / 4);
                        robber.setAttribute('y', drawCoordinates.y + getHexHeight() / 2);
                        hexGrid.appendChild(robber);
                    }
                }

                // Draw ports
                for (const portEdge of event.data.payload.portState.portEdges) {
                    const port = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    // port.setAttribute('href', `#${portTypeToResourceName[portEdge.portType]}-port`);
                    port.textContent = portTypeToResourceName[portEdge.portType];
                    port.setAttribute('dominant-baseline', 'middle');
                    port.setAttribute('text-anchor', 'middle');
                    const z = portEdge.hexEdge.z;
                    let xOffset, yOffset;
                    if (z == 0) {
                        xOffset = -25 / 2;
                        yOffset = -40;
                    } else if (z == 1) {
                        xOffset = -50;
                        yOffset = 0;
                    } else if (z == 2) {
                        xOffset = -25 / 2;
                        yOffset = 40;
                    }
                    port.setAttribute('x', portEdge.hexEdge.x * 100 + 50 * portEdge.hexEdge.y + xOffset + 50);
                    port.setAttribute('y', portEdge.hexEdge.y * 75 + yOffset + 50);
                    hexGrid.appendChild(port);
                }
            } else if (event.data.type == PLAYER_UPDATE_EVENT) {
                const playerTable = document.getElementById('player-table');
                for (const player of event.data.payload) {
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td');
                    nameCell.textContent = player.username;
                    row.appendChild(nameCell);
                    const pointsCell = document.createElement('td');
                    pointsCell.textContent = player.victoryPointState._totalPublicVictoryPoints;
                    row.appendChild(pointsCell);
                    const resourcesCell = document.createElement('td');
                    resourcesCell.textContent = player.resourceCards.length;
                    row.appendChild(resourcesCell);
                    const devCardsCell = document.createElement('td');
                    devCardsCell.textContent = player.developmentCards.length;
                    row.appendChild(devCardsCell);
                    const knightsCell = document.createElement('td');
                    knightsCell.textContent = 0;
                    row.appendChild(knightsCell);
                    const roadsCell = document.createElement('td');
                    roadsCell.textContent = 0;
                    row.appendChild(roadsCell);
                    playerTable.appendChild(row);
                }
                break;
            }
        }
        eventIndexInput.max = gameLog.length - 1;
        displayCurrentEventLog();
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
        removeEvents(currentEventIndex, currentEventIndex - 1);
        currentEventIndex--;
        displayCurrentEventLog();
    } else {
        console.log("Reached beginning of game log");
    }

}

function nextEvent() {
    if (currentEventIndex < gameLog.length - 1) {
        drawEvents(currentEventIndex, currentEventIndex + 1);
        currentEventIndex++;
        displayCurrentEventLog();
    } else {
        console.log("Reached end of game log");
    }
}

function displayCurrentEventLog() {
    const eventStr = JSON.stringify(gameLog[currentEventIndex], null, 2);
    eventLog.innerHTML = `<pre>${eventStr}</pre>`;
    eventIndexInput.value = currentEventIndex;
}

function drawEvents(startingIndex, finishingIndex) {
    for (let eventIndex = startingIndex; eventIndex < finishingIndex; eventIndex++) {
        const event = gameLog[eventIndex];
        if (event.data.type == PLACE_SETTLEMENT_EVENT) {
            const payload = event.data.payload[0];
            const settlement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            settlement.setAttribute('href', `#settlement-${colorIdMap[payload.owner]}`);
            const z = payload.hexCorner.z;
            let xOffset, yOffset;
            if (z == 0) {
                xOffset = -25 / 2;
                yOffset = -40;
            } else if (z == 1) {
                xOffset = -50;
                yOffset = 0;
            } else if (z == 2) {
                xOffset = -25 / 2;
                yOffset = 40;
            }
            settlement.setAttribute('x', payload.hexCorner.x * 100 + 50 * payload.hexCorner.y + xOffset);
            settlement.setAttribute('y', payload.hexCorner.y * 75 + 50 + yOffset);
            hexGrid.appendChild(settlement);
        }
    }
}

function removeEvents(startingIndex, finishingIndex) {
    for (let eventIndex = startingIndex; eventIndex > finishingIndex; eventIndex--) {

    }
}

function hexFaceToCoords(hexFace) {
    return {
        x: hexFace.x * getHexWidth() + getHexWidth() / 2 * hexFace.y,
        y: hexFace.y * getHexHeight() * (3 / 4),
    };
}

function hexEdgeToCoords(hexEdge) {
    // TODO: Include z coordinate in calculation
    return {
        x: hexEdge.x * getHexWidth() + getHexWidth() / 2 * hexEdge.y,
        y: hexEdge.y * getHexHeight(),
    };
}

function hexCornerToCoords(hexCorner) {
    // TODO: implement
    return {
        x: 0, y: 0
    }
}

function getHexHeight() {
    return 2 * HEX_SIZE;
}

function getHexWidth() {
    return Math.sqrt(3) * HEX_SIZE;
}

function setImageSource(element, image_type, image_subtype,) {
    const suffix = image_subtype ? `_${image_subtype}` : '';
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `https://colonist.io/dist/images/${image_type}${suffix}.svg`);
}

prevBtn.addEventListener('click', prevEvent);
nextBtn.addEventListener('click', nextEvent);
