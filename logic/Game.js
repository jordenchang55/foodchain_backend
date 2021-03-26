import { shuffle } from '../utils/arr';
import { mapTiles } from '../gameConfigs';
import GameMap from './GameMap';
import { transformPosition } from '../utils/map';
import Pool from './Pool';

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
        this.reserveCards = {};
        this.restaurants = {};
    }

    setup() {
        this.gameMap = setupMap(this.players.length);
        this.eventManager.notifyAll('setup_map', {
            tiles: this.gameMap.tileConfig,
        });

        this.pool = new Pool(this.players.length);
        this.eventManager.notifyAll('pool_update', this.pool.toObject());

        this.workingOrder = generateWorkingOrder(this.players);
        this.eventManager.notifyAll('order_decision', {
            available: [],
            selected: this.workingOrder,
        });

        this.setupRestaurants()
            .then(() => this.askReserveCards())
            .then(() => {
                this.eventManager.notifyAll('turn_update', {
                    turn: this.turn,
                });
            });
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

    askReserveCards() {
        return new Promise((resolve) => {
            this.eventManager.on('pick_reserve_card', (username, msg) => {
                this.onReserveCardPick(username, msg.card, resolve);
            });
            this.eventManager.notifyAll('reserve_card_decision', {});
        });
    }

    onReserveCardPick(username, card, done) {
        this.reserveCards[username] = card;
        if (Object.keys(this.reserveCards).length === this.players.length) {
            done?.();
        }
    }
}
