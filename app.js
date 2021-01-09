import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { createServer } from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
import rootRouter from './routes';
import { Room } from './logic/Room';
import EventManager from './models/EventManager';

const app = express();

const http = createServer(app);

let socketOptions;
if (process.env.DEBUG) {
    socketOptions = {
        cors: {
            origin: 'http://localhost:8080',
            methods: ['GET', 'POST'],
        },
    };
} else {
    socketOptions = {};
}
const io = socketIO(http, socketOptions);

const eventManager = new EventManager(io);
// eslint-disable-next-line no-unused-vars
const room = new Room(eventManager);

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', rootRouter);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

http.listen(process.env.PORT || '3000');
