import JOI from 'joi';

const InvalidBodyError = Error('Body was not valid');
InvalidBodyError.name = 'InvalidBodyError';

/** Validate function */
export const validate = async (schema: JOI.ObjectSchema, compare: any) => {
    return schema
        .validateAsync(compare)
        .then((_) => {
            return compare;
        })
        .catch((_) => {
            throw InvalidBodyError;
        });
};

/** User Schemas */
export const CreateUserSchema = JOI.object().keys({
    firstName: JOI.string().alphanum().required(),
    lastName: JOI.string().alphanum().required(),
    email: JOI.string().required(),
    password: JOI.string().min(3).max(200).required(),
    gradeLevel: JOI.string().required()
});

export const LoginUserSchema = JOI.object().keys({
    premail: JOI.string().alphanum().required(),
    password: JOI.string().required()
});

export const FindUserSchema = JOI.object().keys({
    premail: JOI.string().alphanum().required()
});

export const UpdateUserSchema = JOI.object().keys({
    premail: JOI.string().required(),
    firstName: JOI.string().alphanum(),
    lastName: JOI.string().alphanum(),
    gradeLevel: JOI.string(),
    paidDues: JOI.boolean()
});

export const UpdateTokenSchema = JOI.object().keys({
    premail: JOI.string().required(),
    refreshToken: JOI.string().required()
});

/** Trip Schemas */
export const CreateTripSchema = JOI.object().keys({
    location: JOI.string().required(),
    mountain: JOI.string().required(),
    description: JOI.string().required(),
    startDate: JOI.date().required(),
    endDate: JOI.date().required(),
    travelMethod: JOI.string().alphanum().required(),
    lodgingMethod: JOI.string().alphanum().required(),
    capacity: JOI.number()
});

export const UpdateTripSchema = JOI.object().keys({
    location: JOI.string(),
    mountain: JOI.string(),
    description: JOI.string(),
    startDate: JOI.date(),
    endDate: JOI.date(),
    travelMethod: JOI.string().alphanum(),
    lodgingMethod: JOI.string().alphanum(),
    capacity: JOI.number()
});

/** Announcement Schemas */
export const CreateAnnounceBody = JOI.object().keys({
    title: JOI.string().required(),
    description: JOI.string().required(),
    notify: JOI.boolean().required()
});
