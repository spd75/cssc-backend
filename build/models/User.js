"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cornellEmailExp = new RegExp('[A-Za-z0-9]@cornell.edu');
const gradeLevelExp = new RegExp('FROSH|SOPH|JUN|SEN|GRAD|ALUM');
/** Initialization of User model */
exports.default = (connection) => {
    return connection.define('User', {
        firstName: {
            type: sequelize_1.DataTypes.STRING(40),
            allowNull: false
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING(40),
            allowNull: false
        },
        premail: {
            type: sequelize_1.DataTypes.STRING(12),
            unique: true,
            allowNull: false,
            validate: {
                isAlphanumeric: true
            }
        },
        email: {
            type: sequelize_1.DataTypes.STRING(40),
            unique: true,
            allowNull: false,
            validate: {
                is: cornellEmailExp
            }
        },
        password: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false
        },
        gradeLevel: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: gradeLevelExp,
                isUppercase: true
            }
        },
        paidDues: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false
        },
        refreshToken: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        }
    });
};
