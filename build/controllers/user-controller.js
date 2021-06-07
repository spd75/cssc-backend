"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefreshToken = exports.update = exports.getUserByPremail = exports.login = exports.createUser = exports.getAllUsers = void 0;
const UCTypes = __importStar(require("./user-controller-types"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = __importDefault(require("../database/connection"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const lodash_1 = __importDefault(require("lodash"));
const path_1 = require("path");
const js_sha256_1 = __importDefault(require("js-sha256"));
/* Config environment */
dotenv_1.default.config({ path: path_1.resolve(__dirname, '../.env') });
/* Helper Functions -- In alphabetical order by name */
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
                throw UCTypes.PromiseSeriesFailed;
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
        const isAuth = type === UCTypes.TokenType.Auth;
        const secret = isAuth ? process.env.AUTH_TS : process.env.REF_TS;
        const expireTime = isAuth ? process.env.AT_EXPIRE : process.env.RT_EXPIRE;
        const info = { premail: userInfo.premail, gradeLevel: userInfo.gradeLevel };
        const token = jsonwebtoken_1.default.sign(info, secret, { expiresIn: expireTime });
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
            throw UCTypes.InvalidTokenError;
        }
        const newAuthToken = genToken(user, UCTypes.TokenType.Auth);
        const newRefreshToken = genToken(user, UCTypes.TokenType.Refresh);
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
const updateModel = async (model, updateFields) => {
    await model.update(updateFields);
    await model.save();
};
const validateAuthToken = (tokenStr) => {
    try {
        const rawToken = tokenStr.split(' ')[1];
        const user = jsonwebtoken_1.default.verify(rawToken, process.env.AUTH_TS);
        return user.premail;
    }
    catch (err) {
        debugErrors(err, UCTypes.InvalidTokenError);
        return '';
    }
};
const validatePassword = (user, password) => {
    const preHashedPassword = hashSHA256(password);
    return bcrypt_1.default.compare(preHashedPassword, user.password);
};
/* Functions called with routes -- In order that corresponding routes occur */
const getAllUsers = async () => {
    return connection_1.default.UserModel.findAll()
        .then((response) => response)
        .catch((err) => debugErrors(err));
};
exports.getAllUsers = getAllUsers;
const createUser = async (body, drops) => {
    const premail = genPremail(body.email);
    const userInfo = {
        premail: premail,
        gradeLevel: body.gradeLevel
    };
    const authToken = genToken(userInfo, UCTypes.TokenType.Auth);
    const refreshToken = genToken(userInfo, UCTypes.TokenType.Refresh);
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
const login = async (body, drops) => {
    return connection_1.default.UserModel.findOne({
        where: { premail: body.premail }
    })
        .then(async (response) => {
        const user = response.dataValues;
        return validatePassword(user, body.password)
            .then(async (result) => {
            if (!result) {
                throw UCTypes.UserAuthenticationFailed;
            }
            const newAuthToken = genToken(user, UCTypes.TokenType.Auth);
            const newRefreshToken = genToken(user, UCTypes.TokenType.Refresh);
            const hashedRefreshToken = await hashToken(newRefreshToken);
            await updateModel(response, { refreshToken: hashedRefreshToken });
            const refinedUser = lodash_1.default.omit(user, drops);
            return {
                ...refinedUser,
                refreshToken: newRefreshToken,
                authToken: newAuthToken
            };
        })
            .catch((err) => debugErrors(err));
    })
        .catch((err) => debugErrors(err));
};
exports.login = login;
const getUserByPremail = async (token, body, drops) => {
    const premail = validateAuthToken(token);
    if (premail !== body.premail) {
        throw UCTypes.InvalidTokenError;
    }
    return connection_1.default.UserModel.findOne({
        where: { premail: premail },
        attributes: { exclude: drops }
    })
        .then((result) => result.dataValues)
        .catch((err) => debugErrors(err));
};
exports.getUserByPremail = getUserByPremail;
const update = async (token, body, drops) => {
    const premail = validateAuthToken(token);
    if (premail !== body.premail) {
        throw UCTypes.InvalidTokenError;
    }
    await connection_1.default.UserModel.update({
        firstName: body.firstName,
        lastName: body.lastName,
        gradeLevel: body.gradeLevel,
        paidDues: body.paidDues
    }, { where: { premail: body.premail } });
    return exports.getUserByPremail(token, { premail: body.premail }, drops);
};
exports.update = update;
const updateRefreshToken = async (body, drops) => {
    return connection_1.default.UserModel.findOne({
        where: { premail: body.premail },
        attributes: { exclude: drops }
    })
        .then(async (result) => {
        const { newAuthToken, newRefreshToken, hashedRefreshToken } = await refreshAuthToken(body.refreshToken, result.dataValues);
        await updateModel(result, { refreshToken: hashedRefreshToken });
        return { refreshToken: newRefreshToken, authToken: newAuthToken };
    })
        .catch((err) => debugErrors(err));
};
exports.updateRefreshToken = updateRefreshToken;
