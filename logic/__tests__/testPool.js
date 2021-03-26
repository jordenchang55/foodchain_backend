import Pool from '../Pool';

describe('Pool', () => {
    it('2 players', () => {
        const pool = new Pool(2);
        expect(pool.toObject()).toMatchSnapshot();
    });

    it('3 players', () => {
        const pool = new Pool(3);
        expect(pool.toObject()).toMatchSnapshot();
    });
    it('4 players', () => {
        const pool = new Pool(4);
        expect(pool.toObject()).toMatchSnapshot();
    });
    it('5 players', () => {
        const pool = new Pool(5);
        expect(pool.toObject()).toMatchSnapshot();
    });
});
