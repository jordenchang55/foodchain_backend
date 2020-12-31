import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { createServer } from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import rootRouter from './routes';

const app = express();

const http = createServer(app);
const io = socketIO(http);

io.on('connection', (socket) => {
    try {
        const payload = jwt.verify(socket.handshake.auth.token, process.env.token_secret);
        console.log(`user: ${payload.username} -- connected`);
    } catch (e) {
        socket.disconnect();
    }
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', rootRouter);

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

http.listen(process.env.PORT || '3000');
