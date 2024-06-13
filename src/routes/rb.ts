import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import multer from 'multer';
import permissions from '../utils/permissions';

import RB from '../controllers/rb';
import RUtils from '../utils/route_utils';

const routeUtils = new RUtils();
const rb = new RB();
const router = express.Router();

const upload = multer({ storage: routeUtils.imgStorage('rb_imgs') });

router.get('/rootbeer',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        res.render('pages/rb/home', { user: req.user });
    }
);

router.post(
    '/rb_create',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    upload.single('rb_image'),
    async (req: Request, res: Response) => {
        const create = await rb.create(req);

        if (create.error) {
            return res.redirect('/error');
        }

        res.redirect(`/rb/${create.res._id}`);
});

router.post(
    '/rb_update/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    upload.single('rb_image'),
    async (req: Request, res: Response) => {
        const update = await rb.update(req);

        if (update.error) {
            return res.redirect('/error');
        }

        res.redirect(`/rb/${req.params.id}`);
});

router.post('/rb_search',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const search = await rb.webSearch(req, 'name');

        if (search.error) {
            return res.redirect('/error');
        }
    
        res.render('pages/rb/display', {
            user: req.user,
            results: search.res
        });
    }
);

router.get('/rb/:id', 
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const view = await rb.viewRbInfo(req);

        if (view.error) {
            res.redirect('/error');
        }

        res.render('pages/rb/view', {
            user: req.user,
            rb: view.res.rb,
            ratings: view.res.ratings,
            avg: view.res.avg,
            writeUps: view.res.writeUps
        });
});

router.get('/rb_mine',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const users = await rb.getUsersRb(req);

        if (users.error) {
            return res.redirect('/error');
        }

        res.render('pages/rb/display', {
            user: req.user,
            results: users.res
        });
    }
);

router.get('/rb_every',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const every = await rb.getEveryRb();

        if (every.error) {
            return res.redirect('/error');
        }

        res.render('pages/rb/display', {
            user: req.user,
            results: every.res
        });
    }
);

export = router;
