import dotenv from 'dotenv';
import { resolve } from 'path';
import { Sequelize } from 'sequelize';

/* Model Imports */
import Announce from '../models/Announcement';
import User from '../models/User';
import User_Trip from '../models/User-Trip';
import Trip from '../models/Trip';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export const connection = new Sequelize('cssc', 'root', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const userModel = User(connection);
userModel.sync();

const tripModel = Trip(connection);
tripModel.sync();

const userTripRelation = User_Trip(connection);
userModel.belongsToMany(tripModel, { through: userTripRelation });
tripModel.belongsToMany(userModel, { through: userTripRelation });
userTripRelation.sync();

const announceModel = Announce(connection);
announceModel.sync();

export default {
    Conn: connection,
    UserModel: userModel,
    TripModel: tripModel,
    UserTripRelation: userTripRelation,
    AnnounceModel: announceModel
};
