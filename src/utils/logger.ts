import path from 'path';
import bunyan from 'bunyan';
import { Request, Response } from 'express';
import Configs from './configs';
import * as I from '../interfaces';

class Logger {
    logger: bunyan
    configs: Configs;

    constructor() {
        this.configs = new Configs();
        const { log_path, log_level } = this.configs.getLogConfigs();

        this.logger = bunyan.createLogger({
            name: 'rb_site',
            streams: [
                {
                    level: log_level,
                    path: path.join(log_path, 'info'),
                    type: 'rotating-file',
                    period: '1m',
                    count: 12
                },
                {
                    level: 'error',
                    path: path.join(log_path, 'error'),
                    type: 'rotating-file',
                    period: '1m',
                    count: 12
                },
                {
                    level: 'fatal',
                    path: path.join(log_path, 'fatal'),
                    type: 'rotating-file',
                    period: '1m',
                    count: 12
                }
            ]
        });
    }

    debug(msg: string, logObj: I.LogObject = { req: undefined }) {
        this.logger.debug(this._makeLogData(logObj), msg);
    }

    info(msg: string, logObj: I.LogObject = { req: undefined }) {
        if (logObj.req == null) {
            this.logger.info(msg);
            return;    
        }
    
        this.logger.info(this._makeLogData(logObj), msg);
    }

    error(msg: string, errObj: I.LogObject) {
        this.logger.error(this._makeLogData(errObj), msg);
    }

    fatal(msg:string, fatalObj: I.LogObject) {
        this.logger.error(msg, fatalObj);
        process.exit(1);
    }

    private _makeLogData(logObj: I.LogObject ): any {
        const logData: {
            err?: unknown,
            route?: Request['route'],
            res?: Response
         } = {};
    
        if (logObj.err) {
            logData.err = logObj.err;
        }

        if (logObj.req) {
            logData.route = logObj.req.route;
        }
    }
}

export = Logger;
