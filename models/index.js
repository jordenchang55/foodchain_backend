class UserModel {
    constructor(db) {
        this.db = db;
    }

    getUserByName(username) {
        const statement = 'SELECT * FROM User\n'
            + 'WHERE username=$username';
        const params = {
            $username: username,
        };
        return new Promise(((resolve, reject) => {
            this.db.get(statement, params, (err, rows) => {
                if (!err) {
                    let user;
                    if (rows) {
                        user = {
                            username: rows.username,
                            password: rows.hashed_password,
                        };
                    }
                    resolve(user);
                } else {
                    reject(err);
                }
            });
        }));
    }

    addUser(user) {
        const statement = 'INSERT INTO User (username, hashed_password)\n'
            + ' VALUES ($username, $hashed_password)';
        const params = {
            $username: user.username,
            $hashed_password: user.password,
        };
        return new Promise(((resolve, reject) => {
            this.db.run(statement, params, (err) => {
                if (!err) {
                    resolve(true);
                } else if (err.errno === 19) {
                    resolve(false);
                } else {
                    reject(err);
                }
            });
        }));
    }
}

exports.UserModel = UserModel;
