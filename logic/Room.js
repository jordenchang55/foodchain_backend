/* eslint-disable no-underscore-dangle */

export class Room {
    constructor(eventManager, capacity = 5) {
        this.eventManager = eventManager;
        this.capacity = capacity;
        this.players = {};
        this.spectaculars = {};
        this.isPlaying = false;

        this.setupEventListeners();
    }

    addPlayer(username) {
        const playerNum = Object.keys(this.players).length;
        if (playerNum >= this.capacity || this.isPlaying) {
            this.spectaculars[username] = {};
        } else {
            const seat = Object.values(this.players)
                .map((p) => p.index)
                .reduce((prev, curr) => (curr === prev ? (curr + 1) : Math.min(prev, curr)), 0);
            this.players[username] = {
                prepared: false,
                index: seat,
            };
        }
        this.notifyPlayerList();
    }

    removePlayer(username) {
        if (this.players[username]) {
            delete this.players[username];
        } else {
            delete this.spectaculars[username];
        }
        this.notifyPlayerList();
    }

    setupEventListeners() {
        this.eventManager.on('$$player_add', (username) => {
            this.addPlayer(username);
        });
        this.eventManager.on('$$player_remove', (username) => {
            this.removePlayer(username);
        });
        this.eventManager.on(
            'preparation',
            (u, msg) => this.onPlayerPrepared(u, msg.prepared),
        );
        this.eventManager.on(
            'exchange_place',
            (u, msg) => this.onPlayerExchanged(u, msg.index),
        );
    }

    onPlayerPrepared(username, prepared) {
        if (this.players[username]) {
            this.players[username].prepared = prepared;
        }
        this.notifyPlayerList();
        if (Object.values(this.players).length >= 2 && Object.values(this.players).every((p) => p.prepared)) {
            this.launchGame();
        }
    }

    onPlayerExchanged(username, index) {
        if (this.players[username]) {
            this.players[username].index = index;
        }
        this.notifyPlayerList();
    }

    notifyPlayerList() {
        this.eventManager.notifyAll('player_list_update', {
            players: this.players,
            spectaculars: Object.keys(this.spectaculars),
        });
    }

    launchGame() {
        this.isPlaying = true;
        this.eventManager.notifyAll('launch', {
            players: this.players,
            spectaculars: Object.keys(this.spectaculars),
        });
    }
}
