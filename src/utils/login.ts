import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import RateLimiter from './rate_limiter';
import Logger from './logger';

const rl = new RateLimiter();
const logger = new Logger();

async function login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local',
    async (err, user) => {
        logger.debug(user);
        const check = await rl.loginCheck(req);
    
        if (check.blocked) return rl.blockedResponse(res, check.remaining, 'To Many Bad Requests');

        if (err) return handelErrors(next, err, req);
  
        if (!user) {
            try {
                await rl.failedLogin(req);
                const check = await rl.loginCheck(req);
                if (check.blocked) return rl.blockedResponse(res, check.remaining, 'To Many Bad Requests');
                return res.render('pages/portal', { message: 'Username or Password is incorrect'});
            } catch (e: any) {
                if (e instanceof Error) return handelErrors(next, e, req);
                return rl.blockedResponse(res, e.msBeforeNext, 'To Many Bad Requests');
            }
        }

        req.logIn(user, async function(err) {
            if (err) return handelErrors(next, err, req);
  
            rl.clear(req);

            return res.redirect('/home');
        });
    })(req, res, next);
}

function handelErrors(next: NextFunction, err: Error, req: Request) {
    logger.error('bad login request', { err, req });
    return next(err);
}
 
export = login;
