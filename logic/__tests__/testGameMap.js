import GameMap from '../GameMap';

describe('test game map', () => {
    describe('1x1 map tile', () => {
        it('up', () => {
            const map = new GameMap(1, 1, [{
                tileId: 'M05',
                direction: 0,
            }]);
            expect(map.getTile(0, 0, 1, 1)).toBe('beer');
            expect(map.getTile(0, 0, 2, 2)).toBe('H08');
            expect(map.getTile(0, 0, 3, 2)).toBe('H08');
            expect(map.getTile(0, 0, 2, 3)).toBe('H08');
        });
        it('left', () => {
            const map = new GameMap(1, 1, [{
                tileId: 'M05',
                direction: 3,
            }]);
            expect(map.getTile(0, 0, 1, 3)).toBe('beer');
            expect(map.getTile(0, 0, 2, 1)).toBe('H08');
            expect(map.getTile(0, 0, 2, 2)).toBe('H08');
            expect(map.getTile(0, 0, 3, 1)).toBe('H08');
        });
    });

    describe('2x3 map tiles', () => {
        it('various directions', () => {
            const map = new GameMap(2, 3, [
                { tileId: 'M05', direction: 1 },
                { tileId: 'M06', direction: 0 },
                { tileId: 'M09', direction: 2 },
                { tileId: 'M07', direction: 3 },
                { tileId: 'M19', direction: 3 },
                { tileId: 'M15', direction: 1 },
            ]);
            expect(map.getTile(0, 0, 3, 1)).toBe('beer');
            expect(map.getTile(0, 0, 0, 1)).toBe(0);
            expect(map.getTile(0, 0, 2, 2)).toBe('H08');

            expect(map.getTile(1, 0, 1, 1)).toBe('H10');
            expect(map.getTile(1, 0, 4, 2)).toBe(1);

            expect(map.getTile(0, 1, 0, 1)).toBe('H15');
            expect(map.getTile(0, 1, 1, 0)).toBe('H15');
            expect(map.getTile(0, 1, 3, 2)).toBe(1);

            expect(map.getTile(1, 1, 2, 2)).toBe(3);
            expect(map.getTile(1, 1, 2, 0)).toBe(2);
            expect(map.getTile(1, 1, 1, 2)).toBe(1);
            expect(map.getTile(1, 1, 1, 4)).toBe('H12');

            expect(map.getTile(0, 2, 0, 1)).toBe('coke');
            expect(map.getTile(0, 2, 3, 4)).toBe('beer');
            expect(map.getTile(0, 2, 2, 1)).toBe(1);
            expect(map.getTile(0, 2, 4, 4)).toBe(0);

            expect(map.getTile(1, 2, 4, 1)).toBe('beer');
            expect(map.getTile(1, 2, 0, 1)).toBe(0);
            expect(map.getTile(1, 2, 0, 2)).toBe(1);
        });
    });

    describe('put new tile', () => {
        const map = new GameMap(2, 3, [
            { tileId: 'M05', direction: 1 },
            { tileId: 'M06', direction: 0 },
            { tileId: 'M09', direction: 2 },
            { tileId: 'M07', direction: 3 },
            { tileId: 'M19', direction: 3 },
            { tileId: 'M15', direction: 1 },
        ]);

        expect(map.putTile('Mk16', [[1, 2, 4, 1]])).toBe(false);
        expect(map.putTile('Mk16', [[1, 2, 0, 1]])).toBe(true);
    });
    describe('remove tile', () => {
        const map = new GameMap(1, 1, [{
            tileId: 'M05',
            direction: 0,
        }]);
        map.removeTile([[0, 0, 1, 1]]);
        expect(map.getTile(0, 0, 1, 1)).toBe(0);
    });
});
