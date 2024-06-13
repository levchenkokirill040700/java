import express, { Request, Response } from 'express';

import portal from './portal';
import user from './user';
import rb from './rb';
import rate from './ratings';
import pub from './public';
import webStats from './web_stats';
import cryptoData from './crypto_data';
import coinPurchase from './crypto_home';
import notes from './notes';
import Logger from '../utils/logger';

const log = new Logger();

const router = express.Router();

router.use(portal);
router.use(user);
router.use(rb);
router.use(rate);
router.use(pub);
router.use(webStats);
router.use(cryptoData);
router.use(coinPurchase);
router.use(notes);

router.get('/error', (req: Request, res: Response) => {
    log.error('bad request', { err: new Error('bad request'), req })
    res.render('pages/error', { message: undefined });
});

 export = router;
