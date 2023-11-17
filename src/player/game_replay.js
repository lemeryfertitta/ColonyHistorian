// Event type IDs from the websocket message payloads
const LOG_MESSAGE_EVENT = 7;
const PLAY_ORDER_EVENT = 8;
const TURN_STATE_EVENT = 9;
const BANK_STATE_EVENT = 10;
const PLAYER_STATE_EVENT = 12;
const BOARD_DESCRIPTION_EVENT = 14;
const BUILD_EDGE_EVENT = 15;
const BUILD_CORNER_EVENT = 16;
const MOVE_ROBBER_EVENT = 17;
const CHAT_MESSAGE_EVENT = 73;

/**
 * Collection of events that occur during a single turn and the state of the game at the end of the turn.
 */
class GameTurn {
  /**
   *
   * @param {Object} previousPlayerStates the player states at the end of the previous turn
   * @param {Object} previousBankState the bank state at the end of the previous turn
   * @param {number} currentTurnPlayerColor the color ID of the player whose turn it is
   */
  constructor(previousPlayerStates, previousBankState, currentTurnPlayerColor) {
    this.events = [];
    this.playerStates = JSON.parse(JSON.stringify(previousPlayerStates));
    this.bankState = previousBankState;
    this.currentTurnPlayerColor = currentTurnPlayerColor;
  }

  /**
   * @param {Object} event the latest event that has occurred during the turn
   */
  addEvent(event) {
    this.events.push(event);
  }

  /**
   * @param {Object} playerStateEvent the latest player state event that has occurred during the turn
   */
  addPlayerStates(playerStateEvent) {
    for (const newPlayerState of playerStateEvent.payload) {
      this.playerStates[newPlayerState.username] = newPlayerState;
    }
  }

  /**
   *
   * @param {Object} bankStateEvent the latest bank state event that has occurred during the turn
   */
  addBankState(bankStateEvent) {
    this.bankState = bankStateEvent.payload;
  }
}

/**
 * Collection of turns representing a full game from start to finish.
 */
class GameReplay {
  /**
   * @param {Array} events all of the events that occurred during the game
   */
  constructor(events) {
    this.turns = [];
    this.replayOwnerColor = null;
    this.usernameToColor = {};

    for (const event of events) {
      const data = event.data;
      const eventType = data.type;
      switch (eventType) {
        case TURN_STATE_EVENT:
          if (this.turns.length == 0) {
            this.turns.push(
              new GameTurn({}, {}, data.payload.currentTurnPlayerColor)
            );
          } else {
            const previousTurn = this.turns[this.turns.length - 1];
            if (
              previousTurn.currentTurnPlayerColor !=
              data.payload.currentTurnPlayerColor
            ) {
              this.turns.push(
                new GameTurn(
                  previousTurn.playerStates,
                  previousTurn.bankState,
                  data.payload.currentTurnPlayerColor
                )
              );
            }
          }
          break;
        case PLAYER_STATE_EVENT:
          this.turns[this.turns.length - 1].addPlayerStates(data);
          for (const playerState of data.payload) {
            this.usernameToColor[playerState.username] = playerState.color;
          }
          break;
        case BANK_STATE_EVENT:
          this.turns[this.turns.length - 1].addBankState(data);
          break;
        case PLAY_ORDER_EVENT:
          this.replayOwnerColor = data.payload.myColor;
          break;
        case BOARD_DESCRIPTION_EVENT:
        case CHAT_MESSAGE_EVENT:
        case LOG_MESSAGE_EVENT:
        case BUILD_CORNER_EVENT:
        case BUILD_EDGE_EVENT:
        case MOVE_ROBBER_EVENT:
          if (this.turns.length > 0) {
            this.turns[this.turns.length - 1].addEvent(data);
          }
          break;
        default:
          console.debug("Unused event", event);
          break;
      }
    }
  }
}
