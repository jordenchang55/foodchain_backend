import { shuffle } from '../utils/arr';
import { mapTiles } from '../gameConfigs';
import GameMap from './GameMap';

export default class Game {
    constructor(eventManager) {
        this.eventManager = eventManager;
    }

    setupMap(playerNumber) {
        const xSize = playerNumber >= 3 ? playerNumber : 3;
        const ySize = playerNumber >= 3 ? 4 : 3;
        const tiles = shuffle(Object.keys(mapTiles));
        const randomTiles = tiles.slice(0, xSize * ySize)
            .map((tileId) => ({
                tileId,
                direction: Math.floor(Math.random() * 4),
            }));
        this.gameMap = new GameMap(xSize, ySize, randomTiles);
        this.eventManager.notifyAll('setup_map', {
            tiles: randomTiles.map((tile, index) => ({
                ...tile,
                position: {
                    xTile: index % xSize,
                    yTile: Math.floor(index / xSize),
                },
            })),
        });
    }

    generateWorkingOrder(players) {
        const order = [];
        for (let i = 0; i < players.length; i += 1) {
            order.push(i);
        }
        const randomOrder = shuffle(order);
        this.workingOrder = randomOrder.map((i) => players[i]);
        this.eventManager.notifyAll('order_decision', {
            available: [],
            selected: this.workingOrder,
        });
    }

    askFirstRestaurant(username, skippable) {
        this.eventManager.notifyAll('first_restaurant_decision', {
            nextPlayer: username,
            skippable,
        });
    }
}
