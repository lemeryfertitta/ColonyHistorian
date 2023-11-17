const EVENT_HANDLERS = {
  7: handleLogMessageEvent,
  14: handleBoardDescriptionEvent,
  15: handleBuildEdgeEvent,
  16: handleBuildCornerEvent,
  17: handleMoveRobberEvent,
  73: handleChatMessageEvent,
};

const MESSAGE_MAPPERS = {
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

class GameReplayController {
  /**
   *
   * @param {GameReplay} gameReplay the replay to control
   */
  setReplay(gameReplay) {
    this.gameReplay = gameReplay;
    this.drawnTurnNumber = -1;
    const turnNumberSlider = document.getElementById("turn-number-slider");
    turnNumberSlider.max = gameReplay.turns.length - 1;
    turnNumberSlider.value = 0;
    turnNumberSlider.disabled = false;
    this.drawTurn(0);
  }

  /**
   *
   * @param {*} turnNumber the index in the game log to draw the state of
   */
  drawTurn(turnNumberToDraw) {
    const isReversed = this.drawnTurnNumber > turnNumberToDraw;
    const direction = isReversed ? -1 : 1;
    const startOffset = isReversed ? 0 : 1;
    for (
      let turnNumber = this.drawnTurnNumber + startOffset;
      turnNumber != turnNumberToDraw + startOffset;
      turnNumber += direction
    ) {
      const events = this.gameReplay.turns[turnNumber].events;
      for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
        const event = events[eventIndex];
        const eventHandler = EVENT_HANDLERS[event.type];
        if (eventHandler) {
          eventHandler(event, isReversed, turnNumber, eventIndex);
        }
      }
    }
    const gameTurn = this.gameReplay.turns[turnNumberToDraw];
    drawBankState(gameTurn.bankState);
    drawPlayerStates(gameTurn.playerStates, gameTurn.currentTurnPlayerColor);
    this.drawnTurnNumber = turnNumberToDraw;
    document.getElementById(
      "turn-number-label"
    ).textContent = `Turn ${this.drawnTurnNumber}`;
    document.getElementById("next-btn").disabled =
      this.drawnTurnNumber >= this.gameReplay.length - 1;
    document.getElementById("prev-btn").disabled = this.drawnTurnNumber <= 0;
  }

  drawNextTurn() {
    if (this.drawnTurnNumber < this.gameReplay.turns.length - 1) {
      this.drawTurn(this.drawnTurnNumber + 1);
      document.getElementById("turn-number-slider").value =
        this.drawnTurnNumber;
    } else {
      console.debug("Reached end of game replay");
    }
  }

  drawPreviousTurn() {
    if (this.drawnTurnNumber > 0) {
      this.drawTurn(this.drawnTurnNumber - 1);
      document.getElementById("turn-number-slider").value =
        this.drawnTurnNumber;
    } else {
      console.debug("Reached beginning of game replay");
    }
  }
}

let gameReplayController = new GameReplayController();

document
  .getElementById("turn-number-slider")
  .addEventListener("input", (event) => {
    gameReplayController.drawTurn(parseInt(event.target.value));
  });

document
  .getElementById("game-log-input")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      resetScreen();
      gameReplay = new GameReplay(JSON.parse(reader.result));
      console.log("Replay parsed", gameReplay);
      gameReplayController.setReplay(gameReplay);
    };
    reader.readAsText(file);
  });

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    gameReplayController.drawPreviousTurn();
  } else if (event.key === "ArrowRight") {
    gameReplayController.drawNextTurn();
  }
});

document
  .getElementById("prev-btn")
  .addEventListener("click", gameReplayController.drawPreviousTurn);
document
  .getElementById("next-btn")
  .addEventListener("click", gameReplayController.drawNextTurn);

/**
 * @param {Object} data the board description event data
 * @param {boolean} isReversed true if the event is being reversed, false otherwise
 */
function handleBoardDescriptionEvent(data, isReversed) {
  if (isReversed) {
    console.error("Cannot reverse board description event");
  } else {
    for (const tile of data.payload.tileState.tiles) {
      const hexFaceCenter = hexFaceGridToPixel(tile.hexFace);
      const resourceName = TILE_TYPE_TO_NAME[tile.tileType];
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

/**
 * @param {Object} data the build edge event data
 * @param {boolean} isReversed true if the event is being reversed, false otherwise
 */
function handleBuildEdgeEvent(data, isReversed) {
  const payload = data.payload[0];
  if (isReversed) {
    eraseEdge(payload.hexEdge);
  } else {
    drawEdge(payload.hexEdge, payload.owner);
  }
}

/**
 * @param {Object} data the build corner event data
 * @param {boolean} isReversed true if the event is being reversed, false otherwise
 */
function handleBuildCornerEvent(data, isReversed) {
  payload = data.payload[0];
  if (isReversed) {
    eraseCorner(payload.hexCorner, payload.owner, payload.buildingType);
  } else {
    drawCorner(payload.hexCorner, payload.owner, payload.buildingType);
  }
}

/**
 * @param {Object} data the move robber event data
 * @param {boolean} isReversed true if the event is being reversed, false otherwise
 */
function handleMoveRobberEvent(data, isReversed) {
  if (isReversed) {
    moveRobber(data.payload[0].hexFace);
  } else {
    moveRobber(data.payload[1].hexFace);
  }
}

/**
 * @param {Object} data the chat message event data
 * @param {boolean} isReversed true if the event is being reversed, false otherwise
 * @param {number} turnNumber the turn the event occurred in
 * @param {number} eventIndex the index of the event within the turn
 */
function handleChatMessageEvent(data, isReversed, turnNumber, eventIndex) {
  const chatContainer = document.getElementById("chat-container");
  if (isReversed) {
    eraseMessage(turnNumber, eventIndex, chatContainer);
  } else {
    const payload = data.payload;
    const message = payload.text.options.value;
    const username = payload.username;
    drawMessage(
      `${username}: ${message}`,
      turnNumber,
      eventIndex,
      chatContainer
    );
  }
}

/**
 * @param {Object} data the log message event data
 * @param {boolean} isReversed true if the event is being reversed, false otherwise
 * @param {number} turnNumber the turn the event occurred in
 * @param {number} eventIndex the index of the event within the turn
 */
function handleLogMessageEvent(data, isReversed, turnNumber, eventIndex) {
  const logContainer = document.getElementById("log-container");
  if (isReversed) {
    eraseMessage(turnNumber, eventIndex, logContainer);
  } else {
    const payload = data.payload;
    const key = payload.text.key;
    const messageMapper = MESSAGE_MAPPERS[key];
    if (messageMapper) {
      drawMessage(
        messageMapper(payload.text.options),
        turnNumber,
        eventIndex,
        logContainer
      );
    }
  }
}
