import Express, { NextFunction, Response, Request } from 'express';
import * as userController from '../controllers/user-controller';
import { failure, success } from './response';

const router = Express.Router();
const commonDrops = ['createdAt', 'updatedAt'];

router.get('/', (req: Request, res: Response) => {
    userController
        .getAllUsers()
        .then((users) => success(res, users as object))
        .catch((err) => failure(res, err.name, 400));
});

router.get('/check-token', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password', 'refreshToken'];
    const tokenStr = req.headers.authorization as string;
    userController
        .checkValidToken(tokenStr, req.body, drops)
        .then((response) => success(res, response))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/update-token', (req: Request, res: Response) => {
    userController
        .updateRefreshToken(req.body, commonDrops)
        .then((response) => success(res, response))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/login', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password'];
    userController
        .login(req.body, drops)
        .then((user) => success(res, user))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/create', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password'];
    userController
        .createUser(req.body, drops)
        .then((newUser) => success(res, newUser))
        .catch((err) => failure(res, err.name, 400));
});

export default router;
