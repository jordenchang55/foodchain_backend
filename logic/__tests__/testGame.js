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
});
