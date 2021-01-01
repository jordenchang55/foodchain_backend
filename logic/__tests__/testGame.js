import Game from '../Game';
import EventManager from '../../models/EventManager';

jest.mock('../../models/EventManager');

describe('test Game', () => {
    let eventMgr;
    beforeEach(() => {
        EventManager.mockClear();
        eventMgr = new EventManager();
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
});
