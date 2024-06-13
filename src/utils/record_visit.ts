import { Request, Response, NextFunction } from 'express';
import Visit from '../controllers/visit_tracking';

const visit = new Visit();

function trackVisit(req: Request, res: Response, next: NextFunction) {
    visit.recordVisit(req);
    next();
}

export = trackVisit;