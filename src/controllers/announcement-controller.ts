import * as ATypes from './announcement-controller-types';
import * as Valid from '../database/validators';
import db from '../database/connection';
import Lodash from 'lodash';

const debugErrors = (err: any, overrideError?: Error) => {
    console.log('\n\n\nSome errors have occured. Their information is below:');
    console.log('\nName: ' + err.name + '\nErrors:');
    console.log(err);
    console.log('\n\n');
    throw overrideError || err;
};

export const getAll = async (drops: string[]) => {
    return db.AnnounceModel.findAll({
        attributes: { exclude: drops }
    })
        .then((response: any) => response)
        .catch((err) => debugErrors(err));
};

export const createAnnounce = async (body: ATypes.CreateAnnounceBody, drops: string[]) => {
    const vbody = await Valid.validate(Valid.CreateAnnounceBody, body);
    return db.AnnounceModel.create({
        title: vbody.title,
        description: vbody.description,
        notify: vbody.notify
    })
        .then((response: any) => {
            const dataValues = response.dataValues;
            return Lodash.omit(dataValues, drops);
        })
        .catch((err) => debugErrors(err));
};

export const getAnnounceById = async (id: number, drops: string[]) => {
    return db.AnnounceModel.findOne({
        where: { id: id },
        attributes: { exclude: drops }
    })
        .then((response: any) => response.dataValues)
        .catch((err) => debugErrors(err));
};
