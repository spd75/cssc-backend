import { Sequelize, DataTypes as dt } from 'sequelize';

const travelMethodExp = new RegExp('FINDRIDE|BUS|AIRPLANE|MIXED');
const lodgingMethodExp = new RegExp('FINDLODGE|HOTEL|SKILODGE|AIRBNB|HOUSE');

/** Initialization of Trips model */
export default (connection: Sequelize) => {
    return connection.define('Trip', {
        location: {
            type: dt.STRING(50),
            allowNull: false
        },
        mountain: {
            type: dt.STRING(25),
            allowNull: false
        },
        description: {
            type: dt.TEXT,
            allowNull: false
        },
        startDate: {
            type: dt.DATE,
            allowNull: false
        },
        endDate: {
            type: dt.DATE,
            allowNull: false
        },
        travelMethod: {
            type: dt.STRING(10),
            allowNull: false,
            validate: {
                is: travelMethodExp
            }
        },
        lodgingMethod: {
            type: dt.STRING(10),
            allowNull: false,
            validate: {
                is: lodgingMethodExp
            }
        },
        capacity: {
            type: dt.INTEGER
        }
    });
};
