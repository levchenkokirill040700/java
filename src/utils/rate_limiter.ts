import { RateLimiterMongo, RateLimiterRes } from 'rate-limiter-flexible';
import { Request, Response } from 'express';
const mongoose = require('mongoose');
import Logger from './logger';
import Configs from './configs';



class LimiterWrapper {
    logger: Logger;
    med: RateLimiterMongo;
    long: RateLimiterMongo;
    search: RateLimiterMongo;
    configs: Configs;


    constructor() {
        this.configs = new Configs();
        const { url, database} = this.configs.getMongoConfigs();

        mongoose.connect(`mongodb://${url}/${database}`);

        this.logger = new Logger();

        this.med = new RateLimiterMongo({
            storeClient: mongoose.connection,
            keyPrefix: 'medium',
            points: 5,
            duration: 300,
            blockDuration: 1800
        });

        this.long = new RateLimiterMongo({
            storeClient: mongoose.connection,
            keyPrefix: 'long',
            points: 100,
            duration: 86400,
            blockDuration: 86400
        });

        this.search = new RateLimiterMongo({
            storeClient: mongoose.connection,
            keyPrefix: 'search',
            points: 20,
            duration: 10,
            blockDuration: 3600
        });
    }


    async loginCheck(req: Request) {
        const response = {
            blocked: false,
            remaining: 0
        };
    
        const ip = this.getIpAddress(req);
        const user = this.getUsername(req);

        this.logger.debug('login_check', { req });

        const results: (RateLimiterRes | null)[] = await Promise.all(
            [this.med.get(user), this.long.get(user), this.med.get(ip), this.long.get(ip)]
        );

        this.logger.debug('check_results', { req });

        const blockedTime = this.blockCheck(results);

        this.logger.debug(`block_time: ${blockedTime}`);

        if (blockedTime) {
            response.blocked = true;
            response.remaining = blockedTime;
        }

        return response;
    }

    async searchCheck(req: Request) {
        const response = {
            blocked: false,
            remaining: 0
        };

        const ip = this.getIpAddress(req);

        this.logger.debug(`search_check: ${ip}`, { req });

        const result: RateLimiterRes | null = await this.search.get(ip);

        this.logger.debug(`search_results: ${result}`, { req });

        if (result && result.remainingPoints && result.msBeforeNext > 0) {
            response.blocked = true;
            response.remaining = result.msBeforeNext;
        }

        this.logger.debug(`search_result: ${result}`, { req });

        return response;
    }

    clear(req: Request) {
        const ip = this.getIpAddress(req);
        const user = this.getUsername(req);

        Promise.all([
            this.med.delete(ip), this.med.delete(user), this.long.delete(ip), this.long.delete(user)
        ]).catch((e) => this.logger.error('clear rate limits', { err: e, req }));
    }

    async failedLogin(req: Request) {
        return Promise.all([
            this.logAttempt(this.getUsername(req)),
            this.logAttempt(this.getIpAddress(req))
        ]);      
    }

    async logAttempt(key: string) {
        return Promise.all([this.med.consume(key), this.long.consume(key)]);
    }

    async searchAttempt(req: Request) {
        return this.search.consume(this.getIpAddress(req));
    }

    getIpAddress(req: Request) {
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

    getUsername(req: Request) {
        return req.body.username;
    }

    blockCheck(results: (RateLimiterRes | null)[]) {
        return results.reduce((maxRemaining, result) => {
            if (result && result.remainingPoints === 0 && result.msBeforeNext > maxRemaining) {
                maxRemaining = result.msBeforeNext;
            }

            return maxRemaining;
        }, 0);
    }

    blockedResponse(res: Response, timeRemaining: number, message: string) {
        return res
            .set('Retry-After', String(Math.round(timeRemaining / 1000)))
            .status(429)
            .render('pages/error', { message });
    }
}


export = LimiterWrapper;
