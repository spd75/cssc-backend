import db from './database/connection';
import Dotenv from 'dotenv';
import Express, { Application, NextFunction, Response, Request } from 'express';
import fs from 'fs';
import https from 'https';
import { resolve } from 'path';

/** Routes */
import userRoutes from './routes/user-routes';
import tripRoutes from './routes/trip-routes';

/** Initialize environment */
Dotenv.config({ path: resolve(__dirname, '../.env') });

/** Setup application and port */
const app: Application = Express();
const PORT = process.env.PORT || 5000;

const testConnection = () => {
    db.Conn.authenticate()
        .then((_) => console.log('The database connection is working'))
        .catch((_) => console.log('The connetion to the database failed...'));
};

/** Initialize database */
app.use(Express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    next();
});

app.use('/users', userRoutes);
app.use('/trips', tripRoutes);

app.use((_: Request, res: Response) => {
    res.status(404).json({ error: 'EndpointNotFound' });
});

const options = {
    key: fs.readFileSync(__dirname + '/certification/localhost.key'),
    cert: fs.readFileSync(__dirname + '/certification/localhost.crt')
};

https.createServer(options, app).listen(PORT);
console.log(`Server running on ${PORT}`);
testConnection();
