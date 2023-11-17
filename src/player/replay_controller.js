// See https://www.redblobgames.com/grids/hexagons/ for explanation of hex grid coordinates

const bankCards = ["lumber", "brick", "wool", "grain", "ore", "devcardback"];
const handCards = [
  "lumber",
  "brick",
  "wool",
  "grain",
  "ore",
  "knight",
  "vp",
  "monopoly",
  "roadbuilding",
  "yearofplenty",
];

const handCardIdToName = {
  1: "lumber",
  2: "brick",
  3: "wool",
  4: "grain",
  5: "ore",
  7: "knight",
  8: "vp",
  9: "monopoly",
  10: "roadbuilding",
  11: "yearofplenty",
};

// Tile IDs in WebSocket messages
const tileTypeToResourceName = {
  0: "desert",
  1: "lumber",
  2: "brick",
  3: "wool",
  4: "grain",
  5: "ore",
};

// Port IDs in WebSocket messages
const portTypeToResourceName = {
  2: "lumber",
  3: "brick",
  4: "wool",
  5: "grain",
  6: "ore",
};

// Color IDs in WebSocket messages
const colorIdsToNames = {
  // TODO: Figure out remaining colors
  1: "red",
  2: "blue",
  3: "orange",
  4: "green",
  5: "black",
  6: "bronze",
  7: "silver",
  8: "gold",
  9: "white",
  10: "purple",
  11: "mysticblue",
};

const colorNamesToHex = {
  red: "#E27174",
  blue: "#223697",
  orange: "#E09742",
  green: "#62B95D",
  black: "#3e3e3e",
  bronze: "#a86755",
  silver: "#848484",
  gold: "#c7ae61",
  white: "#9E9E9E",
  purple: "#9D55AF",
  mysticblue: "#256CA7",
};

const buildingTypeIdMap = {
  1: "settlement",
  2: "city",
};

const eventHandlers = {
  7: handleLogMessageEvent,
  14: handleBoardDescriptionEvent,
  15: handleBuildEdgeEvent,
  16: handleBuildCornerEvent,
  17: handleMoveRobberEvent,
  73: handleChatMessageEvent,
};

const devCardIdMap = {
  7: "knight",
  8: "vp",
  9: "monopoly",
  10: "roadbuilding",
  11: "yearofplenty",
};

const cardStringTranslations = {
  developementcard: "card_devcardback",
};

const wordReplacements = {
  brick: "card_brick",
  grain: "card_grain",
  wheat: "card_grain",
  lumber: "card_lumber",
  wood: "card_lumber",
  ore: "card_ore",
  sheep: "card_wool",
  wool: "card_wool",
  city: "city_black",
  settlement: "settlement_black",
  largestarmy: "icon_largest_army",
  longestroad: "icon_longest_road",
};

const commandReplacements = {
  ":road:": "road_black",
  ":card_brick:": "card_brick",
  ":card_grain:": "card_grain",
  ":card_lumber:": "card_lumber",
  ":card_ore:": "card_ore",
  ":card_wool:": "card_wool",
  ":card_knight:": "card_knight",
  ":card_vp:": "card_vp",
  ":card_monopoly:": "card_monopoly",
  ":card_roadbuilding:": "card_roadbuilding",
  ":card_yearofplenty:": "card_yearofplenty",
  ":card_devcardback:": "card_devcardback",
  ":card_rescardback:": "card_rescardback",
  ":robber:": "icon_robber",
  ":dice:1": "dice_1",
  ":dice:2": "dice_2",
  ":dice:3": "dice_3",
  ":dice:4": "dice_4",
  ":dice:5": "dice_5",
  ":dice:6": "dice_6",
  ":prob:2": "prob_2",
  ":prob:3": "prob_3",
  ":prob:4": "prob_4",
  ":prob:5": "prob_5",
  ":prob:6": "prob_6",
  ":prob:8": "prob_8",
  ":prob:9": "prob_9",
  ":prob:10": "prob_10",
  ":prob:11": "prob_11",
  ":prob:12": "prob_12",
  ":tile_desert:": "tile_desert",
  ":tile_lumber:": "tile_lumber",
  ":tile_brick:": "tile_brick",
  ":tile_wool:": "tile_wool",
  ":tile_grain:": "tile_grain",
  ":tile_ore:": "tile_ore",
};

