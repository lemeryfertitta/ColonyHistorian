const bankCards = ['lumber', 'brick', 'wool', 'grain', 'ore', 'devcardback'];
const handCards = ['lumber', 'brick', 'wool', 'grain', 'ore', 'knight', 'vp', 'monopoly', 'roadbuilding', 'yearofplenty'];

const handCardIdToName = {
    1: 'lumber',
    2: 'brick',
    3: 'wool',
    4: 'grain',
    5: 'ore',
    7: 'knight',
    8: 'vp',
    9: 'monopoly',
    10: 'roadbuilding',
    11: 'yearofplenty',
}

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

const colorIdToUsernameMap = {
    0: 'bank'
};

const usernameToColorMap = {};

const eventHandlers = {
    7: handleGameLogEvent,
    8: handlePlayOrderEvent,
    9: handleTurnStateEvent,
    10: handleBankStateEvent,
    // 11: handleDiceRollEvent,
    12: handlePlayerUpdateEvent,
    14: handleBoardDescriptionEvent,
    15: handleBuildEdgeEvent,
    16: handleBuildCornerEvent,
    17: handleMoveRobberEvent,
    // 36: handleTradeOfferEvent,
    // 37: handleTradeResponseEvent,
    // 43: handleTradeEvent,
    44: handleGameRulesEvent,
    73: handleChatMessageEvent,
};

const devCardIdMap = {
    7: 'knight',
    8: 'vp',
    9: 'monopoly',
    10: 'roadbuilding',
    11: 'yearofplenty',
}

const KNIGHT_ID = 7;
const TURN_STATE_EVENT = 9;
const GAME_RULES_EVENT = 44;
const PRE_GAME_EVENT_INDEX = -1;


// Strings in game log messages
const messageMappers = {
    "strings:socket.playerRolledDice": (options) => `${getPlayerNameString(options.playerName)} rolled ${options.diceString}`,
    "strings:socket.playerMovedRobber": (options) => `${getPlayerNameString(options.playerName)} moved the robber to ${options.tileChatString}`,
    "strings:socket.playerPlacedPiece": (options) => `${getPlayerNameString(options.playerName)} built a ${options.pieceString}`,
    "strings:socket.playerReceivedStartingResources": (options) => `${getPlayerNameString(options.playerName)} received starting resources ${options.cardsString}`,
    "strings:socket.playerGotCards": (options) => `${getPlayerNameString(options.playerName)} received ${options.cardsString}`,
    "strings:socket.playerBuiltPiece": (options) => `${getPlayerNameString(options.playerName)} built a ${options.pieceString}`,
    "strings:socket.playerWantsToTradeWith": (options) => `${getPlayerNameString(options.playerName)} wants to trade ${options.wantedCardString} for ${options.offeredCardString}`,
    "strings:socket.tileBlockedByRobber": (options) => `${options.tileString} is blocked by the robber`,
    "strings:socket.stolenResourceCards.thief": (options) => `You stole ${options.cardString} from ${getPlayerNameString(options.playerName)}`,
    "strings:socket.stolenResourceCards.victim": (options) => `${getPlayerNameString(options.playerName)} stole ${options.cardString} from you`,
    "strings:socket.stolenResourceCards.closed": (options) => `${getPlayerNameString(options.thiefName)} stole from ${getPlayerNameString(options.victimName)}`,
    "strings:socket.playerBoughtCard": (options) => `${getPlayerNameString(options.playerName)} bought a development card`,
    "strings:socket.playerTradedWithBank": (options) => `${getPlayerNameString(options.playerName)} traded ${options.givenCardString} for ${options.receivedCardString} with the bank`,
    "strings:socket.playerWantsToCounterOfferWith": (options) => `${getPlayerNameString(options.counterOfferCreator)} wants to counter offer with ${options.offeredCardString} for ${options.wantedCardString}`,
    "strings:socket.playerTradedWithPlayer": (options) => `${getPlayerNameString(options.playerName)} traded ${options.givenCardString} for ${options.receivedCardString} with ${getPlayerNameString(options.acceptingPlayerName)}`,
    "strings:socket.playerPlayedDevelopmentCard": (options) => `${getPlayerNameString(options.playerName)} played a ${options.cardImage}`,
    "strings:socket.playerTookFromBank": (options) => `${getPlayerNameString(options.playerName)} took ${options.cardString} from the bank`,
    "strings:socket.playerReceivedAchievement": (options) => `${getPlayerNameString(options.playerName)} took ${options.achievementString}`,
    "strings:socket.playerStoleUsingMonopoly": (options) => `${getPlayerNameString(options.playerName)} stole ${options.amountStolen} ${options.cardString} using a monopoly`,
    "strings:socket.playerPassedAchievementTo": (options) => `${getPlayerNameString(options.newPlayerName)} took ${options.achievementString} from ${getPlayerNameString(options.oldPlayerName)}`,
    "strings:socket.playerDiscarded": (options) => `${getPlayerNameString(options.playerName)} discarded ${options.cardString}`,
    "strings:socket.playerWonTheGame": (options) => `${getPlayerNameString(options.playerName)} won the game!`,
    "strings:socket.playerDisconnected": (options) => `${getPlayerNameString(options.playerName)} disconnected`,
    "strings:socket.playerReconnected": (options) => `${getPlayerNameString(options.playerName)} reconnected`,
}

