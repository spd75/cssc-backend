"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failure = exports.success = void 0;
const success = (res, data) => {
    res.status(200).json(data);
};
exports.success = success;
const failure = (res, errorMsg, errorCode) => {
    res.status(errorCode).json({ error: errorMsg });
};
exports.failure = failure;