const KNIGHT_ID = 7;

// Strings in game log messages
const messageMappers = {
  "strings:socket.playerRolledDice": (options) =>
    `${options.playerName} rolled ${options.diceString}`,
  "strings:socket.playerMovedRobber": (options) =>
    `${options.playerName} moved the robber to ${options.tileChatString}`,
  "strings:socket.playerPlacedPiece": (options) =>
    `${options.playerName} placed a ${options.pieceString}`,
  "strings:socket.playerReceivedStartingResources": (options) =>
    `${options.playerName} received starting resources ${options.cardsString}`,
  "strings:socket.playerGotCards": (options) =>
    `${options.playerName} received ${options.cardsString}`,
  "strings:socket.playerBuiltPiece": (options) =>
    `${options.playerName} built a ${options.pieceString}`,
  "strings:socket.playerWantsToTradeWith": (options) =>
    `${options.playerName} wants to trade ${options.wantedCardString} for ${options.offeredCardString}`,
  "strings:socket.tileBlockedByRobber": (options) =>
    `${options.tileString} is blocked by the robber`,
  "strings:socket.stolenResourceCards.thief": (options) =>
    `You stole ${options.cardString} from ${options.playerName}`,
  "strings:socket.stolenResourceCards.victim": (options) =>
    `${options.playerName} stole ${options.cardString} from you`,
  "strings:socket.stolenResourceCards.closed": (options) =>
    `${options.thiefName} stole from ${options.victimName}`,
  "strings:socket.playerBoughtCard": (options) =>
    `${options.playerName} bought a development card`,
  "strings:socket.playerTradedWithBank": (options) =>
    `${options.playerName} traded ${options.givenCardString} for ${options.receivedCardString} with the bank`,
  "strings:socket.playerWantsToCounterOfferWith": (options) =>
    `${options.counterOfferCreator} wants to counter offer with ${options.offeredCardString} for ${options.wantedCardString}`,
  "strings:socket.playerTradedWithPlayer": (options) =>
    `${options.playerName} traded ${options.givenCardString} for ${options.receivedCardString} with ${options.acceptingPlayerName}`,
  "strings:socket.playerPlayedDevelopmentCard": (options) =>
    `${options.playerName} played a ${options.cardImage}`,
  "strings:socket.playerTookFromBank": (options) =>
    `${options.playerName} took ${options.cardString} from the bank`,
  "strings:socket.playerReceivedAchievement": (options) =>
    `${options.playerName} took ${options.achievementString}`,
  "strings:socket.playerStoleUsingMonopoly": (options) =>
    `${options.playerName} stole ${options.amountStolen} ${options.cardString} using a monopoly`,
  "strings:socket.playerPassedAchievementTo": (options) =>
    `${options.newPlayerName} took ${options.achievementString} from ${options.oldPlayerName}`,
  "strings:socket.playerDiscarded": (options) =>
    `${options.playerName} discarded ${options.cardString}`,
  "strings:socket.playerWonTheGame": (options) =>
    `${options.playerName} won the game!`,
  "strings:socket.playerDisconnected": (options) =>
    `${options.playerName} disconnected`,
  "strings:socket.playerReconnected": (options) =>
    `${options.playerName} reconnected`,
};

// Scaling factors for images
const HEX_SIZE = 50;
const BUILDING_SIZE = 40;
const ROBBER_SIZE = 35;
const CARD_SIZE = 40;
const PROB_SIZE = 35;
const PORT_SIZE = 40;
const DOCK_SIZE = 4;
const TEXT_IMAGE_SIZE = 15;

