import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';

import { UserModel } from '../models';
import { createDatabase } from '../models/db';
import { hash } from '../utils/crypt';

const router = express.Router();
const db = process.env.NODE_ENV === 'test' ? createDatabase(':memory:') : createDatabase('test.db');
const model = new UserModel(db);

/* GET socket test page */
router.get('/test', (req, res) => {
    res.sendFile(path.join(`${__dirname}/../test.html`));
});
router.post('/login', (req, res) => {
    const json = req.body;
    if (!json.username || !json.password) {
        res.status(400)
            .json({
                errorMsg: 'Invalid data',
            });
        return;
    }
    model.getUserByName(json.username)
        .then((user) => {
            if (!user) {
                return model.addUser({
                    username: json.username,
                    password: hash(json.password),
                });
            }
            return Promise.resolve(user.password === hash(json.password));
        })
        .then((success) => {
            if (success) {
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
                    username: json.username,
                }, process.env.token_secret);
                res.status(200)
                    .json({ token });
            } else {
                res.status(400)
                    .json({
                        errorMsg: 'Wrong password',
                    });
            }
        });
});
module.exports = router;
