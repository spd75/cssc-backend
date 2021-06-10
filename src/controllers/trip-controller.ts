import * as TCTypes from './trip-controller-types';
import * as Valid from '../database/validators';
import db from '../database/connection';
import Lodash from 'lodash';

/* Helper Functions -- In alphabetical order by name */
const debugErrors = (err: any, overrideError?: Error) => {
    console.log('\n\n\nSome errors have occured. Their information is below:');
    console.log('\nName: ' + err.name + '\nErrors:');
    console.log(err);
    console.log('\n\n');
    throw overrideError || err;
};

/* Functions called with routes -- In order that corresponding routes occur */
export const getAllTrips = async () => {
    return db.TripModel.findAll({ include: db.UserModel })
        .then((response) => response)
        .catch((err) => debugErrors(err));
};

export const createTrip = async (body: TCTypes.CreateTripBody, drops: string[]) => {
    console.log('got here');
    const vbody = await Valid.validate(Valid.CreateTripSchema, body);
    console.log('didnt get here');
    return db.TripModel.create({
        location: vbody.location,
        mountain: vbody.mountain,
        description: vbody.description,
        startDate: vbody.startDate,
        endDate: vbody.endDate,
        travelMethod: vbody.travelMethod,
        lodgingMethod: vbody.lodgingMethod,
        capacity: vbody.capacity
    })
        .then((response: any) => {
            const dataValues = response.dataValues;
            return Lodash.omit(dataValues, drops);
        })
        .catch((err) => debugErrors(err));
};

export const getTripById = async (id: number, drops: string[]) => {
    return db.TripModel.findOne({
        where: { id: id },
        include: db.UserModel,
        attributes: { exclude: drops }
    })
        .then((response: any) => response.dataValues)
        .catch((err) => debugErrors(err));
};

export const updateTrip = async (id: number, body: TCTypes.UpdateTripBody, drops: string[]) => {
    const vbody = await Valid.validate(Valid.UpdateTripSchema, body);
    await db.TripModel.update(
        {
            location: vbody.location,
            mountain: vbody.mountain,
            description: vbody.description,
            startDate: vbody.startDate,
            endDate: vbody.endDate,
            travelMethod: vbody.travelMethod,
            lodgingMethod: vbody.lodgingMethod,
            capacity: vbody.capacity
        },
        { where: { id: id } }
    );

    return getTripById(id, drops);
};