let gameReplay = null;
let drawnTurnNumber = -1;

const gameLogInput = document.getElementById("game-log-input");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const chatContainer = document.getElementById("chat-container");
const logContainer = document.getElementById("log-container");
const eventIndexInput = document.getElementById("event-index");
const hexGrid = document.getElementById("hex-grid");
const hexTilesGroup = document.getElementById("hex-tiles");
const hexEdgesGroup = document.getElementById("hex-edges");
const hexCornersGroup = document.getElementById("hex-corners");
const bankCounts = document.getElementById("bank-counts");
const handCounts = document.getElementById("hand-counts");
const robber = document.getElementById("robber");
const playerTable = document.getElementById("player-table");
const turnNumberLabel = document.getElementById("turn-number-label");

eventIndexInput.addEventListener("input", (event) => {
  const newEventIndex = Math.min(
    gameReplay.length,
    Math.max(parseInt(event.target.value), 0)
  );
  drawTurn(newEventIndex);
});

gameLogInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    gameReplay = new GameReplay(JSON.parse(reader.result));
    console.log("Replay parsed", gameReplay);

    eventIndexInput.max = gameReplay.turns.length;
    eventIndexInput.disabled = false;
    eventIndexInput.value = 0;

    hexTilesGroup.innerHTML = "";
    hexEdgesGroup.innerHTML = "";
    hexCornersGroup.innerHTML = "";
    chatContainer.innerHTML = "";
    logContainer.innerHTML = "";
    playerTable.innerHTML = "";
    turnNumberLabel.innerHTML = "";
    handCounts.innerHTML = "";
    bankCounts.innerHTML = "";
    setViewboxAttributes();
    setRobberAttributes();
    drawBankCards();
    drawHandCards();

    drawnTurnNumber = -1;
    drawTurn(0);
  };
  reader.readAsText(file);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    prevEvent();
  } else if (event.key === "ArrowRight") {
    nextEvent();
  }
});

function prevEvent() {
  if (drawnTurnNumber > 0) {
    drawTurn(drawnTurnNumber - 1);
    eventIndexInput.value = drawnTurnNumber;
  } else {
    console.log("Reached beginning of game log");
  }
}

function nextEvent() {
  if (drawnTurnNumber < gameReplay.turns.length - 1) {
    drawTurn(drawnTurnNumber + 1);
    eventIndexInput.value = drawnTurnNumber;
  } else {
    console.log("Reached end of game log");
  }
}

/**
 *
 * @param {*} turnNumber the index in the game log to draw the state of
 */
function drawTurn(turnNumberToDraw) {
  const isReversed = drawnTurnNumber > turnNumberToDraw;
  const direction = isReversed ? -1 : 1;
  const startOffset = isReversed ? 0 : 1;
  for (
    let turnNumber = drawnTurnNumber + startOffset;
    turnNumber != turnNumberToDraw + startOffset;
    turnNumber += direction
  ) {
    console.debug(
      "Processing logs for turn",
      turnNumber,
      "with direction",
      direction
    );
    const events = gameReplay.turns[turnNumber].events;
    for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
      const event = events[eventIndex];
      const eventHandler = eventHandlers[event.type];
      if (eventHandler) {
        eventHandler(event, isReversed, turnNumber, eventIndex);
      } else {
        console.debug(
          `No event handler for log ${turnLogIdentifier} with type ${event.type}`,
          event
        );
      }
    }
  }
  gameTurn = gameReplay.turns[turnNumberToDraw];
  drawBankState(gameTurn.bankState);
  drawPlayerStates(gameTurn.playerStates, gameTurn.currentTurnPlayerColor);
  drawnTurnNumber = turnNumberToDraw;
  turnNumberLabel.textContent = `Turn ${drawnTurnNumber}`;
  nextBtn.disabled = drawnTurnNumber >= gameReplay.length - 1;
  prevBtn.disabled = drawnTurnNumber <= 0;
}

