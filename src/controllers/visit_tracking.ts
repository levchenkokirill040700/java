import { Request } from 'express';
import useragent from 'express-useragent';
import Actions from '../utils/db_actions';
import Visit from '../models/visit';
import IpAddress from '../utils/ip_address';
import * as I from '../interfaces';

class VisitTracker {
    visit_actions: Actions;
    ip_address: IpAddress;

    constructor() {
        this.visit_actions = new Actions(Visit);
        this.ip_address = new IpAddress();
    }

    recordVisit(req: Request): void {
        const visitData = Object.assign(
            this._getReqData(req),
            this._getUADetails(req)
        );

        this.visit_actions.create(visitData)
    }

    private _getReqData(req: Request) {
        const ipAddress = this._getIpAddress(req);

        this.ip_address.save(ipAddress);
    
        const reqData: Partial<I.VisitDetails> = {
            timestamp: new Date(),
            ip_address: ipAddress,
            hostname: req.hostname,
            path: req.path
        };

        if (req.baseUrl) {
            reqData.base_url = req.baseUrl;
        }

        return reqData;
    }

    private _getUADetails(req: Request) {
        const uaDetails: Partial<I.VisitDetails> = {};
    
        if (req.headers['user-agent']) {
            const ua = useragent.parse(req.headers['user-agent']);

            [
                'browser',
                'version',
                'os',
                'platform',
                'source',
            ].forEach((field) => {
                if (ua[field]) uaDetails[field] = ua[field];
            });

            const details = this._getOtherDetails(ua);
    
            if (details.length > 0) {
                uaDetails.details = details;
            }
        }

        return uaDetails;
    }

    private _getOtherDetails(uaDetails: useragent.Details): string[] {
        return Object.entries(uaDetails).reduce((details: string[], [name, value]) => {
            if (typeof value === 'boolean' && value === true) {
                details.push(name.slice(2).toLowerCase());
            }

            return details;
        }, []);
    }

    private _getIpAddress(req: Request) {
        const ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || req.socket.remoteAddress;

        if (Array.isArray(ip)) return ip[0].trim();

        if (ip == null) return '127.0.0.1';

        if (typeof ip === 'string' && ip.includes(':') && ip.includes('.')) {
            const lastColon = ip.lastIndexOf(':');
            return ip.slice(lastColon + 1,);
        }

        return ip.split(',')[0].trim();
    }
}

export = VisitTracker;