"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.updateRefreshToken = exports.checkValidToken = exports.login = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = __importDefault(require("../database/connection"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const lodash_1 = __importDefault(require("lodash"));
const path_1 = require("path");
const js_sha256_1 = __importDefault(require("js-sha256"));
/* Config environment */
dotenv_1.default.config({ path: path_1.resolve(__dirname, '../.env') });
/* Errors */
const InvalidTokenError = new Error('Invalid token provided.');
InvalidTokenError.name = 'InvalidTokenError';
const PromiseSeriesFailed = new Error('A series of promises failed.');
PromiseSeriesFailed.name = 'PromiseSeriesFailed';
const UserAuthenticationFailed = new Error('User authentication failed.');
UserAuthenticationFailed.name = 'UserAuthenticationFailed';
const UserNotFound = new Error('User not found.');
UserNotFound.name = 'UserNotFound';
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Auth"] = 0] = "Auth";
    TokenType[TokenType["Refresh"] = 1] = "Refresh";
})(TokenType || (TokenType = {}));
/* Helper Functions */
const debugErrors = (err, overrideError) => {
    console.log('\n\n\nSome errors have occured. Their information is below:');
    console.log('\nName: ' + err.name + '\nErrors:');
    console.log(err);
    console.log('\n\n');
    throw overrideError || err;
};
const handleParallelPromises = async (promises) => {
    return Promise.allSettled(promises).then((results) => {
        return results.map((result) => {
            try {
                return result.value;
            }
            catch (err) {
                throw PromiseSeriesFailed;
            }
        });
    });
};
const hashSHA256 = (toHash) => {
    const hash = js_sha256_1.default.sha256.create();
    hash.update(toHash);
    return hash.hex();
};
const genPremail = (email) => {
    return email.split('@')[0];
};
const genToken = (userInfo, type) => {
    try {
        const isAuth = type === TokenType.Auth;
        const secret = isAuth ? process.env.AUTH_TS : process.env.REF_TS;
        const expireTime = isAuth ? process.env.AT_EXPIRE : process.env.RT_EXPIRE;
        const token = jsonwebtoken_1.default.sign(userInfo, secret, { expiresIn: expireTime });
        return token;
    }
    catch (err) {
        debugErrors(err);
        return '';
    }
};
const hashToken = async (token) => {
    const preHashedToken = hashSHA256(token);
    const hashTimes = +(process.env.HASH_TIMES || 10);
    return bcrypt_1.default.hash(preHashedToken, hashTimes)
        .then((result) => result)
        .catch((err) => debugErrors(err));
};
const refreshAuthToken = async (refreshToken, user) => {
    const preHashedToken = hashSHA256(refreshToken);
    return bcrypt_1.default.compare(preHashedToken, user.refreshToken)
        .then(async (result) => {
        if (!result) {
            throw InvalidTokenError;
        }
        const userInfo = { premail: user.premail, gradeLevel: user.gradeLevel };
        const newAuthToken = genToken(userInfo, TokenType.Auth);
        const newRefreshToken = genToken(userInfo, TokenType.Refresh);
        const hashedRefreshToken = await hashToken(newRefreshToken);
        return { newAuthToken, newRefreshToken, hashedRefreshToken };
    })
        .catch((err) => debugErrors(err));
};
const securePassword = async (password) => {
    const preHashedPassword = hashSHA256(password);
    return bcrypt_1.default.hash(preHashedPassword, 10)
        .then((result) => result)
        .catch((err) => debugErrors(err));
};
const validateAuthToken = (tokenStr) => {
    try {
        const rawToken = tokenStr.split(' ')[1];
        const user = jsonwebtoken_1.default.verify(rawToken, process.env.AUTH_TS);
        return user.premail;
    }
    catch (err) {
        debugErrors(err, InvalidTokenError);
        return '';
    }
};
const validatePassword = (user, password) => {
    const preHashedPassword = hashSHA256(password);
    return bcrypt_1.default.compare(preHashedPassword, user.password);
};
/* Functions called with routes */
const getAllUsers = async () => {
    return connection_1.default.UserModel.findAll()
        .then((response) => response)
        .catch((err) => debugErrors(err));
};
exports.getAllUsers = getAllUsers;
const login = async (body, drops) => {
    return connection_1.default.UserModel.findOne({
        where: { premail: body.premail },
        attributes: { exclude: drops }
    })
        .then(async (response) => {
        const user = response.dataValues;
        return validatePassword(user, body.password)
            .then((result) => {
            if (!result) {
                throw UserAuthenticationFailed;
            }
            return user;
        })
            .catch((err) => debugErrors(err));
    })
        .catch((err) => debugErrors(err));
};
exports.login = login;
const checkValidToken = async (token, body, drops) => {
    const premail = validateAuthToken(token);
    if (premail !== body.premail) {
        throw InvalidTokenError;
    }
    return connection_1.default.UserModel.findOne({
        where: { premail: premail },
        attributes: { exclude: drops }
    })
        .then((result) => result.dataValues)
        .catch((err) => debugErrors(err));
};
exports.checkValidToken = checkValidToken;
const updateRefreshToken = async (body, drops) => {
    return connection_1.default.UserModel.findOne({
        where: { premail: body.premail },
        attributes: { exclude: drops }
    })
        .then(async (result) => {
        const { newAuthToken, newRefreshToken, hashedRefreshToken } = await refreshAuthToken(body.refreshToken, result.dataValues);
        await result.update({
            refreshToken: hashedRefreshToken
        });
        await result.save();
        return { authToken: newAuthToken, refreshToken: newRefreshToken };
    })
        .catch((err) => debugErrors(err));
};
exports.updateRefreshToken = updateRefreshToken;
const createUser = async (body, drops) => {
    const premail = genPremail(body.email);
    const userInfo = {
        premail: premail,
        gradeLevel: body.gradeLevel
    };
    const authToken = genToken(userInfo, TokenType.Auth);
    const refreshToken = genToken(userInfo, TokenType.Refresh);
    const promises = [securePassword(body.password), hashToken(refreshToken)];
    const resolved = (await handleParallelPromises(promises));
    return connection_1.default.UserModel.create({
        firstName: body.firstName,
        lastName: body.lastName,
        premail: premail,
        email: body.email,
        password: resolved[0],
        gradeLevel: body.gradeLevel,
        paidDues: false,
        refreshToken: resolved[1]
    })
        .then((response) => {
        const dataValues = { ...response.dataValues, authToken: authToken };
        dataValues.refreshToken = refreshToken;
        return lodash_1.default.omit(dataValues, drops);
    })
        .catch((err) => debugErrors(err));
};
exports.createUser = createUser;