// Scaling factors for images
const HEX_SIZE = 50;
const BUILDING_SIZE = 40;
const ROBBER_SIZE = 35;
const CARD_SIZE = 40;
const PROB_SIZE = 35;
const PORT_SIZE = 40;
const DOCK_SIZE = 4;

let gameLog = [];
let currentTurnNumber = 0;
let myColor = null;

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
viewBox.setAttributeNS(null, "viewBox", `${getHexWidth() * -4} ${getHexHeight() * -3} ${getHexWidth() * 8} ${getHexHeight() * 6}`)
const robber = document.getElementById('robber');
setRobberAttributes();
drawBankCards();
drawHandCards();


eventIndexInput.addEventListener('input', (event) => {
    const newEventIndex = Math.min(gameLog.length, Math.max(parseInt(event.target.value), 0));
    processEvents(currentTurnNumber, newEventIndex);
});

gameLogInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const fullGameLog = JSON.parse(reader.result);
        let reachedGameRulesEvent = false;
        let processingTurnPlayer = null;
        let processingTurnNumber = -1;

        // Process all events up to the game rules event and store the remainder in the gameLog
        for (let eventIndex = 0; eventIndex < fullGameLog.length; eventIndex++) {
            const event = fullGameLog[eventIndex];
            const data = event.data;
            const eventType = data.type;
            const eventHandler = eventHandlers[eventType];
            if (eventHandler) {
                if (reachedGameRulesEvent) {
                    if (eventType == TURN_STATE_EVENT) {
                        const nextTurnPlayer = colorIdToUsernameMap[data.payload.currentTurnPlayerColor];
                        if (nextTurnPlayer != processingTurnPlayer) {
                            processingTurnNumber++;
                            processingTurnPlayer = nextTurnPlayer;
                            gameLog.push([data]);
                        } else {
                            console.debug("Ignoring turn state event for same player", data)
                        }
                    } else {
                        if (processingTurnNumber >= 0) {
                            gameLog[processingTurnNumber].push(data);
                        }
                    }
                } else {
                    eventHandler(data, false, PRE_GAME_EVENT_INDEX);
                    reachedGameRulesEvent = eventType == GAME_RULES_EVENT;
                }
            } else {
                console.debug(`No event handler for event ${eventIndex} with type ${eventType}`, event);
            }
        }
        eventIndexInput.max = gameLog.length;
    };
    console.log(gameLog);
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
    if (currentTurnNumber > 0) {
        processEvents(currentTurnNumber, currentTurnNumber - 1);
    } else {
        console.log("Reached beginning of game log");
    }

}

function nextEvent() {
    if (currentTurnNumber < gameLog.length) {
        processEvents(currentTurnNumber, currentTurnNumber + 1);
    } else {
        console.log("Reached end of game log");
    }
}

/**
 * 
 * @param {*} startingTurnNumber the index in the game log to start processing events from
 * @param {*} endingTurnNumber the index in the game log to stop processing events at
 */
