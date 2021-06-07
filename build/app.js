"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./database/connection"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = require("path");
/** Routes */
const user_routes_1 = __importDefault(require("./routes/user-routes"));
const trip_routes_1 = __importDefault(require("./routes/trip-routes"));
/** Initialize environment */
dotenv_1.default.config({ path: path_1.resolve(__dirname, '../.env') });
/** Setup application and port */
const app = express_1.default();
const PORT = process.env.PORT || 5000;
const testConnection = () => {
    connection_1.default.Conn.authenticate()
        .then((_) => console.log('The database connection is working'))
        .catch((_) => console.log('The connetion to the database failed...'));
};
/** Initialize database */
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    next();
});
app.use('/users', user_routes_1.default);
app.use('/trips', trip_routes_1.default);
app.use((_, res) => {
    res.status(404).json({ error: 'EndpointNotFound' });
});
const options = {
    key: fs_1.default.readFileSync(__dirname + '/certification/localhost.key'),
    cert: fs_1.default.readFileSync(__dirname + '/certification/localhost.crt')
};
https_1.default.createServer(options, app).listen(PORT);
console.log(`Server running on ${PORT}`);
testConnection();
