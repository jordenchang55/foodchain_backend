import Game, { generateWorkingOrder, setupMap } from '../Game';
import EventManager from '../../models/EventManager';

jest.mock('../../models/EventManager');
expect.extend({
    toBeDistinct(received) {
        const pass = Array.isArray(received) && new Set(received).size === received.length;
        if (pass) {
            return {
                message: () => `expected [${received}] array is unique`,
                pass: true,
            };
        }
        return {
            message: () => `expected [${received}] array is not to unique`,
            pass: false,
        };
    },
});

describe('test Game', () => {
    let eventMgr;
    beforeEach(() => {
        EventManager.mockClear();
        eventMgr = new EventManager();
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
    });
    describe('generateWorkingOrder', () => {
        it('success', () => {
            const order = generateWorkingOrder(['user1', 'user2', 'user3']);
            expect(order).toMatchSnapshot();
        });
    });

    describe('askFirstRestaurant', () => {
        it('not skippable', () => {
            const game = new Game(eventMgr);
            game.askFirstRestaurant('user1', false);
            const mockEventMgr = EventManager.mock.instances[0];
            expect(mockEventMgr.notifyAll).toBeCalledWith('first_restaurant_decision', {
                nextPlayer: 'user1',
                skippable: false,
            });
        });
        it('skippable', () => {
            const game = new Game(eventMgr);
            game.askFirstRestaurant('user1', true);
            const mockEventMgr = EventManager.mock.instances[0];
            expect(mockEventMgr.notifyAll).toBeCalledWith('first_restaurant_decision', {
                nextPlayer: 'user1',
                skippable: true,
            });
        });
    });

    describe('setupMap', () => {
        it('2 players', () => {
            const gameMap = setupMap(2);
            expect(gameMap.tileConfig.length).toBe(9);
            expect(gameMap.tileConfig.map((t) => t.tileId)).toBeDistinct();
            expect(gameMap.tileConfig.map((t) => t.position).map((t) => JSON.stringify(t)))
                .toBeDistinct();
        });
        it('3 players', () => {
            const gameMap = setupMap(3);
            expect(gameMap.tileConfig.length).toBe(12);
            expect(gameMap.tileConfig.map((t) => t.tileId)).toBeDistinct();
            expect(gameMap.tileConfig.map((t) => t.position).map((t) => JSON.stringify(t)))
                .toBeDistinct();
        });
        it('4 players', () => {
            const gameMap = setupMap(4);
            expect(gameMap.tileConfig.length).toBe(16);
            expect(gameMap.tileConfig.map((t) => t.tileId)).toBeDistinct();
            expect(gameMap.tileConfig.map((t) => t.position).map((t) => JSON.stringify(t)))
                .toBeDistinct();
        });
        it('5 players', () => {
            const gameMap = setupMap(5);
            expect(gameMap.tileConfig.length).toBe(20);
            expect(gameMap.tileConfig.map((t) => t.tileId)).toBeDistinct();
            expect(gameMap.tileConfig.map((t) => t.position).map((t) => JSON.stringify(t)))
                .toBeDistinct();
        });
    });

    describe('initialize', () => {
        it('normal', () => {
            const game = new Game(eventMgr);
            game.initialize(['user1', 'user2', 'user3']);
            game.setup();
            const mockEventMgr = EventManager.mock.instances[0];
            const done = jest.fn();
            game.onFirstRestaurantPick('user1', [
                [0, 0, 3, 3],
                [0, 0, 4, 3],
                [0, 0, 3, 4],
                [0, 0, 4, 4],
            ], 0, done);
            game.onFirstRestaurantPick('user3', [
                [2, 3, 3, 3],
                [2, 3, 4, 3],
                [2, 3, 3, 4],
                [2, 3, 4, 4],
            ], 0, done);
            game.onFirstRestaurantPick('user2', [
                [0, 3, 3, 3],
                [0, 3, 4, 3],
                [0, 3, 3, 4],
                [0, 3, 4, 4],
            ], 0, done);
            expect(done).toBeCalledTimes(1);
            expect(mockEventMgr.notifyAll.mock.calls).toMatchSnapshot();
        });
        it('skip restaurant pick', () => {
            const game = new Game(eventMgr);
            game.initialize(['user1', 'user2', 'user3']);
            game.setup();
            const mockEventMgr = EventManager.mock.instances[0];
            game.onFirstRestaurantPick('user1', undefined);
            game.onFirstRestaurantPick('user3', undefined);
            game.onFirstRestaurantPick('user2', undefined);
            expect(mockEventMgr.notifyAll.mock.calls).toMatchSnapshot();
        });
    });

    describe('askReserveCards', () => {
        it('normal', () => {
            const game = new Game(eventMgr);
            game.initialize(['user1', 'user2', 'user3']);
            const mockEventMgr = EventManager.mock.instances[0];
            game.askReserveCards();
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('reserve_card_decision');
            const done = jest.fn();
            game.onReserveCardPick('user1', 100, done);
            game.onReserveCardPick('user2', 200, done);
            game.onReserveCardPick('user3', 300, done);
            expect(done).toBeCalledTimes(1);
        });
    });
});
