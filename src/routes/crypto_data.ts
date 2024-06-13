import express, { Request, Response } from 'express';
import CryptoData from '../controllers/crypto_data'
import RateLimiter from '../utils/rate_limiter';

const router = express.Router();
const cryptoData = new CryptoData();
const rateLimiter = new RateLimiter();


router.get('/crypto/markets',
    async (req: Request, res: Response) => {
        const rateCheck = await rateLimiter.searchCheck(req);

        if (rateCheck.blocked) {
            rateLimiter.blockedResponse(res, rateCheck.remaining, 'Too Many Queries');
        }

        const data = await cryptoData.getCoinList();

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/markets', {
            user: req.user,
            data: data.res.prepped,
            cats: data.res.categoryInfo,
            cache_time: data.res.cache_time
        });
    }
);

router.get('/crypto/coin/:id',
    async(req: Request, res: Response) => {
        const rateCheck = await rateLimiter.searchCheck(req);

        if (rateCheck.blocked) {
            rateLimiter.blockedResponse(res, rateCheck.remaining, 'Too Many Queries');
        }

        const id = req.params.id;

        const opts = {
            id,
            unit: 'days',
            value: 30
        }
    
        const data = await cryptoData.getCoinData(opts);

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/coin', {
            user: req.user,
            market_data: data.res.market_data
        });
    }
);

router.get('/crypto/cat/:cat',
    async(req: Request, res: Response) => {
        const rateCheck = await rateLimiter.searchCheck(req);

        if (rateCheck.blocked) {
            rateLimiter.blockedResponse(res, rateCheck.remaining, 'Too Many Queries');
        }

        const { cat } = req.params;

        const data = await cryptoData.coinsByCatCode(cat);

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/markets', {
            user: req.user,
            data: data.res.prepped,
            cats: data.res.categoryInfo,
            cache_time: data.res.cache_time
        });
    }
);

router.get('/crypto/catfull/:cat',
    async(req: Request, res: Response) => {
        const rateCheck = await rateLimiter.searchCheck(req);

        if (rateCheck.blocked) {
            rateLimiter.blockedResponse(res, rateCheck.remaining, 'Too Many Queries');
        }

        const { cat } = req.params;

        const data = await cryptoData.coinsByCat(cat);

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/markets', {
            user: req.user,
            data: data.res.prepped,
            cats: data.res.categoryInfo,
            cache_time: data.res.cache_time
        });
    }
);

router.get('/crypto/cached_markets',
    async(req: Request, res: Response) => { 
        const data = await cryptoData.getCoinList();

        res.send({
            user: req.user,
            data: data.res.prepped,
            cache_time: data.res.cache_time
        });
    }
);

export = router;
