import { employees, houseTiles, marketingTiles, milestones } from '../gameConfigs';

export default class Pool {
    constructor(playerNumber) {
        const ads = { ...marketingTiles };
        if (playerNumber < 5) {
            delete ads.Mk16;
        }
        if (playerNumber < 4) {
            delete ads.Mk15;
        }
        if (playerNumber < 3) {
            delete ads.Mk12;
        }

        this.money = 50 * playerNumber;
        this.employees = Object.keys(employees)
            .map((id) => {
                let { amount } = employees[id];
                if (employees[id].limited) {
                    amount = playerNumber - 2;
                    if (amount === 0) {
                        amount = 1;
                    }
                }
                return ({
                    id,
                    amount,
                });
            })
            .reduce((map, e) => ({ ...map, [e.id]: e.amount }), {});
        this.milestones = {
            remain: Object.keys(milestones),
            achieved: {},
            new: {},
        };
        this.houses = Object.keys(houseTiles).filter((key) => !houseTiles[key].fixed);
        this.gardenNumber = 8;
        this.ads = Object.keys(ads);
    }

    toObject() {
        return {
            money: this.money,
            employees: this.employees,
            milestones: this.milestones,
            houses: this.houses,
            gardenNumber: this.gardenNumber,
            ads: this.ads,
        };
    }
}
