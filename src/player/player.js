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
    4: 'green',
    5: 'black',
}

const buildingTypeIdMap = {
    1: 'settlement',
    2: 'city'
}

const colorToUsernameMap = {
    0: 'bank'
};

const eventHandlers = {
    7: handleGameLogEvent,
    10: handleBankStateEvent,
    11: handleDiceRollEvent,
    12: handlePlayerUpdateEvent,
    14: handleBoardDescriptionEvent,
    15: handleBuildEdgeEvent,
    16: handleBuildCornerEvent,
    17: handleMoveRobberEvent,
    28: handleDistributionEvent,
    36: handleTradeOfferEvent,
    37: handleTradeResponseEvent,
    43: handleTradeEvent,
    44: handleGameRulesEvent,
    73: handleChatMessageEvent,
};

const GAME_RULES_EVENT = 44;
const PRE_GAME_EVENT_INDEX = -1;


// Strings in game log messages
const PLAYER_ROLLED_DICE = "strings:socket.playerRolledDice";
const PLAYER_MOVED_ROBBER = "strings:socket.playerMovedRobber";

// Scaling factors for images
const HEX_SIZE = 50;
const BUILDING_SIZE = 40;
const ROBBER_SIZE = 35;

let gameLog = [];
let currentEventIndex = 0;
const gameLogInput = document.getElementById('game-log-input');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const chatContainer = document.getElementById('chat-container');
const logContainer = document.getElementById('log-container');
const eventIndexInput = document.getElementById('event-index');
const eventLog = document.getElementById('event-log');
const hexGrid = document.getElementById('hex-grid');
const hexTilesGroup = document.getElementById('hex-tiles');
const hexEdgesGroup = document.getElementById('hex-edges');
const hexCornersGroup = document.getElementById('hex-corners');
const viewBox = document.getElementById('view-box');
viewBox.setAttributeNS(null, "viewBox", `${getHexWidth() * -3} ${getHexHeight() * -3} ${getHexWidth() * 6} ${getHexHeight() * 6}`)
const robber = document.getElementById('robber');


eventIndexInput.addEventListener('input', (event) => {
    const newEventIndex = Math.min(gameLog.length - 1, Math.max(parseInt(event.target.value), 0));
    processEvents(currentEventIndex, newEventIndex);
    currentEventIndex = newEventIndex;
    displayCurrentEventLog();
});

gameLogInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const fullGameLog = JSON.parse(reader.result);
        let reachedGameRulesEvent = false;

        // Pprocess all events up to the game rules event and store the remainder in the gameLog
        for (let eventIndex = 0; eventIndex < fullGameLog.length; eventIndex++) {
            const event = fullGameLog[eventIndex];
            const data = event.data;
            const eventType = data.type;
            const eventHandler = eventHandlers[eventType];
            if (eventHandler) {
                if (reachedGameRulesEvent) {
                    gameLog.push(fullGameLog[eventIndex]);
                } else {
                    eventHandler(data, false, PRE_GAME_EVENT_INDEX);
                    reachedGameRulesEvent = eventType == GAME_RULES_EVENT;
                }
            } else {
                console.debug(`No event handler for event ${eventIndex} with type ${eventType}`, event);
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
        processEvents(currentEventIndex, currentEventIndex - 1);
        currentEventIndex--;
        displayCurrentEventLog();
    } else {
        console.log("Reached beginning of game log");
    }

}

function nextEvent() {
    if (currentEventIndex < gameLog.length - 1) {
        currentEventIndex++;
        processEvents(currentEventIndex, currentEventIndex + 1);
        displayCurrentEventLog();
    } else {
        console.log("Reached end of game log");
    }
}

function displayCurrentEventLog() {
    const eventStr = JSON.stringify(gameLog[currentEventIndex], null, 2);
    eventLog.innerHTML = `<pre>${eventStr}</pre>`;
    eventIndexInput.value = currentEventIndex;
    nextBtn.disabled = currentEventIndex == gameLog.length - 1;
    prevBtn.disabled = currentEventIndex == 0;
}

/**
 * 
 * @param {*} startingIndex the index in the game log to start processing events from
 * @param {*} finishingIndex the index in the game log to stop processing events at
 */
