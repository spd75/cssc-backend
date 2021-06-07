import db from '../database/connection';
import Lodash from 'lodash';

/* Types */
type CreateTripBody = {
    location: string;
    mountain: string;
    description: string;
    startDate: Date;
    endDate: Date;
    travelMethod: string;
    lodgingMethod: string;
    capacity?: number;
};

type UpdateTripBody = {
    location?: string;
    mountain?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    travelMethod?: string;
    lodgingMethod?: string;
    capacity?: number;
};

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

export const createTrip = async (body: CreateTripBody, drops: string[]) => {
    return db.TripModel.create({
        location: body.location,
        mountain: body.mountain,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        travelMethod: body.travelMethod,
        lodgingMethod: body.lodgingMethod,
        capacity: body.capacity
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

export const updateTrip = async (id: number, body: UpdateTripBody, drops: string[]) => {
    await db.TripModel.update(
        {
            location: body.location,
            mountain: body.mountain,
            description: body.description,
            startDate: body.startDate,
            endDate: body.endDate,
            travelMethod: body.travelMethod,
            lodgingMethod: body.lodgingMethod,
            capacity: body.capacity
        },
        { where: { id: id } }
    );

    return getTripById(id, drops);
};
