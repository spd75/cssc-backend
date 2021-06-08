"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
/** Initialization of Union table between users and trips */
exports.default = (connection) => {
    return connection.define('User_Trip', {
        paid: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false
        }
    });
};
