/**
 * Color names and hex values by ID, as reported by the server
 */
const COLORS = {
  1: {
    name: "red",
    hex: "#E27174",
  },
  2: {
    name: "blue",
    hex: "#223697",
  },
  3: {
    name: "orange",
    hex: "#E09742",
  },
  4: {
    name: "green",
    hex: "#62B95D",
  },
  5: {
    name: "black",
    hex: "#3e3e3e",
  },
  6: {
    name: "bronze",
    hex: "#a86755",
  },
  7: {
    name: "silver",
    hex: "#848484",
  },
  8: {
    name: "gold",
    hex: "#c7ae61",
  },
  9: {
    name: "white",
    hex: "#9E9E9E",
  },
  10: {
    name: "purple",
    hex: "#9D55AF",
  },
  11: {
    name: "mysticblue",
    hex: "#256CA7",
  },
};

const WORD_REPLACEMENTS = {
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

const COMMAND_REPLACEMENTS = {
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

const PORT_TYPE_TO_NAME = {
  2: "lumber",
  3: "brick",
  4: "wool",
  5: "grain",
  6: "ore",
};

const TILE_TYPE_TO_NAME = {
  0: "desert",
  1: "lumber",
  2: "brick",
  3: "wool",
  4: "grain",
  5: "ore",
};

const BANK_CARDS = ["lumber", "brick", "wool", "grain", "ore", "devcardback"];
const CARD_IDS_TO_NAME = {
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
const KNIGHT_ID = 7;

/**
 * Empty out all of the game specific HTML elements to prepare for a new game to be drawn
 */
function resetScreen() {
  document.getElementById("hex-tiles").innerHTML = "";
  document.getElementById("hex-edges").innerHTML = "";
  document.getElementById("hex-corners").innerHTML = "";
  document.getElementById("chat-container").innerHTML = "";
  document.getElementById("log-container").innerHTML = "";
  document.getElementById("player-table").innerHTML = "";
  document.getElementById("bank-counts").innerHTML = "";
  document.getElementById("hand-counts").innerHTML = "";
  setViewboxAttributes();
  setRobberAttributes();
  drawBankCards();
  drawHandCards();
}

/**
 * Fill in the bank container with cards and counts, initially all set to 0
 */
function drawBankCards() {
  const cardWidthPct = 5;
  const cardHeightPct = 55;
  const bankImageWidthPct = 7;
  const bankImageHeightPct = 50;
  const bankImageXOffsetPct = 5;
  const cardImageXOffsetPct = bankImageXOffsetPct * 2 + bankImageWidthPct;
  const cardImageYOffsetPct = 10;
  const textXOffsetPct = cardImageXOffsetPct + cardWidthPct / 2;
  const textYOffsetPct = 50 + (cardHeightPct + cardImageYOffsetPct) / 2;

  const bankCounts = document.getElementById("bank-counts");
  const bankImage = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(bankImage, "bank");
  bankImage.setAttribute("width", `${bankImageWidthPct}%`);
  bankImage.setAttribute("height", `${bankImageHeightPct}%`);
  bankImage.setAttribute("x", `${bankImageXOffsetPct}%`);
  bankImage.setAttribute("y", `${bankImageHeightPct / 2}%`);
  bankCounts.appendChild(bankImage);
  for (const [cardIndex, card] of BANK_CARDS.entries()) {
    const cardCountGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    const cardImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    setImageSource(cardImage, "card", card);
    cardImage.setAttribute("width", `${cardWidthPct}%`);
    cardImage.setAttribute("height", `${cardHeightPct}%`);
    cardImage.setAttribute(
      "x",
      `${cardIndex * cardWidthPct + cardImageXOffsetPct}%`
    );
    cardImage.setAttribute("y", `${cardImageYOffsetPct}%`);
    cardCountGroup.appendChild(cardImage);
    const cardCountText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    cardCountText.id = `${card}-bank-count`;
    cardCountText.textContent = 0;
    cardCountText.setAttribute(
      "x",
      `${cardIndex * cardWidthPct + textXOffsetPct}%`
    );
    cardCountText.setAttribute("y", `${textYOffsetPct}%`);
    cardCountText.setAttribute("dominant-baseline", "middle");
    cardCountText.setAttribute("text-anchor", "middle");
    cardCountGroup.appendChild(cardCountText);
    bankCounts.appendChild(cardCountGroup);
  }
}

/**
 * Fill in the hand container with cards and counts, initially all set to 0
 */
function drawHandCards() {
  const cardWidthPct = 5;
  const cardHeightPct = 55;
  const usernameXOffsetPct = 12;
  const usernameXBufferPct = usernameXOffsetPct * 2;
  const cardImageYOffsetPct = 10;
  const textXOffsetPct = usernameXBufferPct + cardWidthPct / 2;
  const textYOffsetPct = 50 + (cardHeightPct + cardImageYOffsetPct) / 2;

  const handCounts = document.getElementById("hand-counts");
  const playerName = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  playerName.id = "replay-owner-name";
  playerName.setAttribute("dominant-baseline", "middle");
  playerName.setAttribute("text-anchor", "middle");
  playerName.setAttribute("x", `${usernameXOffsetPct}%`);
  playerName.setAttribute("y", "50%");
  handCounts.appendChild(playerName);
  for (const [cardIndex, card] of Object.values(CARD_IDS_TO_NAME).entries()) {
    const cardCountGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    const cardImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    setImageSource(cardImage, "card", card);
    cardImage.setAttribute("width", `${cardWidthPct}%`);
    cardImage.setAttribute("height", `${cardHeightPct}%`);
    cardImage.setAttribute(
      "x",
      `${cardIndex * cardWidthPct + usernameXBufferPct}%`
    );
    cardImage.setAttribute("y", `${cardImageYOffsetPct}%`);
    cardCountGroup.appendChild(cardImage);
    const cardCountText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    cardCountText.id = `${card}-hand-count`;
    cardCountText.textContent = 0;
    cardCountText.setAttribute(
      "x",
      `${cardIndex * cardWidthPct + textXOffsetPct}%`
    );
    cardCountText.setAttribute("y", `${textYOffsetPct}%`);
    cardCountText.setAttribute("dominant-baseline", "middle");
    cardCountText.setAttribute("text-anchor", "middle");
    cardCountGroup.appendChild(cardCountText);
    handCounts.appendChild(cardCountGroup);
  }
}

/**
 * @param {Object} bankState the state of the bank to draw
 */
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
    const resourceName = TILE_TYPE_TO_NAME[resource];
    if (resourceName) {
      cardCounts[resourceName]++;
    }
  }
  for (const [card, count] of Object.entries(cardCounts)) {
    const cardCount = document.getElementById(`${card}-bank-count`);
    cardCount.textContent = count;
  }
}

/**
 * @param {Object} playerStates the player states at the end of the current turn
 * @param {number} currentTurnPlayerColor the color ID of the player whose turn it is
 */
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
      const playerName = document.getElementById("replay-owner-name");
      playerName.textContent = username;
      playerName.setAttribute("fill", COLORS[player.color].hex);
      playerName.setAttribute("font-weight", "bold");
      const cardCounts = {};
      for (const resourceId of player.resourceCards) {
        cardCounts[resourceId] = (cardCounts[resourceId] || 0) + 1;
      }
      for (const devId of player.developmentCards) {
        cardCounts[devId] = (cardCounts[devId] || 0) + 1;
      }
      for (const [cardId, cardName] of Object.entries(CARD_IDS_TO_NAME)) {
        const handCardCount = document.getElementById(`${cardName}-hand-count`);
        handCardCount.textContent = cardCounts[cardId] || 0;
      }
    }

    getPlayerRow(username).style.backgroundColor =
      player.color == currentTurnPlayerColor ? "#e6e6e6" : "#ababab";
  }
}