function processEvents(startingTurnNumber, endingTurnNumber) {
    const isReversed = startingTurnNumber > endingTurnNumber;
    const turnNumberLabel = document.getElementById('turn-number-label');
    for (let turnNumber = startingTurnNumber; turnNumber != endingTurnNumber; turnNumber += (isReversed ? -1 : 1)) {
        const turnLogs = gameLog[turnNumber];
        if (turnLogs) {
            for (let turnLogIndex = 0; turnLogIndex < turnLogs.length; turnLogIndex++) {
                const log = turnLogs[turnLogIndex];
                const eventHandler = eventHandlers[log.type];
                const turnLogIdentifier = `${turnNumber}-${turnLogIndex}`;
                if (eventHandler) {
                    eventHandler(log, isReversed, turnLogIdentifier);
                } else {
                    console.debug(`No event handler for log ${turnLogIdentifier} with type ${log.type}`, log);
                }
            }
        } else {
            console.debug(`No logs for turn ${turnNumber}`);
        }
    }
    currentTurnNumber = endingTurnNumber;
    turnNumberLabel.textContent = `Turn ${currentTurnNumber}`;
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
 * Fill in the bank container with cards and counts, initially all set to 0
 */
function drawBankCards() {
    const cardCounts = document.getElementById('bank-counts');
    const bankImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    setImageSource(bankImage, 'bank');
    bankImage.setAttribute('width', CARD_SIZE);
    bankImage.setAttribute('height', CARD_SIZE);
    bankImage.setAttribute('x', CARD_SIZE / 2);
    bankImage.setAttribute('y', CARD_SIZE / 4);
    cardCounts.appendChild(bankImage);
    const xOffset = 2 * CARD_SIZE;
    for (let cardIndex = 0; cardIndex < bankCards.length; cardIndex++) {
        const card = bankCards[cardIndex];
        const cardCountGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const cardImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        setImageSource(cardImage, 'card', card);
        cardImage.setAttribute('width', CARD_SIZE);
        cardImage.setAttribute('height', CARD_SIZE * 1.5);
        cardImage.setAttribute('x', cardIndex * CARD_SIZE + xOffset);
        cardImage.setAttribute('y', 0);
        cardCountGroup.appendChild(cardImage);
        const cardCountText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        cardCountText.id = `${card}-bank-count`;
        cardCountText.textContent = 0;
        cardCountText.setAttribute('x', cardIndex * CARD_SIZE + CARD_SIZE / 2 + xOffset);
        cardCountText.setAttribute('y', CARD_SIZE * (1 / 4));
        cardCountText.setAttribute('dominant-baseline', 'middle');
        cardCountText.setAttribute('text-anchor', 'middle');
        cardCountGroup.appendChild(cardCountText);
        cardCounts.appendChild(cardCountGroup);
    }
}

function drawHandCards() {
    const cardCounts = document.getElementById('hand-counts');
    const playerName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    playerName.id = 'my-name';
    playerName.setAttribute('dominant-baseline', 'middle');
    playerName.setAttribute('text-anchor', 'middle');
    playerName.setAttribute('width', CARD_SIZE);
    playerName.setAttribute('height', CARD_SIZE);
    playerName.setAttribute('x', CARD_SIZE);
    playerName.setAttribute('y', CARD_SIZE / 2);
    cardCounts.appendChild(playerName);
    const xOffset = 2 * CARD_SIZE;
    for (let cardIndex = 0; cardIndex < handCards.length; cardIndex++) {
        const card = handCards[cardIndex];
        const cardCountGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const cardImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        setImageSource(cardImage, 'card', card);
        cardImage.setAttribute('width', CARD_SIZE);
        cardImage.setAttribute('height', CARD_SIZE * 1.5);
        cardImage.setAttribute('x', cardIndex * CARD_SIZE + xOffset);
        cardImage.setAttribute('y', 0);
        cardCountGroup.appendChild(cardImage);
        const cardCountText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        cardCountText.id = `${card}-hand-count`;
        cardCountText.textContent = 0;
        cardCountText.setAttribute('x', cardIndex * CARD_SIZE + CARD_SIZE / 2 + xOffset);
        cardCountText.setAttribute('y', CARD_SIZE * (1 / 4));
        cardCountText.setAttribute('dominant-baseline', 'middle');
        cardCountText.setAttribute('text-anchor', 'middle');
        cardCountGroup.appendChild(cardCountText);
        cardCounts.appendChild(cardCountGroup);
    }
}

/**
 * 
 * @param {*} hexFaceCenter the coordinates of the center of the hexagon face to draw
 * @param {*} resourceName the name of the resource to draw
 */
function drawHexFace(hexFaceCenter, resourceName) {
    const hexFace = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    setImageSource(hexFace, 'tile', resourceName);
    hexFace.setAttribute('width', getHexWidth(HEX_SIZE));
    hexFace.setAttribute('height', getHexHeight(HEX_SIZE));
    hexFace.setAttribute('x', hexFaceCenter.x - getHexWidth() / 2);
    hexFace.setAttribute('y', hexFaceCenter.y - getHexHeight() / 2);
    hexTilesGroup.appendChild(hexFace);
}

/**
 * 
 * @param {*} hexFaceCenter the coordinates of the center of the hexagon face to draw on
 * @param {*} number the dice roll to draw
 */
function drawProbability(hexFaceCenter, number) {
    const diceProbability = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    setImageSource(diceProbability, 'prob', number);
    diceProbability.setAttribute('width', PROB_SIZE);
    diceProbability.setAttribute('height', PROB_SIZE);
    diceProbability.setAttribute('x', hexFaceCenter.x - PROB_SIZE / 2);
    diceProbability.setAttribute('y', hexFaceCenter.y - PROB_SIZE / 10);
    hexTilesGroup.appendChild(diceProbability);
}

/**
 * Draw a dashed line to represent the dock
 * 
 * @param {*} p1 Starting point (x, y) of dock line
 * @param {*} p2 Ending point (x, y) of dock line
 */
function drawDock(p1, p2) {
    const dockLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    dockLine.setAttribute('x1', p1.x);
    dockLine.setAttribute('y1', p1.y);
    dockLine.setAttribute('x2', p2.x);
    dockLine.setAttribute('y2', p2.y);
    dockLine.setAttribute('stroke', 'brown');
    dockLine.setAttribute('stroke-width', DOCK_SIZE);
    dockLine.setAttribute('stroke-dasharray', DOCK_SIZE)
    hexTilesGroup.appendChild(dockLine);
}

/**
 * Draw the port image and dock lines for a port at a given edge
 * 
 * @param {*} portEdge the grid coordinates of the port edge to draw
 */
function drawPort(portEdge) {
    const hexEdgePixels = hexEdgeGridToPixels(portEdge.hexEdge)
    let portHexX = portEdge.hexEdge.x;
    let portHexY = portEdge.hexEdge.y;
    if (portEdge.hexEdge.z == 0) {
        portHexY += portHexY < 0 ? -1 : 0;
    } else if (portEdge.hexEdge.z == 1) {
        portHexX += portHexX > 0 ? 0 : -1;
    } else if (portEdge.hexEdge.z == 2) {
        portHexX += portHexX > 0 ? 0 : -1;
        portHexY += portHexX > 0 ? 0 : 1;
    } else {
        console.error("Unexpected z value when drawing ports", portEdge);
    }
    hexFaceCenter = hexFaceGridToPixel({ x: portHexX, y: portHexY });

    drawDock(hexEdgePixels.p1, hexFaceCenter);
    drawDock(hexEdgePixels.p2, hexFaceCenter);

    const portImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    setImageSource(portImage, 'port', portTypeToResourceName[portEdge.portType]);
    portImage.setAttribute('width', PORT_SIZE);
    portImage.setAttribute('height', PORT_SIZE);

    portImage.setAttribute('x', hexFaceCenter.x - PORT_SIZE / 2);
    portImage.setAttribute('y', hexFaceCenter.y - PORT_SIZE / 2);
    hexTilesGroup.appendChild(portImage);
}

function setRobberAttributes() {
    setImageSource(robber, 'icon', 'robber');
    robber.setAttribute('width', ROBBER_SIZE);
    robber.setAttribute('height', ROBBER_SIZE);
    robber.setAttribute('visibility', 'hidden');
}

/**
 * 
 * @param {*} hexCorner the grid coordinates for the corner of the settlement
 * @param {*} color the id of the player who owns the settlement
 */
function drawCorner(hexCorner, color, buildingTypeId) {
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
function eraseCorner(hexCorner, color, buildingTypeId) {
    const buildingType = buildingTypeIdMap[buildingTypeId];
    const buildingId = getDrawnElementId('corner', hexCorner);
    const building = document.getElementById(buildingId);
    if (building) {
        hexCornersGroup.removeChild(building);
        if (buildingType == 'city') {
            // When a city is removed, it needs to be replaced with its corresponding settlement
            drawCorner(hexCorner, color, 1);
        }
    } else {
        console.log(`Could not find building with id ${buildingId}`);
    }

}

function drawEdge(hexEdge, color) {
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

function eraseEdge(hexEdge) {
    const buildingId = getDrawnElementId('edge', hexEdge);
    const building = document.getElementById(buildingId);
    if (building) {
        hexEdgesGroup.removeChild(building);
    } else {
        console.log(`Could not find building with id ${buildingId}`);
    }
}

function moveRobber(targetHexFace) {
    const coordinates = hexFaceGridToPixel(targetHexFace);
    robber.setAttribute('x', coordinates.x - getHexWidth() / 2);
    robber.setAttribute('y', coordinates.y - ROBBER_SIZE / 2);
    robber.setAttribute('visibility', 'visibile');
}

function drawMessage(message, eventIndex, container) {
    const messageId = getMessageId(eventIndex);
    const existingMessage = document.getElementById(messageId);
    if (existingMessage != null) {
        container.removeChild(existingMessage);
    }
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.class = 'chat-message';
    const messageSpan = document.createElement('span');
    messageSpan.innerHTML = message;
    messageDiv.appendChild(messageSpan);
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function eraseMessage(eventIndex, container) {
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

function getPlayerNameString(username) {
    const span = document.createElement('span');
    span.style.color = usernameToColorMap[username];
    span.style.fontWeight = 'bold';
    span.textContent = username;
    return span.outerHTML
}

function handleBankStateEvent(data, isReversed, eventIndex) {
    console.debug(`Bank state event at index ${eventIndex}`, data);
    let cardCounts = {
        "lumber": 0,
        "brick": 0,
        "wool": 0,
        "grain": 0,
        "ore": 0,
        "devcardback": data.payload.hiddenDevelopmentCards.length,
    }
    for (const resource of data.payload.resourceCards) {
        const resourceName = tileTypeToResourceName[resource];
        if (resourceName) {
            cardCounts[resourceName]++;
        }
    }
    for (const [card, count] of Object.entries(cardCounts)) {
        const cardCount = document.getElementById(`${card}-bank-count`);
        cardCount.textContent = count;
    }
}

function handleDiceRollEvent(data, isReversed, eventIndex) {
    console.debug(`Dice roll event at index ${eventIndex}`, data);

}

function getPlayerRow(username) {
    const rowId = `player-${username}`;
    const row = document.getElementById(rowId);
    if (row) {
        return row;
    } else {
        const newRow = document.createElement('tr');
        newRow.id = `player-${username}`;
        const playerTable = document.getElementById('player-table');
        playerTable.appendChild(newRow);
        return newRow;
    }
}

function getPlayerCell(username, cellType) {
    const cellId = `player-${username}-${cellType}`;
    const cell = document.getElementById(cellId);
    if (cell) {
        return cell;
    } else {
        const newCell = document.createElement('td');
        newCell.id = cellId;
        const row = getPlayerRow(username);
        row.appendChild(newCell);
        return newCell;
    }
}

function handlePlayerUpdateEvent(data, isReversed, eventIndex) {
    console.debug(`Player update event at index ${eventIndex}`, data);
    for (const player of data.payload) {
        const username = player.username;
        colorIdToUsernameMap[player.color] = username;
        usernameToColorMap[username] = colorIdMap[player.color];

        const nameCell = getPlayerCell(username, 'name');
        nameCell.innerHTML = getPlayerNameString(username);

        const pointsCell = getPlayerCell(username, 'points');
        pointsCell.textContent = player.victoryPointState._totalPublicVictoryPoints;

        const resourcesCell = getPlayerCell(username, 'resources');
        resourcesCell.textContent = player.resourceCards.length;

        const devCardsCell = getPlayerCell(username, 'dev-cards');
        devCardsCell.textContent = player.developmentCards.length;

        const armyCell = getPlayerCell(username, 'largest-army');
        let armyCount = 0;
        for (const devCard of player.developmentCardsUsed) {
            armyCount += devCard == KNIGHT_ID ? 1 : 0;
        }
        armyCell.innerHTML = player.hasLargestArmy ? `<b>${armyCount}</b>` : armyCount;

        const roadCell = getPlayerCell(username, 'longest-road');
        roadCell.innerHTML = player.hasLongestRoad ? `<b>${player.longestRoad}</b>` : player.longestRoad;

        if (player.color == myColor) {
            const playerName = document.getElementById('my-name');
            playerName.textContent = username;
            playerName.setAttribute("fill", colorIdMap[myColor])
            playerName.setAttribute("font-weight", "bold")
            const cardCounts = {}
            for (const resourceId of player.resourceCards) {
                cardCounts[resourceId] = (cardCounts[resourceId] || 0) + 1;
            }
            for (const devId of player.developmentCards) {
                cardCounts[devId] = (cardCounts[devId] || 0) + 1;
            }
            for (const [cardId, cardName] of Object.entries(handCardIdToName)) {
                const handCardCount = document.getElementById(`${cardName}-hand-count`);
                handCardCount.textContent = cardCounts[cardId] || 0;
            }
        }
    }

}

function handleBoardDescriptionEvent(data, isReversed, eventIndex) {
    console.debug(`Board description event at index ${eventIndex}`, data);
    if (eventIndex == PRE_GAME_EVENT_INDEX) {
        // Draw pointy-top hex grid
        // See https://www.redblobgames.com/grids/hexagons/ for explanation of hex grid coordinates
        for (const tile of data.payload.tileState.tiles) {
            const hexFaceCenter = hexFaceGridToPixel(tile.hexFace);
            const resourceName = tileTypeToResourceName[tile.tileType];
            drawHexFace(hexFaceCenter, resourceName);
            if (resourceName != 'desert') {
                drawProbability(hexFaceCenter, tile._diceNumber);
            } else {
                moveRobber(tile.hexFace);
            }
        }

        for (const portEdge of data.payload.portState.portEdges) {
            drawPort(portEdge);
        }
    }
}

function handleTurnStateEvent(data, isReversed, eventIndex) {
    console.debug(`Turn state event at index ${eventIndex}`, data);
    const currentTurnPlayer = colorIdToUsernameMap[data.payload.currentTurnPlayerColor];
    for (const username of Object.keys(usernameToColorMap)) {
        const playerRow = getPlayerRow(username);
        if (username == currentTurnPlayer) {
            playerRow.style.backgroundColor = 'lightgray';
        } else {
            playerRow.style.backgroundColor = 'darkgray';
        }
    }
}

function handleBuildEdgeEvent(data, isReversed, eventIndex) {
    console.debug(`Build edge event at index ${eventIndex}`, data);
    const payload = data.payload[0];
    if (isReversed) {
        eraseEdge(payload.hexEdge);
    } else {
        drawEdge(payload.hexEdge, payload.owner);
    }
}

function handleBuildCornerEvent(data, isReversed, eventIndex) {
    console.debug(`Build corner event at index ${eventIndex}`, data);
    payload = data.payload[0];
    if (isReversed) {
        eraseCorner(payload.hexCorner, payload.owner, payload.buildingType);
    } else {
        drawCorner(payload.hexCorner, payload.owner, payload.buildingType);
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
            eraseMessage(eventIndex, chatContainer);
        } else {
            drawMessage(`${getPlayerNameString(username)}: ${message}`, eventIndex, chatContainer);
        }
    }
}

function handleTradeEvent(data, isReversed, eventIndex) {
    console.debug(`Trade event at ${eventIndex}`, data);
    payload = data.payload;
    const givingPlayer = colorIdToUsernameMap[payload.givingPlayer];
    const receivingPlayer = colorIdToUsernameMap[payload.receivingPlayer];
    const givingResources = payload.givingCards.map(tileType => tileTypeToResourceName[tileType]);
    const receivingResources = payload.receivingCards.map(tileType => tileTypeToResourceName[tileType]);
    // TODO: finish incomplete implementation
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
        eraseMessage(eventIndex, logContainer);
    } else {
        const payload = data.payload;
        const key = payload.text.key;
        const messageMapper = messageMappers[key];
        if (messageMapper) {
            drawMessage(messageMapper(payload.text.options), eventIndex, logContainer)
        } else {
            console.debug(`No message mapper`, payload);
        }
    }
}

function handleGameRulesEvent(data, isReversed, eventIndex) {
    console.debug(`Game rules event at ${eventIndex}`, data);
    if (isReversed) {
        console.error("Game rules event is not reversible");
    }
}

function handlePlayOrderEvent(data, isReversed, eventIndex) {
    console.debug(`Play order event at ${eventIndex}`, data);
    if (isReversed) {
        console.error("Play order event is not reversible");
    } else {
        myColor = data.payload.myColor;
    }
}




prevBtn.addEventListener('click', prevEvent);
nextBtn.addEventListener('click', nextEvent);
