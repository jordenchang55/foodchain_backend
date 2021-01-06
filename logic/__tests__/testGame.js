import Game from '../Game';
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
            const game = new Game(eventMgr);
            game.generateWorkingOrder(['user1', 'user2', 'user3']);
            const mockEventMgr = EventManager.mock.instances[0];
            expect(mockEventMgr.notifyAll).toBeCalledWith('order_decision', {
                available: [],
                selected: expect.arrayContaining(['user1', 'user2', 'user3']),
            });
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
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupMap(2);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('setup_map');
            expect(mockEventMgr.notifyAll.mock.calls[0][1].tiles.length).toBe(9);
            expect(mockEventMgr.notifyAll.mock.calls[0][1].tiles.map((t) => t.tileId)).toBeDistinct();
            expect(mockEventMgr.notifyAll.mock.calls[0][1].tiles.map((t) => t.position).map((t) => JSON.stringify(t)))
                .toBeDistinct();
        });
        it('3 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupMap(3);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('setup_map');
            expect(mockEventMgr.notifyAll.mock.calls[0][1].tiles.map((t) => t.position).map((t) => JSON.stringify(t)))
                .toBeDistinct();
        });
        it('4 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupMap(4);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('setup_map');
            expect(mockEventMgr.notifyAll.mock.calls[0][1].tiles.length).toBe(16);
        });
        it('5 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupMap(5);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('setup_map');
            expect(mockEventMgr.notifyAll.mock.calls[0][1].tiles.length).toBe(20);
        });
    });

    describe('setupPool', () => {
        it('2 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupPool(2);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('pool_update');
            expect(mockEventMgr.notifyAll.mock.calls[0][1]).toMatchSnapshot();
        });

        it('3 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupPool(3);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('pool_update');
            expect(mockEventMgr.notifyAll.mock.calls[0][1]).toMatchSnapshot();
        });
        it('4 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupPool(4);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('pool_update');
            expect(mockEventMgr.notifyAll.mock.calls[0][1]).toMatchSnapshot();
        });
        it('5 players', () => {
            const game = new Game(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            game.setupPool(5);
            expect(mockEventMgr.notifyAll.mock.calls[0][0]).toBe('pool_update');
            expect(mockEventMgr.notifyAll.mock.calls[0][1]).toMatchSnapshot();
        });
    });

    describe('initialize', () => {
        it('normal', () => {
            const game = new Game(eventMgr);
            game.initialize(['user1', 'user2', 'user3']);
            const mockEventMgr = EventManager.mock.instances[0];
            game.onFirstRestaurantPick('user1', [
                [0, 0, 3, 3],
                [0, 0, 4, 3],
                [0, 0, 3, 4],
                [0, 0, 4, 4],
            ], 0);
            game.onFirstRestaurantPick('user3', [
                [2, 3, 3, 3],
                [2, 3, 4, 3],
                [2, 3, 3, 4],
                [2, 3, 4, 4],
            ], 0);
            game.onFirstRestaurantPick('user2', [
                [0, 3, 3, 3],
                [0, 3, 4, 3],
                [0, 3, 3, 4],
                [0, 3, 4, 4],
            ], 0);
            expect(mockEventMgr.notifyAll.mock.calls).toMatchSnapshot();
        });
        it('skip restaurant pick', () => {
            const game = new Game(eventMgr);
            game.initialize(['user1', 'user2', 'user3']);
            const mockEventMgr = EventManager.mock.instances[0];
            game.onFirstRestaurantPick('user1', undefined);
            game.onFirstRestaurantPick('user3', undefined);
            game.onFirstRestaurantPick('user2', undefined);
            expect(mockEventMgr.notifyAll.mock.calls).toMatchSnapshot();
        });
    });
});
