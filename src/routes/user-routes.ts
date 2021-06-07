import * as UserController from '../controllers/user-controller';
import { failure, success } from './response';
import { Response, Request, Router } from 'express';

const router = Router();
const commonDrops = ['createdAt', 'updatedAt'];

router.get('/', (req: Request, res: Response) => {
    UserController.getAllUsers()
        .then((users) => success(res, users as object))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/create', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password'];
    UserController.createUser(req.body, drops)
        .then((newUser) => success(res, newUser))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/login', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password'];
    UserController.login(req.body, drops)
        .then((user) => success(res, user))
        .catch((err) => failure(res, err.name, 400));
});

router.get('/by-premail', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password', 'refreshToken'];
    const tokenStr = req.headers.authorization as string;
    UserController.getUserByPremail(tokenStr, req.body, drops)
        .then((response) => success(res, response))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/update', (req: Request, res: Response) => {
    const drops = [...commonDrops, 'password', 'refreshToken'];
    const tokenStr = req.headers.authorization as string;
    UserController.update(tokenStr, req.body, drops)
        .then((user) => success(res, user as object))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/update-token', (req: Request, res: Response) => {
    UserController.updateRefreshToken(req.body, commonDrops)
        .then((response) => success(res, response))
        .catch((err) => failure(res, err.name, 400));
});

export default router;
