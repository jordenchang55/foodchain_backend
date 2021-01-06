import { shuffle } from '../utils/arr';
import { employees, houseTiles, mapTiles, marketingTiles, milestones } from '../gameConfigs';
import GameMap from './GameMap';
import { transformPosition } from '../utils/map';

export const setupMap = (playerNumber) => {
    const xSize = playerNumber >= 3 ? playerNumber : 3;
    const ySize = playerNumber >= 3 ? 4 : 3;
    const tileIds = shuffle(Object.keys(mapTiles)).slice(0, xSize * ySize);
    const configs = tileIds
        .map((tileId) => ({
            tileId,
            direction: Math.floor(Math.random() * 4),
        }));
    return new GameMap(xSize, ySize, configs);
};

export const setupPool = (playerNumber) => {
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
    return { // An event may contain 1 or more keys defined below
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
};

export const generateWorkingOrder = (players) => {
    const order = [];
    for (let i = 0; i < players.length; i += 1) {
        order.push(i);
    }
    const randomOrder = shuffle(order);
    return randomOrder.map((i) => players[i]);
};

export default class Game {
    constructor(eventManager) {
        this.eventManager = eventManager;
    }

    initialize(players) {
        this.turn = 1;
        this.phase = 1;
        this.players = players;
        this.gameMap = setupMap(players.length);
        this.eventManager.notifyAll('setup_map', {
            tiles: this.gameMap.tileConfig,
        });

        this.pool = setupPool(players.length);
        this.eventManager.notifyAll('pool_update', this.pool);

        this.workingOrder = generateWorkingOrder(players);
        this.eventManager.notifyAll('order_decision', {
            available: [],
            selected: this.workingOrder,
        });

        this.restaurants = {};
        this.setupRestaurants();
    }

    setupRestaurants() {
        return new Promise((resolve) => {
            this.eventManager.on(
                'pick_first_restaurant',
                (username, msg) => this.onFirstRestaurantPick(username, [
                    msg.position.xTile,
                    msg.position.yTile,
                    msg.position.xSmall,
                    msg.position.ySmall,
                ], msg.direction, resolve),
            );
            const firstPick = this.workingOrder[this.workingOrder.length - 1];
            this.askFirstRestaurant(firstPick, true);
        });
    }

    askFirstRestaurant(username, skippable) {
        this.eventManager.notifyAll('first_restaurant_decision', {
            nextPlayer: username,
            skippable,
        });
    }

    onFirstRestaurantPick(username, position, direction, done) {
        if (!position) {
            this.restaurants[username] = null;
        } else {
            this.gameMap.putTile(username, position.map((p) => transformPosition(p, direction)));
            this.restaurants[username] = 1;
            this.eventManager.notifyAll('tiles_placement', {
                type: 'restaurant',
                position,
                direction,
            });
        }
        let nextIndex = (this.workingOrder.indexOf(username) - 1 + this.workingOrder.length);

        while (nextIndex >= 0 && this.restaurants[this.workingOrder[nextIndex % this.workingOrder.length]]) {
            nextIndex -= 1;
        }
        if (nextIndex < 0) {
            done?.();
        } else {
            const nextUser = this.workingOrder[nextIndex % this.workingOrder.length];
            this.askFirstRestaurant(nextUser, this.restaurants[nextUser] === undefined);
        }
    }
}
