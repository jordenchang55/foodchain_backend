import { shuffle } from '../utils/arr';

export default class Game {
    constructor(eventManager) {
        this.eventManager = eventManager;
    }

    generateWorkingOrder(players) {
        const order = [];
        for (let i = 0; i < players.length; i += 1) {
            order.push(i);
        }
        const randomOrder = shuffle(order);
        this.workingOrder = randomOrder.map((i) => players[i]);
        this.eventManager.notifyAll('order_decision', {
            available: [],
            selected: this.workingOrder,
        });
    }
}
