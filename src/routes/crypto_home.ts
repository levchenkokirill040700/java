import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import CryptoTransaction from '../controllers/crypto_transaction';
import Pool from '../controllers/pool';


const router = express.Router();
const cryptoTransaction = new CryptoTransaction();
const pool = new Pool();

router.post(
    '/add_crypto_transaction',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const transaction = await cryptoTransaction.create(req);

        if (transaction.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

router.get(
    '/transactions/:id/delete',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const transaction = await cryptoTransaction.delete(req);

        if (transaction.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

router.post(
    '/add_pool',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const resp = await pool.create(req);

        if (resp.error) {
            return res.redirect('/error');
        }

        res.redirect(`/home`);
});


export = router;
