/**
 * This class maintain the representation of employee tree.
 */
import { employees } from '../gameConfigs';

export default class Structure {
    constructor(structure) {
        this.structure = structure || {};
    }

    getOpenSlot(defaultSlot = 3) {
        return Object.keys(this.structure)
            .map((id) => ({
                ...employees[id],
                count: this.structure[id],
            }))
            .reduce((accSlot, employee) => {
                let slot;
                if (employee.category === 'management') {
                    slot = Number(employee.description) - 1;
                } else {
                    slot = -1;
                }
                return accSlot + slot * employee.count;
            }, defaultSlot);
    }
}
