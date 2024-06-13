import express, { Request, Response } from 'express';
import login from '../utils/login';

const router = express.Router();

router.get('/',
    (req: Request, res: Response) => {
        res.render('pages/portal', { message: undefined, user: req.user });
});

router.post('/portal', login);
  
router.get('/logout', (req: Request, res: Response) => {
    req.logout();
    res.redirect('/');
});

export = router;
