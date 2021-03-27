import { shuffle } from '../utils/arr';
import { mapTiles } from '../gameConfigs';
import GameMap from './GameMap';
import { transformPosition } from '../utils/map';
import Pool from './Pool';
import Structure from './Structure';

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
        this.playerProps = players.reduce((map, playerName) => ({
            ...map,
            [playerName]: {
                coffeeShopAmount: 3,
                restaurantAmount: 3,
                foods: [],
                milestones: [],
                structure: undefined,
                onBeach: {},
                advertising: {},
                money: 0,
            },
        }), {});
        this.reserveCards = {};
        this.lastWorkingOrder = {
            // Username: index
        };
        this.restaurants = {};
    }

    setup() {
        const players = Object.keys(this.playerProps);
        this.gameMap = setupMap(players.length);
        this.eventManager.notifyAll('setup_map', {
            tiles: this.gameMap.tileConfig,
        });

        this.pool = new Pool(players.length);
        this.eventManager.notifyAll('pool_update', this.pool.toObject());

        this.workingOrder = generateWorkingOrder(players);
        this.eventManager.notifyAll('order_decision', {
            available: [],
            selected: Object.keys(this.workingOrder).sort((a, b) => this.workingOrder[a] - this.workingOrder[b]),
        });

        this.setupRestaurants()
            .then(() => this.askReserveCards())
            .then(() => {
                this.eventManager.on(
                    'lock_structure',
                    (username, msg) => this.onStructureLocked(username, msg, this.askOrderDecision),
                );
                this.eventManager.on('pick_order', this.onOrderDecided);
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
            this.playerProps[username].restaurantAmount = 2;
            this.eventManager.notifyAll('tiles_placement', {
                type: 'restaurant',
                position,
                direction,
            });
            this.eventManager.notifyAll('player_update', this.playerProps);
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
        if (Object.keys(this.reserveCards).length === Object.keys(this.playerProps).length) {
            done?.();
        }
    }

    /**
     * When a player finalize their structure, this callback will be invoked.
     * @param username key of that player.
     * @param structure a map of employee id with number of that card.
     */
    onStructureLocked(username, structure, onComplete) {
        this.playerProps[username].structure = new Structure(structure);
        const emptyStructures = Object.values(this.playerProps)
            .map((props) => props.structure)
            .filter((s) => !s);
        if (!emptyStructures.length) {
            const structures = Object.keys(this.playerProps)
                .reduce((obj, player) => ({
                    ...obj,
                    [player]: {
                        structure: this.playerProps[player].structure.structure,
                        // TODO add milestone and reserve card offset
                        openSlots: this.playerProps[player].structure?.getOpenSlot() ?? 0,
                    },
                }), {});
            this.eventManager.notifyAll('show_up', structures);

            this.decisionOrder = Object.keys(this.playerProps)
                .sort((a, b) => {
                    if (structures[b].openSlots !== structures[a].openSlots) {
                        return structures[b].openSlots - structures[a].openSlots;
                    }
                    if (structures[b].structure.E01 !== structures[a].structure.E01) {
                        // Compare the number of waitresses if tie
                        return (structures[b].structure.E01 ?? 0) - (structures[a].structure.E01 ?? 0);
                    }
                    // Use the working order of last turn for tie breaker
                    return this.lastWorkingOrder[a] - this.lastWorkingOrder[b];
                });
            onComplete?.();
        }
    }
}