/**
 * @param {*} hexFaceCenter the coordinates of the center of the hexagon face to draw
 * @param {*} resourceName the name of the resource to draw
 */
function drawHexFace(hexFaceCenter, resourceName) {
  const hexFace = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(hexFace, "tile", resourceName);
  hexFace.setAttribute("width", getHexWidth());
  hexFace.setAttribute("height", getHexHeight());
  hexFace.setAttribute("x", hexFaceCenter.x - getHexWidth() / 2);
  hexFace.setAttribute("y", hexFaceCenter.y - getHexHeight() / 2);
  document.getElementById("hex-tiles").appendChild(hexFace);
}

/**
 * @param {*} hexFaceCenter the coordinates of the center of the hexagon face to draw on
 * @param {*} number the dice roll to draw
 */
function drawProbability(hexFaceCenter, number) {
  const diceProbability = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(diceProbability, "prob", number);
  const size = 35;
  diceProbability.setAttribute("width", size);
  diceProbability.setAttribute("height", size);
  diceProbability.setAttribute("x", hexFaceCenter.x - size / 2);
  diceProbability.setAttribute("y", hexFaceCenter.y - size / 10);
  document.getElementById("hex-tiles").appendChild(diceProbability);
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
  const size = 4;
  dockLine.setAttribute("stroke-width", size);
  dockLine.setAttribute("stroke-dasharray", size);
  document.getElementById("hex-tiles").appendChild(dockLine);
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
  setImageSource(portImage, "port", PORT_TYPE_TO_NAME[portEdge.portType]);
  const size = 40;
  portImage.setAttribute("width", size);
  portImage.setAttribute("height", size);
  portImage.setAttribute("x", hexFaceCenter.x - size / 2);
  portImage.setAttribute("y", hexFaceCenter.y - size / 2);
  document.getElementById("hex-tiles").appendChild(portImage);
}

