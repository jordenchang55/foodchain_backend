import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { createServer } from 'http';
import socketIO from 'socket.io';
import rootRouter from './routes';

const app = express();

const http = createServer(app);
const io = socketIO(http);

app.use('/', rootRouter);

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.handshake.auth.token}`);
    // TODO: verify token
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

http.listen(process.env.PORT || '3000');
