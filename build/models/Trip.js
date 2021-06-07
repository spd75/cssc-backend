"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const travelMethodExp = new RegExp('FINDRIDE|BUS|AIRPLANE|MIXED');
const lodgingMethodExp = new RegExp('FINDLODGE|HOTEL|SKILODGE|AIRBNB|HOUSE');
/** Initialization of Trips model */
exports.default = (connection) => {
    return connection.define('Trip', {
        location: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false
        },
        mountain: {
            type: sequelize_1.DataTypes.STRING(25),
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        travelMethod: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: travelMethodExp
            }
        },
        lodgingMethod: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: lodgingMethodExp
            }
        },
        capacity: {
            type: sequelize_1.DataTypes.INTEGER
        }
    });
};