/**
 * @param {*} hexCorner the grid coordinates for the corner of the settlement
 * @param {*} color the id of the player who owns the settlement
 */
function drawCorner(hexCorner, color, buildingTypeId) {
  const buildingName = getBuildingName(buildingTypeId);
  const buildingId = getBuildingId("corner", hexCorner);
  const existingBuilding = document.getElementById(buildingId);
  const hexCornersGroup = document.getElementById("hex-corners");
  if (existingBuilding != null) {
    hexCornersGroup.removeChild(existingBuilding);
  }
  const building = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  setImageSource(building, buildingName, COLORS[color].name);
  building.id = buildingId;
  const buildingSize = 40;
  building.setAttribute("width", buildingSize);
  building.setAttribute("height", buildingSize);
  const coordinates = hexCornerGridToPixel(hexCorner);
  building.setAttribute("x", coordinates.x - buildingSize / 2);
  building.setAttribute("y", coordinates.y - buildingSize / 2);
  hexCornersGroup.appendChild(building);
}

/**
 * @param {*} hexCorner the grid coordinates for the corner of the settlement
 * @param {*} color the id of the player who owns the building
 * @param {*} buildingTypeId the id of the building type to draw
 */
function eraseCorner(hexCorner, color, buildingTypeId) {
  const buildingName = getBuildingName(buildingTypeId);
  const buildingId = getBuildingId("corner", hexCorner);
  const building = document.getElementById(buildingId);
  if (building) {
    document.getElementById("hex-corners").removeChild(building);
    if (buildingName == "city") {
      // When a city is removed, it needs to be replaced with its corresponding settlement
      drawCorner(hexCorner, color, 1);
    }
  }
}

/**
 * @param {*} hexEdge the grid coordinates of the edge to draw
 * @param {number} color the color ID of the player who owns the road
 */
function drawEdge(hexEdge, color) {
  const buildingId = getBuildingId("edge", hexEdge);
  const existingBuilding = document.getElementById(buildingId);
  const hexEdges = document.getElementById("hex-edges");
  if (existingBuilding != null) {
    hexEdges.removeChild(existingBuilding);
  }

  const coordinates = hexEdgeGridToPixels(hexEdge);
  const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  lineGroup.id = buildingId;
  lineGroup.appendChild(getRoadLine(coordinates, "brown", 10));
  lineGroup.appendChild(getRoadLine(coordinates, COLORS[color].hex, 7));
  hexEdges.appendChild(lineGroup);
}

/**
 * @param {Object} hexEdge the grid coordinates of the edge to erase
 */
function eraseEdge(hexEdge) {
  const buildingId = getBuildingId("edge", hexEdge);
  const building = document.getElementById(buildingId);
  if (building) {
    document.getElementById("hex-edges").removeChild(building);
  }
}

