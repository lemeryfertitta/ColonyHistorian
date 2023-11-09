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

let gameLog = null;
let currentEventIndex = 0;
const gameLogInput = document.getElementById('game-log-input');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const eventContainer = document.getElementById('event-container');
const eventIndexInput = document.getElementById('event-index');
const eventLog = document.getElementById('event-log');
const hexGrid = document.getElementById('hex-grid');
const viewBox = document.getElementById('view-box');
viewBox.setAttributeNS(null, "viewBox", `${getHexWidth() * -3} ${getHexHeight() * -3} ${getHexWidth() * 6} ${getHexHeight() * 6}`)


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
                    const hexFaceCenter = hexFaceGridToPixel(tile.hexFace);
                    hexFace.setAttribute('x', hexFaceCenter.x - getHexWidth() / 2);
                    hexFace.setAttribute('y', hexFaceCenter.y - getHexHeight() / 2);
                    hexGrid.appendChild(hexFace);

                    if (resourceName != 'desert') {
                        const diceNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        diceNumber.setAttribute('x', hexFaceCenter.x);
                        diceNumber.setAttribute('y', hexFaceCenter.y);
                        diceNumber.textContent = tile._diceNumber
                        diceNumber.setAttribute('dominant-baseline', 'middle');
                        diceNumber.setAttribute('text-anchor', 'middle');
                        hexGrid.appendChild(diceNumber);

                        const diceProbability = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        diceProbability.setAttribute('x', hexFaceCenter.x);
                        diceProbability.setAttribute('y', hexFaceCenter.y + HEX_SIZE / 5);
                        diceProbability.textContent = "•".repeat(tile._diceProbability);
                        diceProbability.setAttribute('dominant-baseline', 'middle');
                        diceProbability.setAttribute('text-anchor', 'middle');
                        hexGrid.appendChild(diceProbability);
                    } else {
                        const robber = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                        setImageSource(robber, 'icon', 'robber');
                        robber.setAttribute('x', hexFaceCenter.x + getHexWidth() / 4);
                        robber.setAttribute('y', hexFaceCenter.y + getHexHeight() / 2);
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
                    const coordinates = edgeMidpointPixel(hexEdgeGridToPixel(portEdge.hexEdge));
                    port.setAttribute('x', coordinates.x);
                    port.setAttribute('y', coordinates.y);
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

/**
 * 
 * @param {*} hexFace the grid coordinates of the hexagon face
 * @returns the pixel coordinates of the center of the hexagon face
 */
function hexFaceGridToPixel(hexFace) {
    return {
        x: hexFace.x * getHexWidth() + getHexWidth() / 2 * hexFace.y,
        y: hexFace.y * getHexHeight() * (3 / 4)
    };
}

/**
 * 
 * @param {*} hexCorner the grid coordinates of the hexagon corner. 
 *  The corner is described by z of 0 or 1 which indicates top or bottom corner, respectively.
 * @retruns the pixel coordinates of the hexagon corner
 */
function hexCornerGridToPixel(hexCorner) {
    const cornerIndex = 2 + 3 * hexCorner.z;
    return hexCornerToCoords(hexFaceGridToPixel(hexCorner), cornerIndex);
}

/**
 * 
 * @param {*} hexEdge the grid coordinates of the hexagon edge.
 *  The edge is described by z from 0 to 2 which indicate the left edges from top to bottom, respectively.
 * @returns the pixel coordinates of the two corners of the hexagon edge
 */
function hexEdgeGridToPixel(hexEdge) {
    const cornerIndex = 5 - hexEdge.z;
    return {
        p1: hexCornerToCoords(hexFaceGridToPixel(hexEdge), cornerIndex),
        p2: hexCornerToCoords(hexFaceGridToPixel(hexEdge), cornerIndex - 1)
    }
}

/**
 * 
 * @param {*} edgePixels the pixel coordinates of the two corners of the hexagon edge
 * @returns the pixel coordinates of the midpoint of the hexagon edge
 */
function edgeMidpointPixel(edgePixels) {
    return {
        x: (edgePixels.p1.x + edgePixels.p2.x) / 2,
        y: (edgePixels.p1.y + edgePixels.p2.y) / 2
    }
}

/**
 * 
 * @param {*} hexCoords x and y coordinates of the center of the hexagon
 * @param {*} cornerIndex the corner of the hexagon to get the coordinates of. The corners are numbered 0-5, starting from the top right corner and going clockwise.
 * @returns the pixel coordinates of the specified corner of the hexagon
 */
function hexCornerToCoords(hexCoords, cornerIndex) {
    const angleDegrees = 60 * cornerIndex - 30;
    const angleRadians = Math.PI / 180 * angleDegrees;
    return {
        x: hexCoords.x + HEX_SIZE * Math.cos(angleRadians),
        y: hexCoords.y + HEX_SIZE * Math.sin(angleRadians)
    };
}

/**
 * @returns the pixel height of the hexagon
 */
function getHexHeight() {
    return 2 * HEX_SIZE;
}

/**
 * 
 * @returns the pixel width of the hexagon
 */
 */
function getHexWidth() {
    return Math.sqrt(3) * HEX_SIZE;
}

function setImageSource(element, image_type, image_subtype,) {
    const suffix = image_subtype ? `_${image_subtype}` : '';
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `https://colonist.io/dist/images/${image_type}${suffix}.svg`);
}

prevBtn.addEventListener('click', prevEvent);
nextBtn.addEventListener('click', nextEvent);
