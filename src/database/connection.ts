import dotenv from 'dotenv';
import { resolve } from 'path';
import { Sequelize } from 'sequelize';
import User from '../models/User';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export const connection = new Sequelize('cssc', 'root', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const userModel = User(connection);
userModel.sync();

export default {
    Conn: connection,
    UserModel: userModel
};
