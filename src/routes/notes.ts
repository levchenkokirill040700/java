import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import Notes from '../controllers/notes';

const notes = new Notes();

const router = express.Router();

router.get('/notes',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const result = await notes.getUsersNotes(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.render(
            'pages/notes/all',
            { user: req.user, notes: result.res }
        );
});

router.get('/note/:id/view',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const result = await notes.view(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.render(
            'pages/notes/one',
            { user: req.user, note: result.res}
        );
    }
);

router.post(
    '/note/:user_id',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const result = await notes.create(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.redirect(`/note/${result.res._id}/view`)
    }
);

router.post('/note/:id/update',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const result = await notes.update(req);

        if (result.error) {
            return res.redirect('/error');
        }

        res.redirect(`/note/${req.params.id}/view`);
    }
);

router.get('/note/:id/delete', 
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const result = await notes.delete(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.redirect('/notes');
});

router.get('/notes/search/:tag',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const result = await notes.searchTag(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.render(
            'pages/notes/all',
            { user: req.user, notes: result.res }
        );
    }
);


export = router;
