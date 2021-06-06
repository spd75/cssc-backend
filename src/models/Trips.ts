import { Sequelize, DataTypes } from 'sequelize';

const travelMethodExp = new RegExp('FINDRIDE|BUS|AIRPLANE|MIXED');
const lodgingMethodExp = new RegExp('FINDLODGE|HOTEL|SKILODGE|AIRBNB|HOUSE');

/** Initialization of Trips model */
export default (connection: Sequelize) => {
    return connection.define('Trip', {
        location: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        mountain: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        travelMethod: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: travelMethodExp
            }
        },
        lodgingMethod: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: lodgingMethodExp
            }
        },
        capacity: {
            type: DataTypes.NUMBER
        }
    });
};
