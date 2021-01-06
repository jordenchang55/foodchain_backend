import { shuffle } from '../utils/arr';
import { employees, houseTiles, mapTiles, marketingTiles, milestones } from '../gameConfigs';
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

    setupPool(playerNumber) {
        const ads = { ...marketingTiles };
        if (playerNumber < 5) {
            delete ads.Mk16;
        }
        if (playerNumber < 4) {
            delete ads.Mk15;
        }
        if (playerNumber < 3) {
            delete ads.Mk12;
        }
        const pool = { // An event may contain 1 or more keys defined below
            money: 50 * playerNumber,
            employees: Object.keys(employees)
                .map((id) => {
                    let { amount } = employees[id];
                    if (employees[id].limited) {
                        amount = playerNumber - 2;
                        if (amount === 0) {
                            amount = 1;
                        }
                    }
                    return ({
                        id,
                        amount,
                    });
                })
                .reduce((map, e) => ({ ...map, [e.id]: e.amount }), {}),
            milestones: {
                remain: Object.keys(milestones),
                achieved: {},
                new: {},
            },
            houses: Object.keys(houseTiles).filter((key) => !houseTiles[key].fixed),
            gardenNumber: 8,
            ads: Object.keys(ads),
        };
        this.eventManager.notifyAll('pool_update', pool);
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
