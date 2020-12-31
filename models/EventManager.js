import jwt from 'jsonwebtoken';

export default class EventManager {
    constructor(io) {
        this.io = io;
        this.internalEventMap = {};
        this.socketEventMap = {};
        io.on('connection', (socket) => {
            try {
                const payload = jwt.verify(socket.handshake.auth.token, process.env.token_secret);
                console.log(`user: ${payload.username} -- connected`);
                this.internalEventMap.$$player_add?.(payload.username);
                Object.keys(this.socketEventMap)
                    .forEach((eventName) => {
                        socket.on(eventName, this.socketEventMap[eventName]);
                    });

                socket.on('disconnect', () => {
                    this.internalEventMap.$$player_remove?.(payload.username);
                    delete this.socketEventMap[socket];
                });
            } catch (e) {
                socket.disconnect();
            }
        });
    }

    notifyAll(eventName, payload) {
        this.io.emit(eventName, payload);
    }

    on(eventName, callback) {
        if (eventName.startsWith('$$')) {
            this.internalEventMap[eventName] = callback;
        } else {
            this.socketEventMap[eventName] = callback;
        }
    }
}
