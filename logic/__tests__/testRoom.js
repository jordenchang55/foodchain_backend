import EventManager from '../../models/EventManager';
import { Room } from '../Room';

jest.mock('../../models/EventManager');

describe('test Room', () => {
    let eventMgr;
    beforeEach(() => {
        EventManager.mockClear();
        eventMgr = new EventManager();
    });
    describe('add player', () => {
        it('success', () => {
            const room = new Room(eventMgr);
            expect(EventManager).toHaveBeenCalledTimes(1);

            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            expect(mockEventMgr.on).toBeCalledWith('preparation', expect.any(Function));
            expect(mockEventMgr.notifyAll).toBeCalledTimes(1);
            expect(mockEventMgr.notifyAll).toBeCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                },
                spectaculars: [],
            });
        });
        it('multiple', () => {
            const room = new Room(eventMgr);
            expect(EventManager).toHaveBeenCalledTimes(1);

            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            expect(mockEventMgr.notifyAll).toBeCalledTimes(1);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                },
                spectaculars: [],
            });
            room.addPlayer('user2');
            expect(mockEventMgr.notifyAll).toBeCalledTimes(2);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                    user2: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
        it('add vacant seat', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.addPlayer('user3');
            room.addPlayer('user4');
            room.removePlayer('user2');
            room.removePlayer('user3');
            room.addPlayer('new_user');
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                    user4: {
                        prepared: false,
                        index: 3,
                    },
                    new_user: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
        it('add vacant seat at first', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.addPlayer('user3');
            room.addPlayer('user4');
            room.removePlayer('user1');
            room.removePlayer('user3');
            room.addPlayer('new_user');
            expect(mockEventMgr.notifyAll.mock.calls).toMatchSnapshot();
        });
        it('player full', () => {
            const room = new Room(eventMgr, 2);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.addPlayer('user3');
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                    user2: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: ['user3'],
            });
        });
        it('add player after playing', () => {
            const room = new Room(eventMgr, 3);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.onPlayerPrepared('user1', true);
            room.onPlayerPrepared('user2', true);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('launch', {
                players: {
                    user1: {
                        prepared: true,
                        index: 0,
                    },
                    user2: {
                        prepared: true,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
            room.addPlayer('user3');
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: true,
                        index: 0,
                    },
                    user2: {
                        prepared: true,
                        index: 1,
                    },
                },
                spectaculars: ['user3'],
            });
        });
    });
    describe('remove player', () => {
        it('existing player', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.removePlayer('user1');
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user2: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
        it('not existing player', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.removePlayer('nobody');
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                    user2: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
    });
    describe('test preparation change', () => {
        it('set prepared', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.onPlayerPrepared('user1', true);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: true,
                        index: 0,
                    },
                },
                spectaculars: [],
            });
        });
        it('set prepared multiple user', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.onPlayerPrepared('user2', true);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                    user2: {
                        prepared: true,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
        it('cancel prepared', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.onPlayerPrepared('user1', true);
            room.onPlayerPrepared('user1', false);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 0,
                    },
                },
                spectaculars: [],
            });
        });
        it('all prepared multiple players', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.addPlayer('user2');
            room.onPlayerPrepared('user1', true);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: true,
                        index: 0,
                    },
                    user2: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
            room.onPlayerPrepared('user2', true);
            expect(mockEventMgr.notifyAll).toHaveBeenNthCalledWith(4, 'player_list_update', {
                players: {
                    user1: {
                        prepared: true,
                        index: 0,
                    },
                    user2: {
                        prepared: true,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('launch', {
                players: {
                    user1: {
                        prepared: true,
                        index: 0,
                    },
                    user2: {
                        prepared: true,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
    });
    describe('player exchange restaurant', () => {
        it('exchange from 0 t0 1', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.onPlayerExchanged('user1', 1);
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 1,
                    },
                },
                spectaculars: [],
            });
        });
        it('new player joined after exchange', () => {
            const room = new Room(eventMgr);
            const mockEventMgr = EventManager.mock.instances[0];
            room.addPlayer('user1');
            room.onPlayerExchanged('user1', 2);
            room.addPlayer('user2');
            expect(mockEventMgr.notifyAll).toHaveBeenLastCalledWith('player_list_update', {
                players: {
                    user1: {
                        prepared: false,
                        index: 2,
                    },
                    user2: {
                        prepared: false,
                        index: 0,
                    },
                },
                spectaculars: [],
            });
        });
    });
});
