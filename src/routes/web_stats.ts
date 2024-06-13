import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import WebStats from '../controllers/web_stats';
import * as I from '../interfaces';

const router = express.Router();
const stats = new WebStats();

router.get('/web_stats',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    async (req: Request, res: Response) => {
        const data: I.StatsData = await stats.getData(30, 'days');

        if (data.error) {
            return res.redirect('/error');
        }
          
        res.render('pages/web_stats', {
            user: req.user,
            options: makeOptions(data),
            countByPage: data.tallyByPage,
            countByIp: data.tallyByIp,
            countByOs: data.tallyByOs,
            countByBrowser: data.tallyByBrowser,
            countyByCountry: data.tallyByCountry,
            visitsUniq: data.uniqueVisits,
            visitsTotal: data.totalVisits
        });
    }
);

router.post('/web_stats',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    async (req: Request, res: Response) => {
        if (!req.body && !req.body.period && !req.body.unit) {
            res.redirect('/error');
        }

        const data: I.StatsData = await stats.getData(Number(req.body.period), req.body.unit);

        res.render('pages/web_stats', {
            user: req.user,
            options: makeOptions(data),
            countByPage: data.tallyByPage,
            countByIp: data.tallyByIp,
            countByOs: data.tallyByOs,
            countByBrowser: data.tallyByBrowser,
            countyByCountry: data.tallyByCountry,
            visitsUniq: data.uniqueVisits,
            visitsTotal: data.totalVisits
        });
    }
)

export = router;

function makeOptions(data: I.StatsData) {
    return {
        chart: {
          type: 'line',
          height: '400px'
        },
        series: [
            {
                name: 'total-visits',
                data: Object.values(data.totalVisitsOverTime)
            },
            {
                name: 'unique-visits',
                data: Object.values(data.uniqueVisitsOverTime)
            }
        ],
        xaxis: {
            type: 'category',
            categories: Object.keys(data.totalVisitsOverTime),
            labels: {
                show: true,
                rotateAlways: true,
                rotate: -45
            }
        },
        yaxis: {
            show: true
        }
      }
}