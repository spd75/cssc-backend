import JOI from 'joi';

/** Validate function */
export const validate = async (schema: JOI.ObjectSchema, compare: object) => {
    return schema
        .validateAsync(compare)
        .then((_) => {
            return compare;
        })
        .catch((_) => {
            throw Error('Compare does not match schema.');
        });
};

/** User Schemas */

export const createUserSchema = JOI.object().keys({
    firstName: JOI.string().alphanum().required(),
    lastName: JOI.string().alphanum().required(),
    email: JOI.string().required(),
    password: JOI.string().min(3).max(200).required(),
    gradeLevel: JOI.string().required()
});

export const loginUserSchema = JOI.object().keys({
    premail: JOI.string().alphanum().required(),
    password: JOI.string().required()
});

export const findUserSchema = JOI.object().keys({
    premail: JOI.string().alphanum().required()
});

export const updateUserSchema = JOI.object().keys({
    premail: JOI.string().required(),
    firstName: JOI.string().alphanum(),
    lastName: JOI.string().alphanum(),
    gradeLevel: JOI.string(),
    paidDues: JOI.boolean()
});

export const updateTokenSchema = JOI.object().keys({
    premail: JOI.string().required(),
    refreshToken: JOI.string().required()
});