/**
 * @param {Object} targetHexFace grid coordinates of the hexagon face to move the robber to
 */
function moveRobber(targetHexFace) {
  const robberHeight = 35;
  const coordinates = hexFaceGridToPixel(targetHexFace);
  robber.setAttribute("x", coordinates.x - getHexWidth() / 2);
  robber.setAttribute("y", coordinates.y - robberHeight / 2);
  robber.setAttribute("visibility", "visibile");
}

/**
 * @param {string} message the message to draw
 * @param {number} turnNumber the turn the message was sent in
 * @param {number} eventIndex the index of the message within the turn
 * @param {HTMLElement} container the container to draw the message in
 */
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

/**
 * @param {number} turnNumber the turn the message was sent in
 * @param {number} eventIndex the index of the message within the turn
 * @param {HTMLElement} container the container to erase the message from
 */
function eraseMessage(turnNumber, eventIndex, container) {
  const messageId = getMessageId(turnNumber, eventIndex);
  const messageElement = document.getElementById(messageId);
  if (messageElement) {
    container.removeChild(messageElement);
    container.scrollTop = container.scrollHeight;
  }
}

/**
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
 * Set the base attributes of the robber image, hiding it initially
 */
function setRobberAttributes() {
  const robberSize = 35;
  const robber = document.getElementById("robber");
  setImageSource(robber, "icon", "robber");
  robber.setAttribute("width", robberSize);
  robber.setAttribute("height", robberSize);
  robber.setAttribute("visibility", "hidden");
}

/**
 * Set the viewbox size based on the hexagon size
 */
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
 * @param {string} type the type of building to draw
 * @param {Object} coordinates the grid coordinates of the building to draw
 * @returns a string representing the id of the building
 */
function getBuildingId(type, coordinates) {
  return `${type}-${coordinates.x}-${coordinates.y}-${coordinates.z}`;
}

/**
 * @param {number} turnNumber the turn the message was sent in
 * @param {number} eventIndex the index of the message within the turn
 * @returns a string representing the id of the message
 */
function getMessageId(turnNumber, eventIndex) {
  return `message-${turnNumber}-${eventIndex}`;
}

/**
 * @param {*} username the name of the player to enhance
 * @returns the html for a span element with the bolded and colored version of the player's name
 */
function getPlayerNameString(username, color) {
  const span = document.createElement("span");
  span.style.color = COLORS[color].hex;
  span.style.fontWeight = "bold";
  span.textContent = username;
  return span.outerHTML;
}

/**
 * @param {string} username the name of the player whose row should be fetched
 * @returns the row element for the player, creating a new one if needed
 */
function getPlayerRow(username) {
  const rowId = `player-${username}`;
  const row = document.getElementById(rowId);
  if (row) {
    return row;
  } else {
    const newRow = document.createElement("tr");
    newRow.id = `player-${username}`;
    document.getElementById("player-table").appendChild(newRow);
    return newRow;
  }
}

/**
 * @param {string} username the name of the player whose cell should be fetched
 * @param {string} cellType the type of cell to fetch
 * @returns the cell element, creating a new one if needed
 */
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
 * @param {number} buildingType the type of building to get the name of
 * @returns the building name
 */
function getBuildingName(buildingType) {
  switch (buildingType) {
    case 1:
      return "settlement";
    case 2:
      return "city";
    default:
      console.error(`Unexpected building type ${buildingType}`);
  }
}

/**
 * Decorate the message with images and styling to replace the various icons and usernames in text
 *
 * @param {number} turnNumber the turn the message was sent in
 * @param {string} message the string to decorate with images or styling
 * @returns the decorated message
 */
function decorateMessage(turnNumber, message) {
  let decoratedMessage = message;
  const img = document.createElement("img");
  const size = 15;
  img.setAttribute("width", size);
  img.setAttribute("height", size);
  for (const [word, replacement] of Object.entries(WORD_REPLACEMENTS)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    img.setAttribute(
      "src",
      `https://colonist.io/dist/images/${replacement}.svg`
    );
    decoratedMessage = decoratedMessage.replaceAll(re, img.outerHTML);
  }
  for (const [command, replacement] of Object.entries(COMMAND_REPLACEMENTS)) {
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
