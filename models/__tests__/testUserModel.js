import { UserModel } from '../index';
import { createDatabase } from '../db';

describe('test user model', () => {
    const db = createDatabase(':memory:');
    db.serialize(() => {
        db.run('INSERT INTO User (username, hashed_password) VALUES ("exist_user", "aaaa")');
    });

    jest.setTimeout(1000);
    describe('getUserByName', () => {
        const model = new UserModel(db);
        it('found', () => model.getUserByName('exist_user')
            .then((user) => {
                expect(user).not.toBeUndefined();
                expect(user.username).toBe('exist_user');
            }));
        it('not found', () => model.getUserByName('unknown_user')
            .then((user) => {
                expect(user).toBeUndefined();
            }));
    });

    describe('addUser', () => {
        const model = new UserModel(db);
        beforeAll(() => {

        });
        it('add non exist user', () => {
            const user = {
                username: 'new_user',
                password: 'passw@rd',
            };
            return model.addUser(user)
                .then((res) => {
                    expect(res).toBe(true);
                })
                .then(() => model.getUserByName('new_user'))
                .then((newUser) => {
                    expect(newUser).not.toBeUndefined();
                    expect(newUser.username).toBe('new_user');
                });
        });
        it('add existed username', () => {
            const user = {
                username: 'exist_user',
                password: 'passw@rd',
            };
            return model.addUser(user)
                .then((res) => expect(res).toBe(false));
        });
    });

    afterAll(() => {
        db.run('DROP TABLE User;');
    });
});
