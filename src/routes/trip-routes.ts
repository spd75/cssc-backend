import * as TripController from '../controllers/trip-controller';
import { failure, success } from './response';
import { Response, Request, Router } from 'express';

const router = Router();
const commonDrops = ['createdAt', 'updatedAt'];

router.get('/', (req: Request, res: Response) => {
    TripController.getAllTrips()
        .then((trips) => success(res, trips))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/create', (req: Request, res: Response) => {
    TripController.createTrip(req.body, commonDrops)
        .then((newTrip) => success(res, newTrip))
        .catch((err) => failure(res, err.name, 400));
});

router.get('/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    TripController.getTripById(id, commonDrops)
        .then((trip) => success(res, trip))
        .catch((err) => failure(res, err.name, 400));
});

router.post('/update/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    TripController.updateTrip(id, req.body, commonDrops)
        .then((updatedTrip) => success(res, updatedTrip))
        .catch((err) => failure(res, err.name, 400));
});

export default router;
