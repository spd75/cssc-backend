import Bcrypt from 'bcrypt';
import db from '../database/connection';
import Dotenv from 'dotenv';
import JWT, { Secret } from 'jsonwebtoken';
import Lodash from 'lodash';
import { resolve } from 'path';
import SHA from 'js-sha256';

/* Config environment */
Dotenv.config({ path: resolve(__dirname, '../.env') });

/* Errors */
const InvalidTokenError = new Error('Invalid token provided.');
InvalidTokenError.name = 'InvalidTokenError';

const PromiseSeriesFailed = new Error('A series of promises failed.');
PromiseSeriesFailed.name = 'PromiseSeriesFailed';

const UserAuthenticationFailed = new Error('User authentication failed.');
UserAuthenticationFailed.name = 'UserAuthenticationFailed';

const UserNotFound = new Error('User not found.');
UserNotFound.name = 'UserNotFoun';

/* Helper types */
type AuthUserInfo = {
    premail: string;
    gradeLevel: string;
};

type CheckTokenBody = {
    premail: string;
};

type UpdateTokenBody = {
    premail: string;
    refreshToken: string;
};

type CreateUserBody = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gradeLevel: string;
};

type LoginBody = {
    premail: string;
    password: string;
};

type User = {
    firstName: string;
    lastName: string;
    premail: string;
    email: string;
    password: string;
    gradeLevel: string;
    paidDues: boolean;
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
};

enum TokenType {
    Auth,
    Refresh
}

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
                throw PromiseSeriesFailed;
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

const genToken = (userInfo: AuthUserInfo, type: TokenType) => {
    try {
        const isAuth = type === TokenType.Auth;
        const secret = isAuth ? process.env.AUTH_TS : process.env.REF_TS;
        const expireTime = isAuth ? process.env.AT_EXPIRE : process.env.RT_EXPIRE;
        const token = JWT.sign(userInfo, secret as Secret, { expiresIn: expireTime });
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

const refreshAuthToken = async (refreshToken: string, user: User) => {
    const preHashedToken = hashSHA256(refreshToken);
    return Bcrypt.compare(preHashedToken, user.refreshToken)
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

const securePassword = async (password: string) => {
    const preHashedPassword = hashSHA256(password);
    return Bcrypt.hash(preHashedPassword, 10)
        .then((result) => result)
        .catch((err) => debugErrors(err));
};

const validateAuthToken = (tokenStr: string) => {
    try {
        const rawToken = tokenStr.split(' ')[1];
        const user = JWT.verify(rawToken, process.env.AUTH_TS as Secret) as AuthUserInfo;
        return user.premail;
    } catch (err) {
        debugErrors(err, InvalidTokenError);
        return '';
    }
};

const validatePassword = (user: User, password: string) => {
    const preHashedPassword = hashSHA256(password);
    return Bcrypt.compare(preHashedPassword, user.password);
};

/* Functions called with routes */
export const getAllUsers = async () => {
    return db.UserModel.findAll()
        .then((response) => response)
        .catch((err) => debugErrors(err));
};

export const login = async (body: LoginBody, drops: string[]) => {
    return db.UserModel.findOne({
        where: { premail: body.premail },
        attributes: { exclude: drops }
    })
        .then(async (response: any) => {
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

export const checkValidToken = async (token: string, body: CheckTokenBody, drops: string[]) => {
    const premail = validateAuthToken(token);
    if (premail !== body.premail) {
        throw InvalidTokenError;
    }
    return db.UserModel.findOne({
        where: { premail: premail },
        attributes: { exclude: drops }
    })
        .then((result: any) => result.dataValues)
        .catch((err) => debugErrors(err));
};

export const updateRefreshToken = async (body: UpdateTokenBody, drops: string[]) => {
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

            return { authToken: newAuthToken, refreshToken: newRefreshToken };
        })
        .catch((err) => debugErrors(err));
};

export const createUser = async (body: CreateUserBody, drops: string[]) => {
    const premail = genPremail(body.email);
    const userInfo = {
        premail: premail,
        gradeLevel: body.gradeLevel
    };
    const authToken = genToken(userInfo, TokenType.Auth);
    const refreshToken = genToken(userInfo, TokenType.Refresh);
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
