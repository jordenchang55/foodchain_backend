import { transformPosition } from '../map';

describe('test map utils', () => {
    describe('test transform', () => {
        it('(1,3)', () => {
            expect(transformPosition([1, 3], 0)).toEqual([1, 3]);
            expect(transformPosition([1, 3], 1)).toEqual([1, 1]);
            expect(transformPosition([1, 3], 2)).toEqual([3, 1]);
            expect(transformPosition([1, 3], 3)).toEqual([3, 3]);
        });
        it('(3,4)', () => {
            expect(transformPosition([3, 4], 0)).toEqual([3, 4]);
            expect(transformPosition([3, 4], 1)).toEqual([0, 3]);
            expect(transformPosition([3, 4], 2)).toEqual([1, 0]);
            expect(transformPosition([3, 4], 3)).toEqual([4, 1]);
        });
    });
});
