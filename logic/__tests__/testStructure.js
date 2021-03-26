import Structure from '../Structure';

describe('Structure', () => {
    describe('open slot', () => {
        it('no employee', () => {
            const s = new Structure();
            expect(s.getOpenSlot()).toEqual(3);
        });
        it('no manager', () => {
            const s = new Structure({
                E04: 1,
                E03: 1,
            });
            expect(s.getOpenSlot()).toEqual(1);
        });
        it('each management', () => {
            const s = new Structure({
                E02: 1,
                E10: 1,
                E17: 1,
                E26: 1,
                E31: 1,
            });
            expect(s.getOpenSlot()).toEqual(22);
        });
        it('managers with other employee', () => {
            const s = new Structure({
                E02: 3,
                E10: 2,
                E16: 1,
                E25: 2,
                E20: 5,
            });
            expect(s.getOpenSlot()).toEqual(2);
        });
        it('Different initial open slot', () => {
            const s = new Structure({
                E02: 3,
                E10: 2,
                E16: 1,
                E25: 2,
                E20: 5,
            });
            expect(s.getOpenSlot(2)).toEqual(1);
        });
    });
});
