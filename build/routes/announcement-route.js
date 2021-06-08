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
const AnnounceController = __importStar(require("../controllers/announcement-controller"));
const express_1 = require("express");
const response_1 = require("./response");
const router = express_1.Router();
const commonDrops = ['updatedAt'];
router.get('/', (req, res) => {
    AnnounceController.getAll(commonDrops)
        .then((announcements) => response_1.success(res, announcements))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.post('/create', (req, res) => {
    AnnounceController.createAnnounce(req.body, commonDrops)
        .then((announcement) => response_1.success(res, announcement))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.get('/:id', (req, res) => {
    const id = +req.params.id;
    AnnounceController.getAnnounceById(id, commonDrops)
        .then((announcement) => response_1.success(res, announcement))
        .catch((err) => response_1.failure(res, err.name, 400));
});
exports.default = router;
