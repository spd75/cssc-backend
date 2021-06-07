import { Sequelize, DataTypes as dt } from 'sequelize';

/** Initialization of Union table between users and trips */
export default (connection: Sequelize) => {
    return connection.define('User_Trip', {
        paid: {
            type: dt.BOOLEAN,
            allowNull: false
        }
    });
};
