import express, { Request, Response } from 'express';
import RateLimiter from '../utils/rate_limiter';
import RB from '../controllers/rb';
import * as I from '../interfaces';

const router = express.Router();

const rb = new RB();
const rateLimiter = new RateLimiter();

router.get('/public_rbs', async (req: Request, res: Response) => {
    const result: I.Result = await rb.getEveryRb();

    if (result.error) {
        res.redirect('/error');
    }

    res.render('pages/public/rootbeers', { user: req.user, results: result.res });
});

router.post('/pub_search',
    async (req: Request, res: Response) => {
        const rateCheck = await rateLimiter.searchCheck(req);

        if (rateCheck.blocked) {
            rateLimiter.blockedResponse(res, rateCheck.remaining, 'Too Many Searches');
        }

        const result = await rb.webSearch(req, 'name');

        if (result.error) {
            return res.redirect('/error');
        }

        try {
            rateLimiter.searchAttempt(req);
        } catch (e: any) {
            if (e instanceof Error) return res.redirect('/error');
            return rateLimiter.blockedResponse(res, e.msBeforeNext, 'To Many Bad Requests');
        }
    
        res.render('pages/public/rootbeers', {
            results: result.res,
            user: req.user
        });
    }
);

router.get('/public_rb/:id', 
    async (req: Request, res: Response) => {
        const view = await rb.viewRbInfo(req);

        if (view.error) {
            res.redirect('/error');
        }

        res.render('pages/public/view_rb', {
            user: req.user,
            rb: view.res.rb,
            ratings: view.res.ratings,
            avg: view.res.avg,
            writeUps: view.res.writeUps
        });
});

router.get('/rb_about',(req: Request, res: Response) => {
    res.render('pages/public/about', { user: req.user });
});


export = router;
