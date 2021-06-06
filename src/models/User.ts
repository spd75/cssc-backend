import { Sequelize, DataTypes as dt } from 'sequelize';

const cornellEmailExp = new RegExp('[A-Za-z0-9]@cornell.edu');
const gradeLevelExp = new RegExp('FROSH|SOPH|JUN|SEN|GRAD|ALUM');

/** Initialization of User model */
export default (connection: Sequelize) => {
    return connection.define('User', {
        firstName: {
            type: dt.STRING(40),
            allowNull: false
        },
        lastName: {
            type: dt.STRING(40),
            allowNull: false
        },
        premail: {
            type: dt.STRING(12),
            unique: true,
            allowNull: false,
            validate: {
                isAlphanumeric: true
            }
        },
        email: {
            type: dt.STRING(40),
            unique: true,
            allowNull: false,
            validate: {
                is: cornellEmailExp
            }
        },
        password: {
            type: dt.STRING(200),
            allowNull: false
        },
        gradeLevel: {
            type: dt.STRING(10),
            allowNull: false,
            validate: {
                is: gradeLevelExp,
                isUppercase: true
            }
        },
        paidDues: {
            type: dt.BOOLEAN,
            allowNull: false
        },
        refreshToken: {
            type: dt.TEXT,
            allowNull: false
        }
    });
};
