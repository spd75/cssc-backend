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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controllers/user-controller"));
const response_1 = require("./response");
const router = express_1.default.Router();
const commonDrops = ['createdAt', 'updatedAt'];
router.get('/', (req, res) => {
    userController
        .getAllUsers()
        .then((users) => response_1.success(res, users))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.get('/check-token', (req, res) => {
    const drops = [...commonDrops, 'password', 'refreshToken'];
    const tokenStr = req.headers.authorization;
    userController
        .checkValidToken(tokenStr, req.body, drops)
        .then((response) => response_1.success(res, response))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.post('/update-token', (req, res) => {
    userController
        .updateRefreshToken(req.body, commonDrops)
        .then((response) => response_1.success(res, response))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.post('/login', (req, res) => {
    userController
        .login(req.body, commonDrops)
        .then((user) => response_1.success(res, user))
        .catch((err) => response_1.failure(res, err.name, 400));
});
router.post('/create', (req, res) => {
    const drops = [...commonDrops];
    userController
        .createUser(req.body, drops)
        .then((newUser) => response_1.success(res, newUser))
        .catch((err) => response_1.failure(res, err.name, 400));
});
exports.default = router;
