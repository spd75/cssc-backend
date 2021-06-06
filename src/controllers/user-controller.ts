import * as UCTypes from './user-controller-types';
import Bcrypt from 'bcrypt';
import db from '../database/connection';
import Dotenv from 'dotenv';
import JWT, { Secret } from 'jsonwebtoken';
import Lodash from 'lodash';
import { resolve } from 'path';
import SHA from 'js-sha256';

/* Config environment */
Dotenv.config({ path: resolve(__dirname, '../.env') });

/* Helper Functions */
const debugErrors = (err: any, overrideError?: Error) => {
    console.log('\n\n\nSome errors have occured. Their information is below:');
    console.log('\nName: ' + err.name + '\nErrors:');
    console.log(err);
    console.log('\n\n');
    throw overrideError || err;
};

const handleParallelPromises = async (promises: Promise<any>[]) => {
    return Promise.allSettled(promises).then((results) => {
        return results.map((result) => {
            try {
                return (result as PromiseFulfilledResult<any>).value;
            } catch (err) {
                throw UCTypes.PromiseSeriesFailed;
            }
        });
    });
};

const hashSHA256 = (toHash: string) => {
    const hash = SHA.sha256.create();
    hash.update(toHash);
    return hash.hex();
};

const genPremail = (email: string) => {
    return email.split('@')[0];
};

const genToken = (userInfo: any, type: UCTypes.TokenType) => {
    try {
        const isAuth = type === UCTypes.TokenType.Auth;
        const secret = isAuth ? process.env.AUTH_TS : process.env.REF_TS;
        const expireTime = isAuth ? process.env.AT_EXPIRE : process.env.RT_EXPIRE;
        const info = { premail: userInfo.premail, gradeLevel: userInfo.gradeLevel };
        const token = JWT.sign(info, secret as Secret, { expiresIn: expireTime });
        return token;
    } catch (err) {
        debugErrors(err);
        return '';
    }
};

const hashToken = async (token: string) => {
    const preHashedToken = hashSHA256(token);
    const hashTimes = +(process.env.HASH_TIMES || 10);
    return Bcrypt.hash(preHashedToken, hashTimes)
        .then((result) => result)
        .catch((err) => debugErrors(err));
};

const refreshAuthToken = async (refreshToken: string, user: UCTypes.User) => {
    const preHashedToken = hashSHA256(refreshToken);
    return Bcrypt.compare(preHashedToken, user.refreshToken)
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

const securePassword = async (password: string) => {
    const preHashedPassword = hashSHA256(password);
    return Bcrypt.hash(preHashedPassword, 10)
        .then((result) => result)
        .catch((err) => debugErrors(err));
};

const updateModel = async (model: any, updateFields: object) => {
    await model.update(updateFields);
    await model.save();
};

const validateAuthToken = (tokenStr: string) => {
    try {
        const rawToken = tokenStr.split(' ')[1];
        const user = JWT.verify(rawToken, process.env.AUTH_TS as Secret) as UCTypes.AuthUserInfo;
        return user.premail;
    } catch (err) {
        debugErrors(err, UCTypes.InvalidTokenError);
        return '';
    }
};

const validatePassword = (user: UCTypes.User, password: string) => {
    const preHashedPassword = hashSHA256(password);
    return Bcrypt.compare(preHashedPassword, user.password);
};

/* Functions called with routes */
export const getAllUsers = async () => {
    return db.UserModel.findAll()
        .then((response) => response)
        .catch((err) => debugErrors(err));
};

export const login = async (body: UCTypes.LoginBody, drops: string[]) => {
    return db.UserModel.findOne({
        where: { premail: body.premail }
    })
        .then(async (response: any) => {
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
                    const refinedUser = Lodash.omit(user, drops);
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

export const checkValidToken = async (
    token: string,
    body: UCTypes.CheckTokenBody,
    drops: string[]
) => {
    const premail = validateAuthToken(token);
    if (premail !== body.premail) {
        throw UCTypes.InvalidTokenError;
    }
    return db.UserModel.findOne({
        where: { premail: premail },
        attributes: { exclude: drops }
    })
        .then((result: any) => result.dataValues)
        .catch((err) => debugErrors(err));
};

export const updateRefreshToken = async (body: UCTypes.UpdateTokenBody, drops: string[]) => {
    return db.UserModel.findOne({
        where: { premail: body.premail },
        attributes: { exclude: drops }
    })
        .then(async (result: any) => {
            const { newAuthToken, newRefreshToken, hashedRefreshToken } = await refreshAuthToken(
                body.refreshToken,
                result.dataValues
            );
            await result.update({
                refreshToken: hashedRefreshToken
            });
            await result.save();

            return { refreshToken: newRefreshToken, authToken: newAuthToken };
        })
        .catch((err) => debugErrors(err));
};

export const createUser = async (body: UCTypes.CreateUserBody, drops: string[]) => {
    const premail = genPremail(body.email);
    const userInfo = {
        premail: premail,
        gradeLevel: body.gradeLevel
    };
    const authToken = genToken(userInfo, UCTypes.TokenType.Auth);
    const refreshToken = genToken(userInfo, UCTypes.TokenType.Refresh);
    const promises = [securePassword(body.password), hashToken(refreshToken)];
    const resolved = (await handleParallelPromises(promises)) as string[];

    return db.UserModel.create({
        firstName: body.firstName,
        lastName: body.lastName,
        premail: premail,
        email: body.email,
        password: resolved[0],
        gradeLevel: body.gradeLevel,
        paidDues: false,
        refreshToken: resolved[1]
    })
        .then((response: any) => {
            const dataValues = { ...response.dataValues, authToken: authToken };
            dataValues.refreshToken = refreshToken;
            return Lodash.omit(dataValues, drops);
        })
        .catch((err) => debugErrors(err));
};