function processEvents(startingIndex, finishingIndex) {
    const isReversed = startingIndex > finishingIndex;
    for (let eventIndex = startingIndex; eventIndex != finishingIndex; eventIndex += (isReversed ? -1 : 1)) {
        const event = gameLog[eventIndex];
        if (event.data && event.data.type) {
            const eventHandler = eventHandlers[event.data.type];
            if (eventHandler) {
                eventHandler(event.data, isReversed, eventIndex);
            } else {
                console.debug(`No event handler for event ${eventIndex} with type ${event.data.type}`, event);
            }
        } else {
            console.debug(`Event ${eventIndex} is missing a data or data.type field`, event);
        }
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
    const cornerIndex = 5 - 3 * hexCorner.z;
    return hexCornerToCoords(hexFaceGridToPixel(hexCorner), cornerIndex);
}

/**
 * 
 * @param {*} hexEdge the grid coordinates of the hexagon edge.
 *  The edge is described by z from 0 to 2 which indicate the left edges from top to bottom, respectively.
 * @returns the pixel coordinates of the two corners of the hexagon edge
 */
function hexEdgeGridToPixels(hexEdge) {
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
function getHexWidth() {
    return Math.sqrt(3) * HEX_SIZE;
}

/**
 * 
 * @param {*} element the DOM element to set the href attribute of
 * @param {*} image_type the linked image name prefix
 * @param {*} image_subtype the linked image name suffix (optional)
 */
function setImageSource(element, image_type, image_subtype,) {
    const suffix = image_subtype ? `_${image_subtype}` : '';
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `https://colonist.io/dist/images/${image_type}${suffix}.svg`);
}

/**
 * 
 * @param {*} hexCorner the grid coordinates for the corner of the settlement
 * @param {*} color the id of the player who owns the settlement
 */
function drawCornerBuilding(hexCorner, color, buildingTypeId) {
    const buildingType = buildingTypeIdMap[buildingTypeId];
    const buildingId = getDrawnElementId('corner', hexCorner);
    const existingBuilding = document.getElementById(buildingId);
    if (existingBuilding != null) {
        hexCornersGroup.removeChild(existingBuilding);
    }
    const building = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    setImageSource(building, buildingType, colorIdMap[color]);
    building.id = buildingId;
    building.setAttribute('width', BUILDING_SIZE);
    building.setAttribute('height', BUILDING_SIZE);
    const coordinates = hexCornerGridToPixel(hexCorner);
    building.setAttribute('x', coordinates.x - BUILDING_SIZE / 2);
    building.setAttribute('y', coordinates.y - BUILDING_SIZE / 2);
    hexCornersGroup.appendChild(building);
}

/**
 * 
 * @param {*} hexCorner the grid coordinates for the corner of the settlement
 * @param {*} color the id of the player who owns the building
 * @param {*} buildingTypeId the id of the building type to draw
 */
function removeCornerBuilding(hexCorner, color, buildingTypeId) {
    const buildingType = buildingTypeIdMap[buildingTypeId];
    const buildingId = getDrawnElementId('corner', hexCorner);
    const building = document.getElementById(buildingId);
    if (building) {
        hexCornersGroup.removeChild(building);
        if (buildingType == 'city') {
            // When a city is removed, it needs to be replaced with its corresponding settlement
            drawCornerBuilding(hexCorner, color, 1);
        }
    } else {
        console.log(`Could not find building with id ${buildingId}`);
    }

}

function drawEdgeBuilding(hexEdge, color) {
    const buildingId = getDrawnElementId('edge', hexEdge);
    const existingBuilding = document.getElementById(buildingId);
    if (existingBuilding != null) {
        hexEdgesGroup.removeChild(existingBuilding);
    }
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.id = buildingId;
    const coordinates = hexEdgeGridToPixels(hexEdge);
    line.setAttribute('x1', coordinates.p1.x);
    line.setAttribute('y1', coordinates.p1.y);
    line.setAttribute('x2', coordinates.p2.x);
    line.setAttribute('y2', coordinates.p2.y);
    line.setAttribute('stroke', colorIdMap[color]);
    line.setAttribute('stroke-width', 10);
    hexEdgesGroup.appendChild(line);
}

function removeEdgeBuilding(hexEdge) {
    const buildingId = getDrawnElementId('edge', hexEdge);
    const building = document.getElementById(buildingId);
    if (building) {
        hexEdgesGroup.removeChild(building);
    } else {
        console.log(`Could not find building with id ${buildingId}`);
    }
}

function moveRobber(targetHexFace) {
    const robber = document.getElementById('robber');
    const coordinates = hexFaceGridToPixel(targetHexFace);
    robber.setAttribute('x', coordinates.x - getHexWidth() / 2);
    robber.setAttribute('y', coordinates.y - ROBBER_SIZE / 2);
}

function addMessage(message, username, eventIndex, container) {
    const messageId = getMessageId(eventIndex);
    const existingMessage = document.getElementById(messageId);
    if (existingMessage != null) {
        container.removeChild(existingMessage);
    }
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.class = 'chat-message';
    const messageSpan = document.createElement('span');
    messageSpan.textContent = `${username}: ${message}`;
    messageDiv.appendChild(messageSpan);
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function removeMessage(eventIndex, container) {
    const messageId = getMessageId(eventIndex);
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        container.removeChild(messageElement);
        container.scrollTop = container.scrollHeight;
    } else {
        console.log(`Could not find message with id ${messageId}`);
    }
}

function getDrawnElementId(type, coordinates) {
    return `${type}-${coordinates.x}-${coordinates.y}-${coordinates.z}`;
}

function getMessageId(eventIndex) {
    return `message-${eventIndex}`;
}

function handleBankStateEvent(data, isReversed, eventIndex) {
    console.debug(`Bank state event at index ${eventIndex}`, data);
}

function handleDiceRollEvent(data, isReversed, eventIndex) {
    console.debug(`Dice roll event at index ${eventIndex}`, data);

}

function handlePlayerUpdateEvent(data, isReversed, eventIndex) {
    console.debug(`Player update event at index ${eventIndex}`, data);
    if (eventIndex == PRE_GAME_EVENT_INDEX) {
        const playerTable = document.getElementById('player-table');
        for (const player of data.payload) {
            colorToUsernameMap[player.color] = player.username;
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
    }
}

function handleBoardDescriptionEvent(data, isReversed, eventIndex) {
    console.debug(`Board description event at index ${eventIndex}`, data);
    if (eventIndex == PRE_GAME_EVENT_INDEX) {
        // Draw pointy-top hex grid
        // See https://www.redblobgames.com/grids/hexagons/ for explanation of hex grid coordinates
        for (const tile of data.payload.tileState.tiles) {
            const resourceName = tileTypeToResourceName[tile.tileType];
            const hexFace = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            setImageSource(hexFace, 'tile', resourceName);
            hexFace.setAttribute('width', getHexWidth(HEX_SIZE));
            hexFace.setAttribute('height', getHexHeight(HEX_SIZE));
            const hexFaceCenter = hexFaceGridToPixel(tile.hexFace);
            hexFace.setAttribute('x', hexFaceCenter.x - getHexWidth() / 2);
            hexFace.setAttribute('y', hexFaceCenter.y - getHexHeight() / 2);
            hexTilesGroup.appendChild(hexFace);

            // Draw dice number and probability dots
            if (resourceName != 'desert') {
                const diceNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                diceNumber.setAttribute('x', hexFaceCenter.x);
                diceNumber.setAttribute('y', hexFaceCenter.y);
                diceNumber.textContent = tile._diceNumber
                diceNumber.setAttribute('dominant-baseline', 'middle');
                diceNumber.setAttribute('text-anchor', 'middle');
                hexTilesGroup.appendChild(diceNumber);

                const diceProbability = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                diceProbability.setAttribute('x', hexFaceCenter.x);
                diceProbability.setAttribute('y', hexFaceCenter.y + HEX_SIZE / 5);
                diceProbability.textContent = "•".repeat(tile._diceProbability);
                diceProbability.setAttribute('dominant-baseline', 'middle');
                diceProbability.setAttribute('text-anchor', 'middle');
                hexTilesGroup.appendChild(diceProbability);
            } else {
                setImageSource(robber, 'icon', 'robber');
                robber.setAttribute('width', ROBBER_SIZE);
                robber.setAttribute('height', ROBBER_SIZE);
                moveRobber(tile.hexFace);
            }
        }

        // Draw ports
        for (const portEdge of data.payload.portState.portEdges) {
            const port = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            // TODO: Draw port icon as center of outer hexFace with lines to the two corners defining the port
            // port.setAttribute('href', `#${portTypeToResourceName[portEdge.portType]}-port`);
            port.textContent = portTypeToResourceName[portEdge.portType];
            port.setAttribute('dominant-baseline', 'middle');
            port.setAttribute('text-anchor', 'middle');
            const coordinates = edgeMidpointPixel(hexEdgeGridToPixels(portEdge.hexEdge));
            port.setAttribute('x', coordinates.x);
            port.setAttribute('y', coordinates.y);
            hexTilesGroup.appendChild(port);
        }
    }
}

function handleBuildEdgeEvent(data, isReversed, eventIndex) {
    console.debug(`Build edge event at index ${eventIndex}`, data);
    const payload = data.payload[0];
    if (isReversed) {
        removeEdgeBuilding(payload.hexEdge);
        removeMessage(eventIndex, logContainer)
    } else {
        drawEdgeBuilding(payload.hexEdge, payload.owner);
        addMessage(`built a road`, colorToUsernameMap[payload.owner], eventIndex, logContainer);
    }
}

function handleBuildCornerEvent(data, isReversed, eventIndex) {
    console.debug(`Build corner event at index ${eventIndex}`, data);
    payload = data.payload[0];
    if (isReversed) {
        removeCornerBuilding(payload.hexCorner, payload.owner, payload.buildingType);
        removeMessage(eventIndex, logContainer);
    } else {
        drawCornerBuilding(payload.hexCorner, payload.owner, payload.buildingType);
        addMessage(`built a ${buildingTypeIdMap[payload.buildingType]}`, colorToUsernameMap[payload.owner], eventIndex, logContainer);
    }
}

function handleMoveRobberEvent(data, isReversed, eventIndex) {
    console.debug(`Move robber event at index ${eventIndex}`, data);
    if (isReversed) {
        moveRobber(data.payload[0].hexFace);
    } else {
        moveRobber(data.payload[1].hexFace);
    }
}

function handleChatMessageEvent(data, isReversed, eventIndex) {
    console.debug(`Chat message event at ${eventIndex}`, data);
    payload = data.payload;
    if (payload.text != null) {
        const message = payload.text.options.value;
        const username = payload.username;
        if (isReversed) {
            removeMessage(eventIndex, chatContainer);
        } else {
            addMessage(message, username, eventIndex, chatContainer);
        }
    }
}

function handleTradeEvent(data, isReversed, eventIndex) {
    console.debug(`Trade event at ${eventIndex}`, data);
    payload = data.payload;
    const givingPlayer = colorToUsernameMap[payload.givingPlayer];
    const receivingPlayer = colorToUsernameMap[payload.receivingPlayer];
    const givingResources = payload.givingCards.map(tileType => tileTypeToResourceName[tileType]);
    const receivingResources = payload.receivingCards.map(tileType => tileTypeToResourceName[tileType]);
    // TODO: finish incomplete implementation
}

function handleDistributionEvent(data, isReversed, eventIndex) {
    console.debug(`Distribution event at ${eventIndex}`, data);

}

function handleTradeOfferEvent(data, isReversed, eventIndex) {
    console.debug(`Trade offer event at ${eventIndex}`, data);
}

function handleTradeResponseEvent(data, isReversed, eventIndex) {
    console.debug(`Trade response event ${data}`);
}

function handleGameLogEvent(data, isReversed, eventIndex) {
    console.debug(`Game log event at ${eventIndex}`, data);
    if (isReversed) {
        removeMessage(eventIndex, logContainer);
    } else {
        const payload = data.payload;
        const key = payload.text.key;
        switch (key) {
            case PLAYER_ROLLED_DICE:
                addMessage(`rolled ${payload.text.options.diceString}`, payload.username, eventIndex, logContainer);
                break;
            case PLAYER_MOVED_ROBBER:
                addMessage(`moved the robber to ${payload.text.options.tileChatString}`, payload.username, eventIndex, logContainer);
                break;
            default:
                console.debug(`Unhandled game log key ${key}`);
        }
    }
}

function handleGameRulesEvent(data, isReversed, eventIndex) {
    console.debug(`Game rules event at ${eventIndex}`, data);
    if (isReversed) {
        console.error("Game rules event is not reversible");
    }
}





prevBtn.addEventListener('click', prevEvent);
nextBtn.addEventListener('click', nextEvent);
