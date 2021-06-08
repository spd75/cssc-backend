import * as AnnounceController from '../controllers/announcement-controller';
import { Response, Request, Router } from 'express';
import { failure, success } from './response';

const router = Router();
const commonDrops = ['updatedAt'];

router.get('/', (req: Request, res: Response) => {
    AnnounceController.getAll(commonDrops)
        .then((announcements) => success(res, announcements))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/create', (req: Request, res: Response) => {
    AnnounceController.createAnnounce(req.body, commonDrops)
        .then((announcement) => success(res, announcement))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/:id', (req: Request, res: Response) => {
    const id = +req.body.id;
    AnnounceController.getAnnounceById(id, commonDrops)
        .then((announcement) => success(res, announcement))
        .catch((err) => failure(res, err.name, 400));
});

export default router;
