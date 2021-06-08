"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (connection) => {
    return connection.define('Announcement', {
        title: {
            type: sequelize_1.DataTypes.STRING(60),
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        notify: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false
        }
    });
};
