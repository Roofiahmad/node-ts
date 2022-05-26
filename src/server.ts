import express, { application } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import authorRoutes from './routes/Author';
import bookRoutes from './routes/Book';
import userRoutes from './routes/user';
const router = express();

// connect to Mongo
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('database connected');
        startServer();
    })
    .catch((err) => console.log(err));

/* Only start the server if mongo connect */ const startServer = () => {
    router.use((req, res, next) => {
        /** Log the request */
        Logging.info(`incoming => method: [${req.method}] -url: [${req.url}] -IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** log the response */
            console.log(req);
            Logging.info(`outgoing => method: [${req.method}] -url: [${req.url}] -IP: [${req.socket.remoteAddress}] -url: [${req.url}] -status: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Rules of our API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); // this request can come from anywhere
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    /**Routes */
    router.use('/authors', authorRoutes);
    router.use('/books', bookRoutes);
    router.use('/user', userRoutes);

    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    /** Error Handling */
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => {
        Logging.info(`server running at port ${config.server.port}`);
    });
};
