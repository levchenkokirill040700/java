import mongoose from 'mongoose';

import Configs from './configs';
import Logger from './logger';


class DB {
    logger: Logger;
    configs: Configs;
    db: any;

    constructor() {
        this.logger = new Logger();
        this.configs = new Configs();
        this.db;
    }

    async connect() {
        const mongoSettings = this.configs.getMongoConfigs();

        const url = `mongodb://${mongoSettings.url}/${mongoSettings.database}`;

        try {
            this.db = await mongoose.connect(url);
        } catch(e: unknown) {
            this.logger.fatal('could not connect to db', { err: e });
        }
    }

    async close() {
        await mongoose.disconnect();
    }
}

export = DB;
