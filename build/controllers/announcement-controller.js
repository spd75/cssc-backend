"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnounceById = exports.createAnnounce = exports.getAll = void 0;
const connection_1 = __importDefault(require("../database/connection"));
const lodash_1 = __importDefault(require("lodash"));
const debugErrors = (err, overrideError) => {
    console.log('\n\n\nSome errors have occured. Their information is below:');
    console.log('\nName: ' + err.name + '\nErrors:');
    console.log(err);
    console.log('\n\n');
    throw overrideError || err;
};
const getAll = async (drops) => {
    return connection_1.default.AnnounceModel.findAll({
        attributes: { exclude: drops }
    })
        .then((response) => response)
        .catch((err) => debugErrors(err));
};
exports.getAll = getAll;
const createAnnounce = async (body, drops) => {
    return connection_1.default.AnnounceModel.create({
        title: body.title,
        description: body.description,
        notify: body.notify
    })
        .then((response) => {
        const dataValues = response.dataValues;
        return lodash_1.default.omit(dataValues, drops);
    })
        .catch((err) => debugErrors(err));
};
exports.createAnnounce = createAnnounce;
const getAnnounceById = async (id, drops) => {
    return connection_1.default.AnnounceModel.findOne({
        where: { id: id },
        attributes: { exclude: drops }
    })
        .then((response) => response.dataValues)
        .catch((err) => debugErrors(err));
};
exports.getAnnounceById = getAnnounceById;
