import { Sequelize, DataTypes as dt } from 'sequelize';

export default (connection: Sequelize) => {
    return connection.define('Announcement', {
        title: {
            type: dt.STRING(60),
            allowNull: false
        },
        description: {
            type: dt.TEXT,
            allowNull: false
        },
        notify: {
            type: dt.BOOLEAN,
            allowNull: false
        }
    });
};
