"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripById = exports.createTrip = exports.getAllTrips = void 0;
const connection_1 = __importDefault(require("../database/connection"));
const lodash_1 = __importDefault(require("lodash"));
/* Helper Functions -- In alphabetical order by name */
const debugErrors = (err, overrideError) => {
    console.log('\n\n\nSome errors have occured. Their information is below:');
    console.log('\nName: ' + err.name + '\nErrors:');
    console.log(err);
    console.log('\n\n');
    throw overrideError || err;
};
/* Functions called with routes -- In order that corresponding routes occur */
const getAllTrips = async () => {
    return connection_1.default.TripModel.findAll()
        .then((response) => response)
        .catch((err) => debugErrors(err));
};
exports.getAllTrips = getAllTrips;
const createTrip = async (body, drops) => {
    return connection_1.default.TripModel.create({
        location: body.location,
        mountain: body.mountain,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        travelMethod: body.travelMethod,
        lodgingMethod: body.lodgingMethod,
        capacity: body.capacity
    })
        .then((response) => {
        const dataValues = response.dataValues;
        return lodash_1.default.omit(dataValues, drops);
    })
        .catch((err) => debugErrors(err));
};
exports.createTrip = createTrip;
const getTripById = async (id, drops) => {
    return connection_1.default.TripModel.findOne({
        where: { id: id },
        attributes: { exclude: drops }
    })
        .then((response) => response.dataValues)
        .catch((err) => debugErrors(err));
};
exports.getTripById = getTripById;
