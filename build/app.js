"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
/** Initialize environment */
const ENV = dotenv_1.default.config();
console.log(ENV.parsed);
console.log(process.env.PORT);
/** Setup application and port */
const app = express_1.default();
const PORT = 1000;
/** Initialize database */
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    next();
});
/** Begin listening */
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
