"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config({ path: path_1.resolve(__dirname, '../../.env') });
exports.connection = new sequelize_1.Sequelize('cssc', 'root', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});
const userModel = User_1.default(exports.connection);
userModel.sync();
exports.default = {
    Conn: exports.connection,
    UserModel: userModel
};