/**
 *
 * @param {*} hexFace the grid coordinates of the hexagon face
 * @returns the pixel coordinates of the center of the hexagon face
 */
function hexFaceGridToPixel(hexFace) {
  return {
    x: hexFace.x * getHexWidth() + (getHexWidth() / 2) * hexFace.y,
    y: hexFace.y * getHexHeight() * (3 / 4),
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
    p2: hexCornerToCoords(hexFaceGridToPixel(hexEdge), cornerIndex - 1),
  };
}

/**
 *
 * @param {*} edgePixels the pixel coordinates of the two corners of the hexagon edge
 * @returns the pixel coordinates of the midpoint of the hexagon edge
 */
function edgeMidpointPixel(edgePixels) {
  return {
    x: (edgePixels.p1.x + edgePixels.p2.x) / 2,
    y: (edgePixels.p1.y + edgePixels.p2.y) / 2,
  };
}

/**
 *
 * @param {*} hexCoords x and y coordinates of the center of the hexagon
 * @param {*} cornerIndex the corner of the hexagon to get the coordinates of. The corners are numbered 0-5, starting from the top right corner and going clockwise.
 * @returns the pixel coordinates of the specified corner of the hexagon
 */
function hexCornerToCoords(hexCoords, cornerIndex) {
  const angleDegrees = 60 * cornerIndex - 30;
  const angleRadians = (Math.PI / 180) * angleDegrees;
  return {
    x: hexCoords.x + HEX_SIZE * Math.cos(angleRadians),
    y: hexCoords.y + HEX_SIZE * Math.sin(angleRadians),
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
function setImageSource(element, image_type, image_subtype) {
  const suffix = image_subtype ? `_${image_subtype}` : "";
  element.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "href",
    `https://colonist.io/dist/images/${image_type}${suffix}.svg`
  );
}

/**
 * Fill in the bank container with cards and counts, initially all set to 0
 */
function drawBankCards() {
  const bankImage = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(bankImage, "bank");
  bankImage.setAttribute("width", CARD_SIZE);
  bankImage.setAttribute("height", CARD_SIZE);
  bankImage.setAttribute("x", CARD_SIZE / 2);
  bankImage.setAttribute("y", CARD_SIZE / 4);
  bankCounts.appendChild(bankImage);
  const xOffset = 2 * CARD_SIZE;
  for (let cardIndex = 0; cardIndex < bankCards.length; cardIndex++) {
    const card = bankCards[cardIndex];
    const cardCountGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    const cardImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    setImageSource(cardImage, "card", card);
    cardImage.setAttribute("width", CARD_SIZE);
    cardImage.setAttribute("height", CARD_SIZE * 1.5);
    cardImage.setAttribute("x", cardIndex * CARD_SIZE + xOffset);
    cardImage.setAttribute("y", 0);
    cardCountGroup.appendChild(cardImage);
    const cardCountText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    cardCountText.id = `${card}-bank-count`;
    cardCountText.textContent = 0;
    cardCountText.setAttribute(
      "x",
      cardIndex * CARD_SIZE + CARD_SIZE / 2 + xOffset
    );
    cardCountText.setAttribute("y", CARD_SIZE * (1 / 4));
    cardCountText.setAttribute("dominant-baseline", "middle");
    cardCountText.setAttribute("text-anchor", "middle");
    cardCountGroup.appendChild(cardCountText);
    bankCounts.appendChild(cardCountGroup);
  }
}

function drawHandCards() {
  const playerName = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  playerName.id = "my-name";
  playerName.setAttribute("dominant-baseline", "middle");
  playerName.setAttribute("text-anchor", "middle");
  playerName.setAttribute("width", CARD_SIZE);
  playerName.setAttribute("height", CARD_SIZE);
  playerName.setAttribute("x", CARD_SIZE);
  playerName.setAttribute("y", CARD_SIZE / 2);
  handCounts.appendChild(playerName);
  const xOffset = 2 * CARD_SIZE;
  for (let cardIndex = 0; cardIndex < handCards.length; cardIndex++) {
    const card = handCards[cardIndex];
    const cardCountGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    const cardImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    setImageSource(cardImage, "card", card);
    cardImage.setAttribute("width", CARD_SIZE);
    cardImage.setAttribute("height", CARD_SIZE * 1.5);
    cardImage.setAttribute("x", cardIndex * CARD_SIZE + xOffset);
    cardImage.setAttribute("y", 0);
    cardCountGroup.appendChild(cardImage);
    const cardCountText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    cardCountText.id = `${card}-hand-count`;
    cardCountText.textContent = 0;
    cardCountText.setAttribute(
      "x",
      cardIndex * CARD_SIZE + CARD_SIZE / 2 + xOffset
    );
    cardCountText.setAttribute("y", CARD_SIZE * (1 / 4));
    cardCountText.setAttribute("dominant-baseline", "middle");
    cardCountText.setAttribute("text-anchor", "middle");
    cardCountGroup.appendChild(cardCountText);
    handCounts.appendChild(cardCountGroup);
  }
}

/**
 *
 * @param {*} hexFaceCenter the coordinates of the center of the hexagon face to draw
 * @param {*} resourceName the name of the resource to draw
 */
function drawHexFace(hexFaceCenter, resourceName) {
  const hexFace = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(hexFace, "tile", resourceName);
  hexFace.setAttribute("width", getHexWidth(HEX_SIZE));
  hexFace.setAttribute("height", getHexHeight(HEX_SIZE));
  hexFace.setAttribute("x", hexFaceCenter.x - getHexWidth() / 2);
  hexFace.setAttribute("y", hexFaceCenter.y - getHexHeight() / 2);
  hexTilesGroup.appendChild(hexFace);
}

/**
 *
 * @param {*} hexFaceCenter the coordinates of the center of the hexagon face to draw on
 * @param {*} number the dice roll to draw
 */
function drawProbability(hexFaceCenter, number) {
  const diceProbability = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(diceProbability, "prob", number);
  diceProbability.setAttribute("width", PROB_SIZE);
  diceProbability.setAttribute("height", PROB_SIZE);
  diceProbability.setAttribute("x", hexFaceCenter.x - PROB_SIZE / 2);
  diceProbability.setAttribute("y", hexFaceCenter.y - PROB_SIZE / 10);
  hexTilesGroup.appendChild(diceProbability);
}

/**
 * Draw a dashed line to represent the dock
 *
 * @param {*} p1 Starting point (x, y) of dock line
 * @param {*} p2 Ending point (x, y) of dock line
 */
function drawDock(p1, p2) {
  const dockLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  dockLine.setAttribute("x1", p1.x);
  dockLine.setAttribute("y1", p1.y);
  dockLine.setAttribute("x2", p2.x);
  dockLine.setAttribute("y2", p2.y);
  dockLine.setAttribute("stroke", "brown");
  dockLine.setAttribute("stroke-width", DOCK_SIZE);
  dockLine.setAttribute("stroke-dasharray", DOCK_SIZE);
  hexTilesGroup.appendChild(dockLine);
}

/**
 * Draw the port image and dock lines for a port at a given edge
 *
 * @param {*} portEdge the grid coordinates of the port edge to draw
 */
function drawPort(portEdge) {
  const hexEdgePixels = hexEdgeGridToPixels(portEdge.hexEdge);
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

  const portImage = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(portImage, "port", portTypeToResourceName[portEdge.portType]);
  portImage.setAttribute("width", PORT_SIZE);
  portImage.setAttribute("height", PORT_SIZE);

  portImage.setAttribute("x", hexFaceCenter.x - PORT_SIZE / 2);
  portImage.setAttribute("y", hexFaceCenter.y - PORT_SIZE / 2);
  hexTilesGroup.appendChild(portImage);
}

function setRobberAttributes() {
  setImageSource(robber, "icon", "robber");
  robber.setAttribute("width", ROBBER_SIZE);
  robber.setAttribute("height", ROBBER_SIZE);
  robber.setAttribute("visibility", "hidden");
}

function setViewboxAttributes() {
  const viewBox = document.getElementById("view-box");
  viewBox.setAttributeNS(
    null,
    "viewBox",
    `${getHexWidth() * -4} ${getHexHeight() * -3} ${getHexWidth() * 8} ${
      getHexHeight() * 6
    }`
  );
}

/**
 *
 * @param {*} hexCorner the grid coordinates for the corner of the settlement
 * @param {*} color the id of the player who owns the settlement
 */
function drawCorner(hexCorner, color, buildingTypeId) {
  const buildingType = buildingTypeIdMap[buildingTypeId];
  const buildingId = getDrawnElementId("corner", hexCorner);
  const existingBuilding = document.getElementById(buildingId);
  if (existingBuilding != null) {
    hexCornersGroup.removeChild(existingBuilding);
  }
  const building = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(building, buildingType, colorIdsToNames[color]);
  building.id = buildingId;
  building.setAttribute("width", BUILDING_SIZE);
  building.setAttribute("height", BUILDING_SIZE);
  const coordinates = hexCornerGridToPixel(hexCorner);
  building.setAttribute("x", coordinates.x - BUILDING_SIZE / 2);
  building.setAttribute("y", coordinates.y - BUILDING_SIZE / 2);
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
  const buildingId = getDrawnElementId("corner", hexCorner);
  const building = document.getElementById(buildingId);
  if (building) {
    hexCornersGroup.removeChild(building);
    if (buildingType == "city") {
      // When a city is removed, it needs to be replaced with its corresponding settlement
      drawCorner(hexCorner, color, 1);
    }
  } else {
    console.log(`Could not find building with id ${buildingId}`);
  }
}

/**
 *
 * @param {*} coordinates start and end coordinates of the road
 * @param {string} color the color of the road to draw
 * @param {number} width the width of the road to draw
 * @returns an SVG line element representing the road
 */
function getRoadLine(coordinates, color, width) {
  const roadLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  roadLine.setAttribute("x1", coordinates.p1.x);
  roadLine.setAttribute("y1", coordinates.p1.y);
  roadLine.setAttribute("x2", coordinates.p2.x);
  roadLine.setAttribute("y2", coordinates.p2.y);
  roadLine.setAttribute("stroke", color);
  roadLine.setAttribute("stroke-width", width);
  roadLine.setAttribute("stroke-linecap", "round");
  return roadLine;
}

/**
 *
 * @param {*} hexEdge the grid coordinates of the edge to draw
 * @param {number} color the color ID of the player who owns the road
 */
function drawEdge(hexEdge, color) {
  const buildingId = getDrawnElementId("edge", hexEdge);
  const existingBuilding = document.getElementById(buildingId);
  if (existingBuilding != null) {
    hexEdgesGroup.removeChild(existingBuilding);
  }

  const coordinates = hexEdgeGridToPixels(hexEdge);
  const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  lineGroup.id = buildingId;
  lineGroup.appendChild(getRoadLine(coordinates, "brown", 10));
  lineGroup.appendChild(
    getRoadLine(coordinates, colorNamesToHex[colorIdsToNames[color]], 7)
  );
  hexEdgesGroup.appendChild(lineGroup);
}

/**
 *
 * @param {*} hexEdge the grid coordinates of the edge to erase
 */
function eraseEdge(hexEdge) {
  const buildingId = getDrawnElementId("edge", hexEdge);
  const building = document.getElementById(buildingId);
  if (building) {
    hexEdgesGroup.removeChild(building);
  } else {
    console.log(`Could not find building with id ${buildingId}`);
  }
}

function moveRobber(targetHexFace) {
  const coordinates = hexFaceGridToPixel(targetHexFace);
  robber.setAttribute("x", coordinates.x - getHexWidth() / 2);
  robber.setAttribute("y", coordinates.y - ROBBER_SIZE / 2);
  robber.setAttribute("visibility", "visibile");
}

function drawMessage(message, turnNumber, eventIndex, container) {
  const messageId = getMessageId(turnNumber, eventIndex);
  const existingMessage = document.getElementById(messageId);
  if (existingMessage != null) {
    container.removeChild(existingMessage);
  }
  const messageDiv = document.createElement("div");
  messageDiv.id = messageId;
  messageDiv.class = "chat-message";
  const messageSpan = document.createElement("span");
  messageSpan.innerHTML = decorateMessage(turnNumber, message);
  messageDiv.appendChild(messageSpan);
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

function eraseMessage(turnNumber, eventIndex, container) {
  const messageId = getMessageId(turnNumber, eventIndex);
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

function getMessageId(turnNumber, eventIndex) {
  return `message-${turnNumber}-${eventIndex}`;
}

/**
 *
 * @param {*} username the name of the player to enhance
 * @returns the html for a span element with the bolded and colored version of the player's name
 */
function getPlayerNameString(username, color) {
  const span = document.createElement("span");
  span.style.color = colorNamesToHex[colorIdsToNames[color]];
  span.style.fontWeight = "bold";
  span.textContent = username;
  return span.outerHTML;
}

/**
 * Decorate the message with images and styling to replace the various icons and usernames in text
 *
 * @param {*} message the string to decorate with images or styling
 * @returns the decorated message
 */
function decorateMessage(turnNumber, message) {
  let decoratedMessage = message;
  const img = document.createElement("img");
  img.setAttribute("width", TEXT_IMAGE_SIZE);
  img.setAttribute("height", TEXT_IMAGE_SIZE);
  for (const [word, replacement] of Object.entries(wordReplacements)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    img.setAttribute(
      "src",
      `https://colonist.io/dist/images/${replacement}.svg`
    );
    decoratedMessage = decoratedMessage.replaceAll(re, img.outerHTML);
  }
  for (const [command, replacement] of Object.entries(commandReplacements)) {
    const re = new RegExp(command, "gi");
    img.setAttribute(
      "src",
      `https://colonist.io/dist/images/${replacement}.svg`
    );
    decoratedMessage = decoratedMessage.replaceAll(re, img.outerHTML);
  }
  for (const [username, color] of Object.entries(gameReplay.usernameToColor)) {
    const re = new RegExp(`\\b${username}\\b`, "gi");
    decoratedMessage = decoratedMessage.replaceAll(
      re,
      getPlayerNameString(username, color)
    );
  }
  return `<b>Turn ${turnNumber} → </b> ${decoratedMessage}`;
}

function drawBankState(bankState) {
  let cardCounts = {
    lumber: 0,
    brick: 0,
    wool: 0,
    grain: 0,
    ore: 0,
    devcardback: bankState.hiddenDevelopmentCards.length,
  };
  for (const resource of bankState.resourceCards) {
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

function getPlayerRow(username) {
  const rowId = `player-${username}`;
  const row = document.getElementById(rowId);
  if (row) {
    return row;
  } else {
    const newRow = document.createElement("tr");
    newRow.id = `player-${username}`;
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
    const newCell = document.createElement("td");
    newCell.id = cellId;
    const row = getPlayerRow(username);
    row.appendChild(newCell);
    return newCell;
  }
}

function handleBoardDescriptionEvent(data, isReversed) {
  if (isReversed) {
    console.error("Cannot reverse board description event");
  } else {
    for (const tile of data.payload.tileState.tiles) {
      const hexFaceCenter = hexFaceGridToPixel(tile.hexFace);
      const resourceName = tileTypeToResourceName[tile.tileType];
      drawHexFace(hexFaceCenter, resourceName);
      if (resourceName != "desert") {
        drawProbability(hexFaceCenter, tile._diceNumber);
      } else {
        moveRobber(tile.hexFace);
      }
    }
  }

  for (const portEdge of data.payload.portState.portEdges) {
    drawPort(portEdge);
  }
}

function handleBuildEdgeEvent(data, isReversed) {
  const payload = data.payload[0];
  if (isReversed) {
    eraseEdge(payload.hexEdge);
  } else {
    drawEdge(payload.hexEdge, payload.owner);
  }
}

function handleBuildCornerEvent(data, isReversed) {
  payload = data.payload[0];
  if (isReversed) {
    eraseCorner(payload.hexCorner, payload.owner, payload.buildingType);
  } else {
    drawCorner(payload.hexCorner, payload.owner, payload.buildingType);
  }
}

function handleMoveRobberEvent(data, isReversed) {
  if (isReversed) {
    moveRobber(data.payload[0].hexFace);
  } else {
    moveRobber(data.payload[1].hexFace);
  }
}

function handleChatMessageEvent(data, isReversed, turnNumber, eventIndex) {
  payload = data.payload;
  if (payload.text != null) {
    const message = payload.text.options.value;
    const username = payload.username;
    if (isReversed) {
      eraseMessage(turnNumber, eventIndex, chatContainer);
    } else {
      drawMessage(
        `${username}: ${message}`,
        turnNumber,
        eventIndex,
        chatContainer
      );
    }
  }
}

function handleLogMessageEvent(data, isReversed, turnNumber, eventIndex) {
  if (isReversed) {
    eraseMessage(turnNumber, eventIndex, logContainer);
  } else {
    const payload = data.payload;
    const key = payload.text.key;
    const messageMapper = messageMappers[key];
    if (messageMapper) {
      drawMessage(
        messageMapper(payload.text.options),
        turnNumber,
        eventIndex,
        logContainer
      );
    } else {
      console.debug(`No message mapper`, payload);
    }
  }
}

function drawPlayerStates(playerStates, currentTurnPlayerColor) {
  for (const [username, player] of Object.entries(playerStates)) {
    const nameCell = getPlayerCell(username, "name");
    nameCell.innerHTML = getPlayerNameString(username, player.color);

    const pointsCell = getPlayerCell(username, "points");
    pointsCell.textContent = player.victoryPointState._totalPublicVictoryPoints;

    const resourcesCell = getPlayerCell(username, "resources");
    resourcesCell.textContent = player.resourceCards.length;

    const devCardsCell = getPlayerCell(username, "dev-cards");
    devCardsCell.textContent = player.developmentCards.length;

    const armyCell = getPlayerCell(username, "largest-army");
    let armyCount = 0;
    for (const devCard of player.developmentCardsUsed) {
      armyCount += devCard == KNIGHT_ID ? 1 : 0;
    }
    armyCell.innerHTML = player.hasLargestArmy
      ? `<b>${armyCount}</b>`
      : armyCount;

    const roadCell = getPlayerCell(username, "longest-road");
    roadCell.innerHTML = player.hasLongestRoad
      ? `<b>${player.longestRoad}</b>`
      : player.longestRoad;

    if (player.color == gameReplay.replayOwnerColor) {
      const playerName = document.getElementById("my-name");
      playerName.textContent = username;
      playerName.setAttribute(
        "fill",
        colorNamesToHex[colorIdsToNames[player.color]]
      );
      playerName.setAttribute("font-weight", "bold");
      const cardCounts = {};
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

    getPlayerRow(username).style.backgroundColor =
      player.color == currentTurnPlayerColor ? "#e6e6e6" : "#ababab";
  }
}

prevBtn.addEventListener("click", prevEvent);
nextBtn.addEventListener("click", nextEvent);