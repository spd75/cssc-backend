import { Response } from 'express';

export const success = (res: Response, data: object) => {
    res.status(200).json(data);
};

export const failure = (res: Response, errorMsg: string, errorCode: number) => {
    res.status(errorCode).json({ error: errorMsg });
};
