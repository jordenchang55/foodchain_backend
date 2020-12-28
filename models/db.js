import sqlite3 from 'sqlite3';

export const createDatabase = (dbName) => {
    const db = new sqlite3.Database(dbName);
    db.serialize(() => {
        db.run(
            'CREATE TABLE IF NOT EXISTS User(\n'
            + 'username TEXT PRIMARY KEY,\n'
            + 'hashed_password TEXT NOT NULL);\n',
        );
    });
    return db;
};
