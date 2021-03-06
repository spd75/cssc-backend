"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TripController = __importStar(require("../controllers/trip-controller"));
const response_1 = require("./response");
const express_1 = require("express");
const router = express_1.Router();
const commonDrops = ['createdAt', 'updatedAt'];
router.get('/', (req, res) => {
    TripController.getAllTrips()
        .then((trips) => response_1.success(res, trips))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.post('/create', (req, res) => {
    TripController.createTrip(req.body, commonDrops)
        .then((newTrip) => response_1.success(res, newTrip))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.get('/:id', (req, res) => {
    const id = +req.params.id;
    TripController.getTripById(id, commonDrops)
        .then((trip) => response_1.success(res, trip))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.post('/update/:id', (req, res) => {
    const id = +req.params.id;
    TripController.updateTrip(id, req.body, commonDrops)
        .then((updatedTrip) => response_1.success(res, updatedTrip))
        .catch((err) => response_1.failure(res, err.name, 400));
});
exports.default = router;
